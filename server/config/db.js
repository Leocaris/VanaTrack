import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryInstance = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.trim() === '') {
      console.log('🌱 No MONGODB_URI provided in .env — spinning up in-memory MongoDB instance for zero-setup local execution...');
      mongoMemoryInstance = await MongoMemoryServer.create();
      mongoUri = mongoMemoryInstance.getUri();
      console.log(`✅ In-Memory MongoDB running at: ${mongoUri}`);
    } else {
      console.log('🌐 Connecting to configured MongoDB Atlas / Server instance...');
    }

    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    console.log(`🌿 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryInstance) {
    await mongoMemoryInstance.stop();
  }
};
