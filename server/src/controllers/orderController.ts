import { Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import CoinTransaction from '../models/CoinTransaction';
import AdminNotification from '../models/AdminNotification';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal: clientSubtotal, vat: clientVat, discount: clientDiscount, total: clientTotal } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'กรุณาเลือกสินค้า',
      });
      return;
    }

    // Validate and prepare order items
    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        res.status(404).json({
          success: false,
          message: `ไม่พบสินค้า: ${item.productId}`,
        });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `สินค้า ${product.name} ไม่เพียงพอ`,
        });
        return;
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: item.price || product.price,
        image: item.image || product.images?.[0] || '/placeholder.jpg',
      });

      calculatedSubtotal += (item.price || product.price) * item.quantity;

      // Update product stock and sold count
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save();
    }

    // Use client-provided values or calculate
    const subtotal = clientSubtotal || calculatedSubtotal;
    const vatRate = 0.07;
    const vat = clientVat || (subtotal * vatRate);
    const discount = clientDiscount || 0;
    const shippingFee = 0; // Free shipping
    const total = clientTotal || (subtotal + vat + shippingFee - discount);

    // Validate coin balance for coin_payment
    if (paymentMethod === 'coin_payment') {
      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้' });
        return;
      }
      if (user.coins < total) {
        res.status(400).json({
          success: false,
          message: 'ยอด Coin ไม่เพียงพอสำหรับชำระสินค้านี้',
        });
        return;
      }
    }

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${String(orderCount + 1).padStart(5, '0')}`;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      discount,
      total,
    });

    // Process coin payment
    if (paymentMethod === 'coin_payment') {
      const user = await User.findById(req.user._id);
      if (user) {
        user.coins -= total;
        await user.save();

        await CoinTransaction.create({
          userId: user._id,
          referenceNumber: `TRX-${Date.now()}`,
          type: 'spend',
          amount: total,
          description: `ชำระค่าสินค้า #${order.orderNumber}`,
          orderId: order._id,
          balanceAfter: user.coins,
        });

        order.paymentStatus = 'paid';
        order.paidAt = new Date();
        order.orderStatus = 'processing';
        await order.save();
      }
    }

    // Clear cart after successful order
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] }
    );

    // Create Admin Notification
    await AdminNotification.create({
      type: 'new_order',
      title: 'มีคำสั่งซื้อใหม่',
      message: `คำสั่งซื้อ #${order.orderNumber} ยอดรวม ${total.toLocaleString()} บาท`,
      data: {
        orderId: order._id,
        userId: req.user._id,
        userName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
        amount: total
      }
    });

    res.status(201).json({
      success: true,
      message: 'สั่งซื้อสำเร็จ',
      data: { order },
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ',
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบออเดอร์',
      });
      return;
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์เข้าถึงออเดอร์นี้',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบออเดอร์',
      });
      return;
    }

    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.orderStatus = 'processing';

    await order.save();

    res.status(200).json({
      success: true,
      message: 'อัพเดทสถานะการชำระเงินสำเร็จ',
      data: { order },
    });
  } catch (error: any) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบออเดอร์',
      });
      return;
    }

    order.orderStatus = status;

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date();

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, sold: -item.quantity },
        });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'อัพเดทสถานะออเดอร์สำเร็จ',
      data: { order },
    });
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({})
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { orders },
    });
  } catch (error: any) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบคำสั่งซื้อ',
      });
      return;
    }

    // Restore product stock if order is not cancelled
    if (order.orderStatus !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, sold: -item.quantity },
        });
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'ลบคำสั่งซื้อสำเร็จ',
    });
  } catch (error: any) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบคำสั่งซื้อ',
    });
  }
};
