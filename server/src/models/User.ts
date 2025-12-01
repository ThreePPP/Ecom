import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IShippingAddress {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  phoneNumber: string;
  address: string;
  district: string;  // อำเภอ
  province: string;  // จังหวัด
  postalCode: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: Date;
  role: 'user' | 'admin';
  isVerified: boolean;
  coins: number;
  shippingAddresses: IShippingAddress[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'กรุณากรอกชื่อ'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'กรุณากรอกนามสกุล'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'กรุณากรอกอีเมล'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'กรุณากรอกอีเมลให้ถูกต้อง'],
    },
    password: {
      type: String,
      required: [true, 'กรุณากรอกรหัสผ่าน'],
      minlength: [6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'],
      select: false,
    },
    phoneNumber: {
      type: String,
      required: [true, 'กรุณากรอกเบอร์โทรศัพท์'],
      match: [/^[0-9]{10}$/, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'กรุณากรอกวันเกิด'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    coins: {
      type: Number,
      default: 0,
      min: [0, 'จำนวนเหรียญต้องไม่ติดลบ'],
    },
    shippingAddresses: [
      {
        fullName: {
          type: String,
          required: true,
        },
        phoneNumber: {
          type: String,
          required: true,
        },
        address: {
          type: String,
          required: true,
        },
        district: {
          type: String,
          required: true,
        },
        province: {
          type: String,
          required: true,
        },
        postalCode: {
          type: String,
          required: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<IUser>('User', userSchema);
