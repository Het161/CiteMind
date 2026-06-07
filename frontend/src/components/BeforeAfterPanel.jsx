import { motion } from 'framer-motion';

// THE demo centerpiece — generic AI vs memory-backed CiteMind, side by side.
export default function BeforeAfterPanel({ before, after, afterProofCount }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* BEFORE */}
      <div className="card p-5 border-l-4 border-l-rose-500/70">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">❌</span>
          <h4 className="font-bold text-slate-100">Generic AI (no memory)</h4>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed min-h-[96px]">
          {before || 'Ask the question with empty memory to see the generic answer.'}
        </p>
        <div className="mt-4 text-xs text-rose-400 font-medium">
          Same advice every AI gives you.
        </div>
      </div>

      {/* AFTER */}
      <motion.div
        initial={false}
        animate={after ? { boxShadow: '0 0 0 1px rgba(45,212,191,0.5), 0 8px 40px rgba(45,212,191,0.15)' } : {}}
        className="card p-5 border-l-4 border-l-teal"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✅</span>
          <h4 className="font-bold text-slate-100">CiteMind (with memory)</h4>
        </div>
        <p className="text-sm text-slate-100 leading-relaxed min-h-[96px]">
          {after || 'Seed the history, then ask again — the answer becomes specific and proven.'}
        </p>
        <div className="mt-4 flex items-center gap-2">
          {after && afterProofCount > 0 && (
            <span className="text-[11px] font-bold text-teal bg-teal/10 border border-teal/30 rounded-full px-2 py-0.5">
              Backed by {afterProofCount} {afterProofCount === 1 ? 'experiment' : 'experiments'}
            </span>
          )}
          <span className="text-xs text-teal font-medium">Specific. Proven. Yours.</span>
        </div>
      </motion.div>
    </div>
  );
}
