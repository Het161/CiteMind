import mongoose from 'mongoose';

const citationCheckSchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  queryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Query', required: true },
  engine: {
    type: String,
    enum: ['perplexity', 'chatgpt', 'claude', 'ai_overview'],
    required: true,
  },
  cited: { type: Boolean, default: false },
  position: { type: Number, default: null },
  competitorCited: { type: String, default: null },
  decayType: {
    type: String,
    enum: ['statistical', 'structural', 'competitive', null],
    default: null,
  },
  rawAnswer: { type: String, default: '' },
  checkedAt: { type: Date, default: Date.now },
});

export default mongoose.model('CitationCheck', citationCheckSchema);
