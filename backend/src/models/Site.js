import mongoose from 'mongoose';

const siteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true },
  name: { type: String, required: true },
  bankId: { type: String, required: true }, // hindsight bank, e.g. "site-buildbyhet-me"
  shareOfModel: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Site', siteSchema);
