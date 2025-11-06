import express, { Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// @desc    Upload single image
// @route   POST /api/upload
// @access  Private (ต้อง login)
router.post(
  '/',
  authenticate,
  upload.single('image'),
  (req: Request, res: Response): void => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'กรุณาเลือกไฟล์รูปภาพ',
        });
        return;
      }

      // สร้าง URL ของรูปภาพ
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: 'อัพโหลดรูปภาพสำเร็จ',
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          url: imageUrl,
        },
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัพโหลด',
        error: error.message,
      });
    }
  }
);

// @desc    Upload multiple images (สูงสุด 10 รูป)
// @route   POST /api/upload/multiple
// @access  Private (ต้อง login)
router.post(
  '/multiple',
  authenticate,
  upload.array('images', 10),
  (req: Request, res: Response): void => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'กรุณาเลือกไฟล์รูปภาพอย่างน้อย 1 รูป',
        });
        return;
      }

      // สร้าง URL ของรูปภาพทั้งหมด
      const imageUrls = req.files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      }));

      res.status(200).json({
        success: true,
        message: `อัพโหลดรูปภาพสำเร็จ ${req.files.length} รูป`,
        data: {
          images: imageUrls,
          count: req.files.length,
        },
      });
    } catch (error: any) {
      console.error('Upload multiple error:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัพโหลด',
        error: error.message,
      });
    }
  }
);

// @desc    Delete uploaded image
// @route   DELETE /api/upload/:filename
// @access  Private (ต้อง login)
router.delete('/:filename', authenticate, (req: Request, res: Response): void => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);

    // ตรวจสอบว่าไฟล์มีอยู่หรือไม่
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบไฟล์',
      });
      return;
    }

    // ลบไฟล์
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'ลบรูปภาพสำเร็จ',
    });
  } catch (error: any) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบรูปภาพ',
      error: error.message,
    });
  }
});

export default router;
