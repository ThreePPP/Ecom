import { Request, Response } from 'express';
import Product from '../models/Product';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 20,
      featured,
      flashSale,
    } = req.query;

    const query: any = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by name, description, brand, category
    if (search) {
      let searchStr = (search as string).trim().toLowerCase();
      
      // Keyword mapping for common search terms
      const keywordMap: { [key: string]: { keywords: string[], category?: string } } = {
        // Intel CPU
        'i3': { keywords: ['i3', 'core i3', 'intel'], category: 'CPU' },
        'i5': { keywords: ['i5', 'core i5', 'intel'], category: 'CPU' },
        'i7': { keywords: ['i7', 'core i7', 'intel'], category: 'CPU' },
        'i9': { keywords: ['i9', 'core i9', 'intel'], category: 'CPU' },
        'intel': { keywords: ['intel', 'core'], category: 'CPU' },
        // AMD CPU
        'ryzen': { keywords: ['ryzen', 'amd'], category: 'CPU' },
        'ryzen 3': { keywords: ['ryzen 3', 'amd'], category: 'CPU' },
        'ryzen 5': { keywords: ['ryzen 5', 'amd'], category: 'CPU' },
        'ryzen 7': { keywords: ['ryzen 7', 'amd'], category: 'CPU' },
        'ryzen 9': { keywords: ['ryzen 9', 'amd'], category: 'CPU' },
        // NVIDIA GPU
        'rtx': { keywords: ['rtx', 'geforce', 'nvidia'], category: 'VGA' },
        'gtx': { keywords: ['gtx', 'geforce', 'nvidia'], category: 'VGA' },
        '3060': { keywords: ['3060', 'rtx', 'geforce'], category: 'VGA' },
        '3070': { keywords: ['3070', 'rtx', 'geforce'], category: 'VGA' },
        '3080': { keywords: ['3080', 'rtx', 'geforce'], category: 'VGA' },
        '4060': { keywords: ['4060', 'rtx', 'geforce'], category: 'VGA' },
        '4070': { keywords: ['4070', 'rtx', 'geforce'], category: 'VGA' },
        '4080': { keywords: ['4080', 'rtx', 'geforce'], category: 'VGA' },
        '4090': { keywords: ['4090', 'rtx', 'geforce'], category: 'VGA' },
        // AMD GPU
        'rx': { keywords: ['rx', 'radeon', 'amd'], category: 'VGA' },
        'radeon': { keywords: ['radeon', 'rx', 'amd'], category: 'VGA' },
        // RAM
        'ddr4': { keywords: ['ddr4'], category: 'Memory' },
        'ddr5': { keywords: ['ddr5'], category: 'Memory' },
        'ram': { keywords: ['ddr', 'memory', 'ram'], category: 'Memory' },
        // Storage
        'ssd': { keywords: ['ssd', 'solid state'], category: 'SSD' },
        'hdd': { keywords: ['hdd', 'harddisk', 'hard disk'], category: 'Harddisk' },
        'nvme': { keywords: ['nvme', 'ssd', 'm.2'], category: 'SSD' },
        // PSU
        'psu': { keywords: ['power supply', 'psu', 'watt'], category: 'Power Supply' },
        // Mainboard
        'b650': { keywords: ['b650', 'am5'], category: 'Mainboard' },
        'b550': { keywords: ['b550', 'am4'], category: 'Mainboard' },
        'b760': { keywords: ['b760', '1700'], category: 'Mainboard' },
        'z790': { keywords: ['z790', '1700'], category: 'Mainboard' },
      };

      // Escape special regex characters
      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Check if search matches any keyword mapping
      const mappedKeyword = keywordMap[searchStr];
      
      if (mappedKeyword) {
        // Use mapped keywords for search
        const keywordConditions = mappedKeyword.keywords.map(kw => ({
          name: new RegExp(escapeRegex(kw), 'i')
        }));
        
        if (mappedKeyword.category) {
          // Also filter by category if specified
          query.$and = [
            { category: mappedKeyword.category },
            { $or: keywordConditions }
          ];
        } else {
          query.$or = keywordConditions;
        }
      } else {
        // Regular search
        const searchTerms = searchStr.split(/\s+/).filter(term => term.length > 0);
        
        if (searchTerms.length === 1) {
          // Single word search - search in all fields
          const searchRegex = new RegExp(escapeRegex(searchTerms[0]), 'i');
          query.$or = [
            { name: searchRegex },
            { description: searchRegex },
            { brand: searchRegex },
            { category: searchRegex }
          ];
        } else {
          // Multiple words - all words must appear in name OR exact phrase in name
          const exactPhraseRegex = new RegExp(escapeRegex(searchStr), 'i');
          const allWordsConditions = searchTerms.map(term => ({
            name: new RegExp(escapeRegex(term), 'i')
          }));
          
          query.$or = [
            { name: exactPhraseRegex },
            { $and: allWordsConditions },
            { description: exactPhraseRegex },
            { brand: exactPhraseRegex }
          ];
        }
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter featured products
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Filter flash sale products
    if (flashSale === 'true') {
      query.isFlashSale = true;
      query.flashSaleEndTime = { $gt: new Date() };
    }

    // Sort options
    let sortOption: any = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { sold: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบสินค้า',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = { ...req.body };
    
    // Convert single image to images array for backward compatibility
    if (productData.image && !productData.images) {
      productData.images = [productData.image];
      delete productData.image;
    } else if (!productData.images || productData.images.length === 0) {
      // If images is empty but image exists, use image
      if (productData.image) {
        productData.images = [productData.image];
        delete productData.image;
      }
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'เพิ่มสินค้าสำเร็จ',
      data: { product },
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า',
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = { ...req.body };
    
    // Convert single image to images array for backward compatibility
    if (productData.image && !productData.images) {
      productData.images = [productData.image];
      delete productData.image;
    } else if (!productData.images || productData.images.length === 0) {
      // If images is empty but image exists, use image
      if (productData.image) {
        productData.images = [productData.image];
        delete productData.image;
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, productData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบสินค้า',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'อัพเดทสินค้าสำเร็จ',
      data: { product },
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการอัพเดทสินค้า',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'ไม่พบสินค้า',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'ลบสินค้าสำเร็จ',
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};

// @desc    Get categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Product.distinct('category');

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด',
    });
  }
};
