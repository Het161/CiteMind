import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  queryText: { type: String, required: true },
  answer: { type: String, required: true },
  backedByMemory: { type: Boolean, default: false },
  proofCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Recommendation', recommendationSchema);
