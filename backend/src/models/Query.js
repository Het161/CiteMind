import mongoose from 'mongoose';

const querySchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  text: { type: String, required: true },
  intent: {
    type: String,
    enum: ['local', 'commercial', 'informational'],
    default: 'informational',
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Query', querySchema);
