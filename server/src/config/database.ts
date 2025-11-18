import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 URI:', mongoURI.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.db?.databaseName || 'Unknown');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
};

export default connectDB;
