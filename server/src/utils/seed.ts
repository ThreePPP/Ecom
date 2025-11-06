import dotenv from 'dotenv';
import connectDB from '../config/database';
import { seedProducts } from './seedProducts';
import mongoose from 'mongoose';

dotenv.config();

const runSeeder = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    
    await seedProducts();
    
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeeder();
