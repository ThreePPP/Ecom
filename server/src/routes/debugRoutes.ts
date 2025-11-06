import express from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Cart from '../models/Cart';
import Order from '../models/Order';

const router = express.Router();

// @desc    Get all users (for debugging)
// @route   GET /api/debug/users
// @access  Public (ควรเป็น Admin ใน Production)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get user by email
// @route   GET /api/debug/users/:email
// @access  Public (ควรเป็น Admin ใน Production)
router.get('/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get database stats
// @route   GET /api/debug/stats
// @access  Public (ควรเป็น Admin ใน Production)
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const cartCount = await Cart.countDocuments();
    const orderCount = await Order.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        users: userCount,
        products: productCount,
        carts: cartCount,
        orders: orderCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Delete all users (for testing only)
// @route   DELETE /api/debug/users
// @access  Public (ควรเป็น Admin ใน Production)
router.delete('/users', async (req, res) => {
  try {
    await User.deleteMany({});
    
    res.status(200).json({
      success: true,
      message: 'ลบผู้ใช้ทั้งหมดแล้ว',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
