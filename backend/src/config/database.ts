import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/plagiarism';

export async function connectDB(): Promise<void> {
  mongoose.connection.on('connected', () =>
    console.log('✅ MongoDB connected:', MONGODB_URI)
  );
  mongoose.connection.on('error', (err) =>
    console.error('❌ MongoDB error:', err)
  );
  mongoose.connection.on('disconnected', () =>
    console.warn('⚠️  MongoDB disconnected')
  );

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
}

export default connectDB;
