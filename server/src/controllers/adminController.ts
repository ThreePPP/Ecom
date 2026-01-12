import { Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import CoinTransaction from '../models/CoinTransaction';
import AdminNotification from '../models/AdminNotification';
import { AuthRequest } from '../middleware/auth';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
      },
    });
  } catch (error: any) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();

    // Get coin transaction summary for each user
    const usersWithCoinInfo = await Promise.all(
      users.map(async (user) => {
        // Count total spent coins
        const spentResult = await CoinTransaction.aggregate([
          { $match: { userId: user._id, type: { $in: ['spend', 'deduct'] } } },
          { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
        ]);

        // Count total earned/topup coins
        const earnedResult = await CoinTransaction.aggregate([
          { $match: { userId: user._id, type: { $in: ['earn', 'topup'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        // Get last transaction date
        const lastTransaction = await CoinTransaction.findOne({ userId: user._id })
          .sort({ createdAt: -1 })
          .select('createdAt type amount')
          .lean();

        return {
          ...user,
          coinStats: {
            totalSpent: spentResult[0]?.total || 0,
            totalEarned: earnedResult[0]?.total || 0,
            lastTransaction: lastTransaction || null,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      data: { users: usersWithCoinInfo },
    });
  } catch (error: any) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'อัพเดทสิทธิ์ผู้ใช้สำเร็จ',
      data: { user },
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'ลบผู้ใช้สำเร็จ',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Get admin notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
export const getAdminNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = unreadOnly === 'true' ? { isRead: false } : {};

    const notifications = await AdminNotification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await AdminNotification.countDocuments(query);
    const unreadCount = await AdminNotification.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/admin/notifications/:id/read
// @access  Private/Admin
export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบการแจ้งเตือน',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { notification },
    });
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/admin/notifications/read-all
// @access  Private/Admin
export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await AdminNotification.updateMany({ isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'อ่านการแจ้งเตือนทั้งหมดแล้ว',
    });
  } catch (error: any) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Get all products for admin (including inactive)
// @route   GET /api/admin/products
// @access  Private/Admin
export const getAllProductsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { 
        products,
        total: products.length
      },
    });
  } catch (error: any) {
    console.error('Get all products admin error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};
