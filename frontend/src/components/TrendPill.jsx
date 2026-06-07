const MAP = {
  strengthening: { icon: '↗', label: 'strengthening', cls: 'text-teal border-teal/40 bg-teal/10' },
  stable: { icon: '→', label: 'stable', cls: 'text-slate-300 border-edge bg-panel2' },
  weakening: { icon: '↘', label: 'weakening', cls: 'text-amber border-amber/40 bg-amber/10' },
  stale: { icon: '⊘', label: 'stale', cls: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
};

export default function TrendPill({ trend }) {
  const t = MAP[trend] || MAP.stable;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${t.cls}`}
    >
      <span>{t.icon}</span>
      {t.label}
    </span>
  );
}
