import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSite, runMonitor } from '../services/api.js';
import { useSocket } from '../hooks/useSocket.js';
import ShareOfModelGauge from '../components/ShareOfModelGauge.jsx';
import CitationCard from '../components/CitationCard.jsx';
import MemoryFeed from '../components/MemoryFeed.jsx';
import { useReveal, useStaggerReveal } from '../hooks/useGSAP.js';

export default function SiteDetail() {
  const { id } = useParams();
  const [site, setSite] = useState(null);
  const [queries, setQueries] = useState([]);
  const [cards, setCards] = useState([]); // latest result per query text
  const [memories, setMemories] = useState([]);
  const [running, setRunning] = useState(false);

  const headerRef = useReveal({ from: 'bottom' });
  const citationsRef = useStaggerReveal(0.08);

  const load = async () => {
    const { data } = await getSite(id);
    setSite(data.site);
    setQueries(data.queries);
    // seed cards from latest checks (newest first → keep first per query)
    const byQuery = new Map();
    const qById = new Map(data.queries.map((q) => [String(q.id), q.text]));
    for (const c of data.checks) {
      const key = String(c.queryId);
      if (!byQuery.has(key)) byQuery.set(key, { ...c, query: qById.get(key) || '—' });
    }
    setCards([...byQuery.values()]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useSocket(id, {
    citation_checked: (p) =>
      setCards((prev) => {
        const next = prev.filter((c) => c.query !== p.query);
        return [{ ...p }, ...next];
      }),
    memory_retained: (m) => setMemories((prev) => [{ ...m, id: `${Date.now()}-${Math.random()}` }, ...prev]),
    monitor_complete: (p) => setSite((s) => (s ? { ...s, shareOfModel: p.shareOfModel } : s)),
  });

  const run = async () => {
    setRunning(true);
    setCards([]);
    try {
      const { data } = await runMonitor(id);
      setSite((s) => (s ? { ...s, shareOfModel: data.shareOfModel } : s));
    } finally {
      setRunning(false);
    }
  };

  if (!site) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
      <div className="w-10 h-10 rounded-full bg-teal/20 border border-teal/40 flex items-center justify-center pulse-glow">
        <span className="text-teal font-bold text-lg">⬡</span>
      </div>
      <p className="font-semibold text-sm">Loading site details...</p>
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div ref={headerRef} className="card glass p-6 mb-6 flex flex-wrap items-center justify-between gap-6" style={{ boxShadow: 'var(--glow-teal)' }}>
        <div className="flex items-center gap-5">
          <ShareOfModelGauge value={site.shareOfModel} size={120} />
          <div>
            <div className="badge-teal mb-2"><span>⬡</span> Tracked Domain</div>
            <h1 className="font-display text-2xl font-extrabold">{site.name}</h1>
            <p className="text-slate-400">{site.domain}</p>
            <p className="text-xs text-slate-500 mt-1">
              {queries.length} target queries · memory bank{' '}
              <span className="text-grape">{site.bankId}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/sites/${id}/agent`} className="btn-grape">🧠 Agent & Memory</Link>
          <button className="btn-primary" onClick={run} disabled={running}>
            {running ? 'Checking…' : '⟳ Run Citation Check'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Citation results */}
        <div>
          <h2 className="font-bold text-slate-100 mb-3"><span className="gradient-text">Citations</span></h2>
          <div ref={citationsRef} className="space-y-3">
            {cards.length === 0 && (
              <div className="card p-8 text-center text-slate-500">
                {running ? 'Running checks…' : 'Run a citation check to see results.'}
              </div>
            )}
            {cards.map((c, i) => (
              <CitationCard
                key={`${c.query}-${i}`}
                query={c.query}
                engine={c.engine}
                cited={c.cited}
                position={c.position}
                competitorCited={c.competitorCited}
                decayType={c.decayType}
              />
            ))}
          </div>
        </div>

        {/* Live memory feed */}
        <div className="h-[520px]">
          <MemoryFeed memories={memories} />
        </div>
      </div>
    </main>
  );
}
