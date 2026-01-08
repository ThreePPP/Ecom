import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface IShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  district: string;
  province: string;
  postalCode: string;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  carrier?: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paidAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'จำนวนต้องมากกว่า 0'],
        },
        price: {
          type: Number,
          required: true,
          min: [0, 'ราคาต้องมากกว่าหรือเท่ากับ 0'],
        },
        image: {
          type: String,
          required: true,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      address: { type: String, required: true },
      district: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['credit_card', 'promptpay', 'bank_transfer', 'cod', 'coin_payment'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: {
      type: String,
    },
    carrier: {
      type: String,
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'ยอดรวมต้องมากกว่าหรือเท่ากับ 0'],
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: [0, 'ค่าจัดส่งต้องมากกว่าหรือเท่ากับ 0'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'ส่วนลดต้องมากกว่าหรือเท่ากับ 0'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'ยอดรวมทั้งหมดต้องมากกว่าหรือเท่ากับ 0'],
    },
    paidAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model<IOrder>('Order', orderSchema);
