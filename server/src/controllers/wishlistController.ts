import { Request, Response } from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price images coverImage condition category brand',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    // Filter out items with null products (deleted products)
    const validItems = wishlist.items.filter((item: any) => item.product !== null);

    res.status(200).json({
      success: true,
      data: {
        items: validItems,
        totalItems: validItems.length,
      },
    });
  } catch (error: any) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการโปรด',
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
export const addToWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: 'กรุณาระบุสินค้า',
      });
      return;
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบสินค้า',
      });
      return;
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        items: [{ product: productId, addedAt: new Date() }],
      });
    } else {
      // Check if product already in wishlist
      const existingItem = wishlist.items.find(
        (item: any) => item.product.toString() === productId
      );

      if (existingItem) {
        res.status(400).json({
          success: false,
          message: 'สินค้านี้อยู่ในรายการโปรดแล้ว',
        });
        return;
      }

      wishlist.items.push({ product: productId, addedAt: new Date() });
      await wishlist.save();
    }

    // Populate and return
    await wishlist.populate({
      path: 'items.product',
      select: 'name price images coverImage condition category brand',
    });

    res.status(200).json({
      success: true,
      message: 'เพิ่มสินค้าในรายการโปรดแล้ว',
      data: {
        items: wishlist.items,
        totalItems: wishlist.items.length,
      },
    });
  } catch (error: any) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มสินค้าในรายการโปรด',
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove/:productId
// @access  Private
export const removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบรายการโปรด',
      });
      return;
    }

    const itemIndex = wishlist.items.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบสินค้าในรายการโปรด',
      });
      return;
    }

    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();

    // Populate and return
    await wishlist.populate({
      path: 'items.product',
      select: 'name price images coverImage condition category brand',
    });

    res.status(200).json({
      success: true,
      message: 'ลบสินค้าออกจากรายการโปรดแล้ว',
      data: {
        items: wishlist.items,
        totalItems: wishlist.items.length,
      },
    });
  } catch (error: any) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบสินค้าออกจากรายการโปรด',
    });
  }
};

// @desc    Toggle product in wishlist (add if not exists, remove if exists)
// @route   POST /api/wishlist/toggle
// @access  Private
export const toggleWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: 'กรุณาระบุสินค้า',
      });
      return;
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบสินค้า',
      });
      return;
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    let action = 'added';

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        items: [{ product: productId, addedAt: new Date() }],
      });
    } else {
      const existingIndex = wishlist.items.findIndex(
        (item: any) => item.product.toString() === productId
      );

      if (existingIndex !== -1) {
        // Remove from wishlist
        wishlist.items.splice(existingIndex, 1);
        action = 'removed';
      } else {
        // Add to wishlist
        wishlist.items.push({ product: productId, addedAt: new Date() });
      }

      await wishlist.save();
    }

    // Populate and return
    await wishlist.populate({
      path: 'items.product',
      select: 'name price images coverImage condition category brand',
    });

    res.status(200).json({
      success: true,
      message: action === 'added' ? 'เพิ่มสินค้าในรายการโปรดแล้ว' : 'ลบสินค้าออกจากรายการโปรดแล้ว',
      data: {
        action,
        items: wishlist.items,
        totalItems: wishlist.items.length,
      },
    });
  } catch (error: any) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเดทรายการโปรด',
    });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });

    const isInWishlist = wishlist
      ? wishlist.items.some((item: any) => item.product.toString() === productId)
      : false;

    res.status(200).json({
      success: true,
      data: {
        isInWishlist,
      },
    });
  } catch (error: any) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบรายการโปรด',
    });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
export const clearWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (wishlist) {
      wishlist.items = [];
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: 'ล้างรายการโปรดแล้ว',
      data: {
        items: [],
        totalItems: 0,
      },
    });
  } catch (error: any) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการล้างรายการโปรด',
    });
  }
};
