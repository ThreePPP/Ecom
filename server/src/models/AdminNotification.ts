import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminNotification extends Document {
  type: 'coin_redeem' | 'new_order' | 'low_stock' | 'new_user';
  title: string;
  message: string;
  data?: {
    userId?: mongoose.Types.ObjectId;
    userName?: string;
    userEmail?: string;
    amount?: number;
    orderId?: mongoose.Types.ObjectId;
    productId?: mongoose.Types.ObjectId;
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adminNotificationSchema = new Schema<IAdminNotification>(
  {
    type: {
      type: String,
      enum: ['coin_redeem', 'new_order', 'low_stock', 'new_user'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      userName: String,
      userEmail: String,
      amount: Number,
      orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
adminNotificationSchema.index({ isRead: 1, createdAt: -1 });
adminNotificationSchema.index({ type: 1 });

export default mongoose.model<IAdminNotification>('AdminNotification', adminNotificationSchema);
