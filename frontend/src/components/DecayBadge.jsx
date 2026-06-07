const MAP = {
  statistical: { label: 'statistical decay', hint: 'stale stats', cls: 'text-amber border-amber/40 bg-amber/10' },
  structural: { label: 'structural decay', hint: 'format changed', cls: 'text-grape border-grape/40 bg-grape/10' },
  competitive: { label: 'competitive decay', hint: 'outranked', cls: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
};

export default function DecayBadge({ type }) {
  if (!type) return null;
  const d = MAP[type] || MAP.structural;
  return (
    <span
      title={d.hint}
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${d.cls}`}
    >
      {d.label}
    </span>
  );
}
