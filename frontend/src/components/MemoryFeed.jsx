import { AnimatePresence, motion } from 'framer-motion';

// Live feed of memories being retained. Makes the invisible (memory storage)
// visible — each item slides in from the top.
export default function MemoryFeed({ memories = [] }) {
  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-100">Memory Feed</h3>
        <span className="text-xs text-slate-400">{memories.length} retained</span>
      </div>

      <div className="flex-1 overflow-y-auto thin-scroll space-y-2 pr-1">
        {memories.length === 0 && (
          <div className="text-sm text-slate-500 py-8 text-center">
            No memories yet. Run a citation check or seed the demo.
          </div>
        )}
        <AnimatePresence initial={false}>
          {memories.map((m, i) => (
            <motion.div
              key={m.id ?? `${m.text}-${i}`}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl bg-ink border border-edge p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-widest text-teal bg-teal/10 border border-teal/30 rounded px-1.5 py-0.5">
                  RETAINED
                </span>
                {m.ts && (
                  <span className="text-[10px] text-slate-500">
                    {new Date(m.ts).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-200 leading-snug">{m.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
