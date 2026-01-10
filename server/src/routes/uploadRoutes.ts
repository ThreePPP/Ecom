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
      // ใช้ Relative path แทน Absolute path เพื่อป้องกันปัญหา Mixed Content หรือ External URL ผิดพลาด
      const imageUrl = `/uploads/${req.file.filename}`;

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
        url: `/uploads/${file.filename}`, // ใช้ Relative path
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

// @desc    Get all uploaded files list
// @route   GET /api/upload/list
// @access  Private (ต้อง login - Admin only)
router.get('/list', authenticate, (req: Request, res: Response): void => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');

    // ตรวจสอบว่า folder มีอยู่หรือไม่
    if (!fs.existsSync(uploadsDir)) {
      res.status(200).json({
        success: true,
        data: {
          files: [],
          count: 0,
        },
      });
      return;
    }

    // อ่านรายการไฟล์ทั้งหมด
    const files = fs.readdirSync(uploadsDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(filename => {
        const filePath = path.join(uploadsDir, filename);
        const stats = fs.statSync(filePath);
        return {
          filename,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      });

    res.status(200).json({
      success: true,
      data: {
        files,
        count: files.length,
      },
    });
  } catch (error: any) {
    console.error('Get files list error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายการไฟล์',
      error: error.message,
    });
  }
});

export default router;
