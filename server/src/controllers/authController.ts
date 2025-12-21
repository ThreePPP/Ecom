import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Generate JWT Token
const generateToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phoneNumber, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'อีเมลนี้ถูกใช้งานแล้ว',
      });
      return;
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      res.status(400).json({
        success: false,
        message: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว',
      });
      return;
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          coins: user.coins || 0,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'กรุณากรอกอีเมลและรหัสผ่าน',
      });
      return;
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          coins: user.coins || 0,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          role: user.role,
          isVerified: user.isVerified,
          coins: user.coins || 0,
        },
      },
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { firstName, lastName, phoneNumber, dateOfBirth } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phoneNumber: phoneNumber || user.phoneNumber,
        dateOfBirth: dateOfBirth || user.dateOfBirth,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'อัพเดทข้อมูลสำเร็จ',
      data: {
        user: {
          id: updatedUser?._id,
          firstName: updatedUser?.firstName,
          lastName: updatedUser?.lastName,
          email: updatedUser?.email,
          phoneNumber: updatedUser?.phoneNumber,
          dateOfBirth: updatedUser?.dateOfBirth,
          role: updatedUser?.role,
        },
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล',
    });
  }
};
