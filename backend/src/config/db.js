import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Tracks whether we have a live MongoDB connection. When false, the repository
// layer (src/store/repository.js) transparently switches to an in-memory store
// so the demo still runs with zero infrastructure.
export const dbState = { connected: false };

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    logger.warn('No MONGODB_URI set — running with in-memory store (no persistence).');
    return false;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    dbState.connected = true;
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    dbState.connected = false;
    logger.warn(`MongoDB unavailable (${err.message}). Falling back to in-memory store.`);
    return false;
  }
}
