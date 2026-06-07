import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSite, getObservations } from '../services/api.js';
import ObservationCard from '../components/ObservationCard.jsx';
import AgentChat from '../components/AgentChat.jsx';

export default function AgentPage() {
  const { id } = useParams();
  const [site, setSite] = useState(null);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: detail }, { data: obs }] = await Promise.all([
        getSite(id),
        getObservations(id),
      ]);
      setSite(detail.site);
      setObservations(obs.observations || []);
      setLoading(false);
    })();
  }, [id]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">🧠 Agent & Memory</h1>
          <p className="text-slate-400 mt-1">
            {site ? site.name : '…'} — consolidated beliefs + reasoning over memory.
          </p>
        </div>
        {site && (
          <Link to={`/sites/${id}`} className="btn-ghost">
            ← Back to site
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Consolidated beliefs */}
        <section>
          <h2 className="font-bold text-slate-100 mb-3">
            Consolidated Beliefs
            <span className="ml-2 text-xs text-slate-500 font-normal">
              auto-merged from memory
            </span>
          </h2>
          <div className="space-y-3">
            {loading && <div className="text-slate-500">Loading memory…</div>}
            {!loading && observations.length === 0 && (
              <div className="card p-8 text-center text-slate-500">
                No beliefs yet. Run citation checks or seed the demo to build memory.
              </div>
            )}
            {observations.map((o, i) => (
              <ObservationCard key={i} belief={o.belief} proofCount={o.proofCount} trend={o.trend} />
            ))}
          </div>
        </section>

        {/* Chat */}
        <section className="h-[520px]">
          <AgentChat
            siteId={id}
            suggestions={[
              'How do I get my Surat page cited?',
              'What fixed citation drops before?',
              'What should I avoid?',
            ]}
          />
        </section>
      </div>
    </main>
  );
}
