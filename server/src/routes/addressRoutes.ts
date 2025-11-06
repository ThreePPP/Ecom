import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { Response } from 'express';

const router = Router();

// Get all shipping addresses
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
    }

    res.json({
      success: true,
      data: user.shippingAddresses,
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงที่อยู่',
    });
  }
});

// Add new shipping address
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phoneNumber, address, district, province, postalCode, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.shippingAddresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Add new address
    user.shippingAddresses.push({
      fullName,
      phoneNumber,
      address,
      district,
      province,
      postalCode,
      isDefault: isDefault || false,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'เพิ่มที่อยู่สำเร็จ',
      data: user.shippingAddresses,
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มที่อยู่',
    });
  }
});

// Update shipping address
router.put('/:addressId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { addressId } = req.params;
    const { fullName, phoneNumber, address, district, province, postalCode, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
    }

    const addressIndex = user.shippingAddresses.findIndex(
      addr => addr._id?.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบที่อยู่',
      });
    }

    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.shippingAddresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update address
    user.shippingAddresses[addressIndex] = {
      ...user.shippingAddresses[addressIndex],
      fullName,
      phoneNumber,
      address,
      district,
      province,
      postalCode,
      isDefault: isDefault || false,
    };

    await user.save();

    res.json({
      success: true,
      message: 'อัพเดทที่อยู่สำเร็จ',
      data: user.shippingAddresses,
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเดทที่อยู่',
    });
  }
});

// Delete shipping address
router.delete('/:addressId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
    }

    user.shippingAddresses = user.shippingAddresses.filter(
      addr => addr._id?.toString() !== addressId
    );

    await user.save();

    res.json({
      success: true,
      message: 'ลบที่อยู่สำเร็จ',
      data: user.shippingAddresses,
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบที่อยู่',
    });
  }
});

// Set default address
router.patch('/:addressId/default', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้',
      });
    }

    // Unset all defaults
    user.shippingAddresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set new default
    const addressIndex = user.shippingAddresses.findIndex(
      addr => addr._id?.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบที่อยู่',
      });
    }

    user.shippingAddresses[addressIndex].isDefault = true;

    await user.save();

    res.json({
      success: true,
      message: 'ตั้งค่าที่อยู่เริ่มต้นสำเร็จ',
      data: user.shippingAddresses,
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตั้งค่าที่อยู่เริ่มต้น',
    });
  }
});

export default router;
