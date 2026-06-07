import DecayBadge from './DecayBadge.jsx';

const ENGINE_LABEL = {
  perplexity: 'Perplexity',
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  ai_overview: 'AI Overviews',
};

export default function CitationCard({ query, engine, cited, position, competitorCited, decayType }) {
  return (
    <div
      className={`card p-4 border-l-4 ${
        cited ? 'border-l-teal' : 'border-l-rose-500'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-slate-100 truncate">{query}</div>
          <div className="text-xs text-slate-400 mt-0.5">{ENGINE_LABEL[engine] || engine}</div>
        </div>
        <span
          className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${
            cited ? 'bg-teal/15 text-teal' : 'bg-rose-500/15 text-rose-400'
          }`}
        >
          {cited ? `✓ cited #${position ?? '-'}` : '✗ not cited'}
        </span>
      </div>

      {!cited && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {competitorCited && (
            <span>
              cited instead: <span className="text-slate-200 font-medium">{competitorCited}</span>
            </span>
          )}
          <DecayBadge type={decayType} />
        </div>
      )}
    </div>
  );
}
