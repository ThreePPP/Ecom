import mongoose, { Schema, Document } from 'mongoose';

export interface ITopupRequest extends Document {
    userId: mongoose.Types.ObjectId;
    username: string;
    amount: number;
    receiptImage: string;
    status: 'pending' | 'approved' | 'rejected';
    note?: string;
    adminNote?: string;
    processedBy?: mongoose.Types.ObjectId;
    processedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const topupRequestSchema = new Schema<ITopupRequest>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'กรุณาระบุผู้ใช้'],
        },
        username: {
            type: String,
            required: [true, 'กรุณาระบุชื่อผู้ใช้'],
            trim: true,
        },
        amount: {
            type: Number,
            required: [true, 'กรุณาระบุจำนวนเงิน'],
            min: [1, 'จำนวนเงินต้องมากกว่า 0'],
        },
        receiptImage: {
            type: String,
            required: [true, 'กรุณาอัพโหลดใบเสร็จการโอนเงิน'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        note: {
            type: String,
        },
        adminNote: {
            type: String,
        },
        processedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        processedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
topupRequestSchema.index({ userId: 1, createdAt: -1 });
topupRequestSchema.index({ status: 1 });

export default mongoose.model<ITopupRequest>('TopupRequest', topupRequestSchema);
