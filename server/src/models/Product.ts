import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  oldPrice?: number;
  discount?: number;
  category: string;
  brand?: string;
  stock: number;
  images: string[];
  coverImage?: string;
  detailCoverImage?: string;
  condition?: string;
  specifications?: {
    [key: string]: string;
  };
  rating: number;
  reviewCount: number;
  sold: number;
  isActive: boolean;
  isFeatured: boolean;
  isFlashSale: boolean;
  showInCategory: boolean;
  flashSaleEndTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'กรุณากรอกชื่อสินค้า'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'กรุณากรอกรายละเอียดสินค้า'],
    },
    price: {
      type: Number,
      required: [true, 'กรุณากรอกราคาสินค้า'],
      min: [0, 'ราคาต้องมากกว่า 0'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'ราคาต้องมากกว่า 0'],
    },
    oldPrice: {
      type: Number,
      min: [0, 'ราคาต้องมากกว่า 0'],
    },
    discount: {
      type: Number,
      min: [0, 'ส่วนลดต้องมากกว่าหรือเท่ากับ 0'],
      max: [100, 'ส่วนลดต้องไม่เกิน 100%'],
    },
    category: {
      type: String,
      required: [true, 'กรุณาเลือกหมวดหมู่'],
    },
    brand: {
      type: String,
    },
    stock: {
      type: Number,
      required: [true, 'กรุณากรอกจำนวนสินค้า'],
      min: [0, 'จำนวนสินค้าต้องมากกว่าหรือเท่ากับ 0'],
      default: 0,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v && v.length > 0;
        },
        message: 'ต้องมีรูปภาพอย่างน้อย 1 รูป'
      }
    },
    coverImage: {
      type: String,
    },
    detailCoverImage: {
      type: String,
    },
    condition: {
      type: String,
      enum: ['สภาพเหมือนใหม่', 'สภาพดี', 'สภาพพอใช้'],
      default: 'สภาพเหมือนใหม่',
    },
    specifications: {
      type: Map,
      of: String,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'คะแนนต้องมากกว่าหรือเท่ากับ 0'],
      max: [5, 'คะแนนต้องไม่เกิน 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'จำนวนรีวิวต้องมากกว่าหรือเท่ากับ 0'],
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, 'จำนวนขายต้องมากกว่าหรือเท่ากับ 0'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isFlashSale: {
      type: Boolean,
      default: false,
    },
    showInCategory: {
      type: Boolean,
      default: true,
    },
    flashSaleEndTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', productSchema);
