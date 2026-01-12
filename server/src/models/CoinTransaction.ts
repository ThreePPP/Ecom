import mongoose, { Schema, Document } from 'mongoose';

export interface ICoinTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  referenceNumber: string;
  type: 'earn' | 'spend' | 'topup' | 'deduct';
  amount: number;
  description: string;
  orderId?: mongoose.Types.ObjectId;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const coinTransactionSchema = new Schema<ICoinTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'กรุณาระบุผู้ใช้'],
    },
    referenceNumber: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      enum: ['earn', 'spend', 'topup', 'deduct'],
      required: [true, 'กรุณาระบุประเภทรายการ'],
    },
    amount: {
      type: Number,
      required: [true, 'กรุณาระบุจำนวนคอยน์'],
    },
    description: {
      type: String,
      required: [true, 'กรุณาระบุรายละเอียด'],
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    balanceAfter: {
      type: Number,
      required: [true, 'กรุณาระบุยอดคงเหลือหลังทำรายการ'],
    },
  },
  {
    timestamps: true,
  }
);

// Generate reference number before saving
coinTransactionSchema.pre('save', async function (next) {
  if (!this.referenceNumber) {
    const count = await mongoose.model('CoinTransaction').countDocuments();
    const timestamp = Date.now();
    this.referenceNumber = `COIN-${timestamp}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Index for faster queries
coinTransactionSchema.index({ userId: 1, createdAt: -1 });
coinTransactionSchema.index({ referenceNumber: 1 });

export default mongoose.model<ICoinTransaction>('CoinTransaction', coinTransactionSchema);
