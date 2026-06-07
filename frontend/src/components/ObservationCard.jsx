import { motion } from 'framer-motion';
import TrendPill from './TrendPill.jsx';

// A consolidated belief — proof that memory is doing more than storing facts.
export default function ObservationCard({ belief, proofCount, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 border-l-4 border-l-grape shadow-grape"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-slate-100 leading-snug">{belief}</p>
        <TrendPill trend={trend} />
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="text-grape font-bold">
          🧠 {proofCount} {proofCount === 1 ? 'proof' : 'proofs'}
        </span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-400 text-xs">consolidated belief</span>
      </div>
    </motion.div>
  );
}
