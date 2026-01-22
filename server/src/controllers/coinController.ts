import { Request, Response } from 'express';
import mongoose from 'mongoose';
import CoinTransaction from '../models/CoinTransaction';
import User from '../models/User';
import AdminNotification from '../models/AdminNotification';
import TopupRequest from '../models/TopupRequest';

// Get coin transactions for user
export const getCoinTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ',
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const transactions = await CoinTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await CoinTransaction.countDocuments({ userId });

    // Get user's current coin balance
    const user = await User.findById(userId).select('coins');

    res.status(200).json({
      success: true,
      data: {
        transactions,
        currentBalance: user?.coins || 0,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching coin transactions:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการ',
      error: error.message,
    });
  }
};

// Add coins (for topup or earn)
export const addCoins = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const { amount, type, description, orderId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'จำนวนคอยน์ต้องมากกว่า 0',
      });
    }

    // Update user's coin balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
    }

    const newBalance = (user.coins || 0) + amount;
    user.coins = newBalance;
    await user.save();

    // Create transaction record
    const transaction = new CoinTransaction({
      userId,
      type: type || 'topup',
      amount,
      description: description || 'เติมเงิน',
      orderId,
      balanceAfter: newBalance,
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'เพิ่มคอยน์สำเร็จ',
      data: {
        transaction,
        newBalance,
      },
    });
  } catch (error: any) {
    console.error('Error adding coins:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มคอยน์',
      error: error.message,
    });
  }
};

// Spend coins
export const spendCoins = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const { amount, description, orderId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'จำนวนคอยน์ต้องมากกว่า 0',
      });
    }

    // Check user's coin balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
    }

    if ((user.coins || 0) < amount) {
      return res.status(400).json({
        success: false,
        message: 'คอยน์ไม่เพียงพอ',
      });
    }

    const newBalance = (user.coins || 0) - amount;
    user.coins = newBalance;
    await user.save();

    // Create transaction record
    const transaction = new CoinTransaction({
      userId,
      type: 'spend',
      amount: -amount,
      description: description || 'ใช้คอยน์',
      orderId,
      balanceAfter: newBalance,
    });

    await transaction.save();

    // Create admin notification for coin redemption
    const notification = new AdminNotification({
      type: 'coin_redeem',
      title: '🪙 มีการแลก Coins',
      message: `${user.firstName} ${user.lastName} ได้แลก ${amount.toLocaleString()} coins`,
      data: {
        userId: user._id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        amount: amount,
      },
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: 'ใช้คอยน์สำเร็จ',
      data: {
        transaction,
        newBalance,
      },
    });
  } catch (error: any) {
    console.error('Error spending coins:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการใช้คอยน์',
      error: error.message,
    });
  }
};

// Get coin summary
export const getCoinSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ',
      });
    }

    const user = await User.findById(userId).select('coins');

    // Convert userId to ObjectId for aggregate pipeline
    const userObjectId = new mongoose.Types.ObjectId(userId.toString());

    // Calculate total earned and spent
    const earnedResult = await CoinTransaction.aggregate([
      { $match: { userId: userObjectId, type: { $in: ['earn', 'topup'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const spentResult = await CoinTransaction.aggregate([
      { $match: { userId: userObjectId, type: { $in: ['spend', 'deduct'] } } },
      { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        currentBalance: user?.coins || 0,
        totalEarned: earnedResult[0]?.total || 0,
        totalSpent: spentResult[0]?.total || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching coin summary:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสรุป',
      error: error.message,
    });
  }
};

// Admin: Add coins to any user
export const adminAddCoins = async (req: Request, res: Response) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ User ID',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'จำนวนคอยน์ต้องมากกว่า 0',
      });
    }

    // Find user and update coin balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
    }

    const newBalance = (user.coins || 0) + amount;
    user.coins = newBalance;
    await user.save();

    // Create transaction record
    const transaction = new CoinTransaction({
      userId,
      type: 'topup',
      amount,
      description: description || 'เติมคอยน์โดยแอดมิน',
      balanceAfter: newBalance,
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: `เพิ่ม ${amount.toLocaleString()} coins ให้ ${user.firstName} ${user.lastName} สำเร็จ`,
      data: {
        transaction,
        newBalance,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          coins: newBalance,
        },
      },
    });
  } catch (error: any) {
    console.error('Error admin adding coins:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มคอยน์',
      error: error.message,
    });
  }
};

// Admin: Remove coins from any user
export const adminRemoveCoins = async (req: Request, res: Response) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ User ID',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'จำนวนคอยน์ต้องมากกว่า 0',
      });
    }

    // Find user and check coin balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
    }

    const currentBalance = user.coins || 0;
    if (currentBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `คอยน์ไม่เพียงพอ (ยอดปัจจุบัน: ${currentBalance} coins)`,
      });
    }

    const newBalance = currentBalance - amount;
    user.coins = newBalance;
    await user.save();

    // Create transaction record
    const transaction = new CoinTransaction({
      userId,
      type: 'deduct',
      amount: -amount,
      description: description || 'หักคอยน์โดยแอดมิน',
      balanceAfter: newBalance,
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: `หัก ${amount.toLocaleString()} coins จาก ${user.firstName} ${user.lastName} สำเร็จ`,
      data: {
        transaction,
        newBalance,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          coins: newBalance,
        },
      },
    });
  } catch (error: any) {
    console.error('Error admin removing coins:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการหักคอยน์',
      error: error.message,
    });
  }
};

// Submit topup request with receipt
export const submitTopupRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const { amount, receiptImage, note, username } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'จำนวนเงินต้องมากกว่า 0',
      });
    }

    if (!receiptImage) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาอัพโหลดใบเสร็จการโอนเงิน',
      });
    }

    if (!username || username.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุชื่อผู้ใช้',
      });
    }

    // Get user info
    const user = await User.findById(userId).select('firstName lastName email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
    }

    // Create topup request
    const topupRequest = new TopupRequest({
      userId,
      username: username.trim(),
      amount,
      receiptImage,
      note,
      status: 'pending',
    });

    await topupRequest.save();

    // Create admin notification
    const notification = new AdminNotification({
      type: 'topup_request',
      title: '💰 คำขอเติมเงิน',
      message: `${user.firstName} ${user.lastName} ส่งคำขอเติมเงิน ${amount.toLocaleString()} บาท`,
      data: {
        topupRequestId: topupRequest._id as unknown as mongoose.Types.ObjectId,
        userId: user._id as unknown as mongoose.Types.ObjectId,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        amount: amount,
        receiptImage: receiptImage,
      },
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: 'ส่งคำขอเติมเงินสำเร็จ กรุณารอ Admin อนุมัติ',
      data: {
        topupRequest,
      },
    });
  } catch (error: any) {
    console.error('Error submitting topup request:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งคำขอเติมเงิน',
      error: error.message,
    });
  }
};

// Get user's topup requests
export const getMyTopupRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบ',
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const topupRequests = await TopupRequest.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await TopupRequest.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        topupRequests,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching topup requests:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอเติมเงิน',
      error: error.message,
    });
  }
};

// Admin: Get all topup requests
export const adminGetTopupRequests = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const topupRequests = await TopupRequest.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await TopupRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        topupRequests,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Error admin fetching topup requests:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอเติมเงิน',
      error: error.message,
    });
  }
};

// Admin: Process (approve/reject) topup request
export const adminProcessTopupRequest = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?._id;
    const { requestId } = req.params;
    const { action, adminNote } = req.body; // action: 'approve' | 'reject'

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ Request ID',
      });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ action (approve หรือ reject)',
      });
    }

    const topupRequest = await TopupRequest.findById(requestId).populate('userId', 'firstName lastName email coins');
    if (!topupRequest) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบคำขอเติมเงิน',
      });
    }

    if (topupRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'คำขอนี้ได้รับการดำเนินการแล้ว',
      });
    }

    const user = await User.findById(topupRequest.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
    }

    if (action === 'approve') {
      // Add coins to user
      const newBalance = (user.coins || 0) + topupRequest.amount;
      user.coins = newBalance;
      await user.save();

      // Create coin transaction
      const transaction = new CoinTransaction({
        userId: user._id,
        type: 'topup',
        amount: topupRequest.amount,
        description: `เติมเงินผ่านการโอน (อนุมัติโดย Admin)`,
        balanceAfter: newBalance,
      });
      await transaction.save();

      // Update topup request
      topupRequest.status = 'approved';
      topupRequest.adminNote = adminNote;
      topupRequest.processedBy = adminId;
      topupRequest.processedAt = new Date();
      await topupRequest.save();

      res.status(200).json({
        success: true,
        message: `อนุมัติการเติมเงิน ${topupRequest.amount.toLocaleString()} coins สำเร็จ`,
        data: {
          topupRequest,
          transaction,
          newBalance,
        },
      });
    } else {
      // Reject request
      topupRequest.status = 'rejected';
      topupRequest.adminNote = adminNote;
      topupRequest.processedBy = adminId;
      topupRequest.processedAt = new Date();
      await topupRequest.save();

      res.status(200).json({
        success: true,
        message: 'ปฏิเสธคำขอเติมเงินสำเร็จ',
        data: {
          topupRequest,
        },
      });
    }
  } catch (error: any) {
    console.error('Error processing topup request:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดำเนินการคำขอเติมเงิน',
      error: error.message,
    });
  }
};
