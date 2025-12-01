import mongoose from 'mongoose';
import Product from '../models/Product';
import dotenv from 'dotenv';

dotenv.config();

const deleteAllProducts = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ เชื่อมต่อ MongoDB สำเร็จ');

    const result = await Product.deleteMany({});
    console.log(`✅ ลบสินค้าทั้งหมด ${result.deletedCount} รายการสำเร็จ`);

    await mongoose.connection.close();
    console.log('✅ ปิดการเชื่อมต่อ MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    process.exit(1);
  }
};

deleteAllProducts();
