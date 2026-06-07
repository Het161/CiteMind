import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSites, createSite, addQueries, getHealth } from '../services/api.js';
import ShareOfModelGauge from '../components/ShareOfModelGauge.jsx';

const DEFAULT_QUERIES = [
  { text: 'web developer ahmedabad', intent: 'local' },
  { text: 'best web design agency gujarat', intent: 'commercial' },
  { text: 'react developer for hire surat', intent: 'local' },
  { text: 'how to get cited by AI search engines', intent: 'informational' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', domain: '' });
  const [health, setHealth] = useState(null);

  const load = async () => {
    const { data } = await getSites();
    setSites(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    getHealth().then((r) => setHealth(r.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.domain) return;
    const { data: site } = await createSite(form);
    await addQueries(site.id, DEFAULT_QUERIES);
    setForm({ name: '', domain: '' });
    setAdding(false);
    navigate(`/sites/${site.id}`);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Tracked Sites</h1>
          <p className="text-slate-400 mt-1">
            Monitor AI citations — and remember what fixes them.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {health && (
            <span className="text-xs text-slate-400 border border-edge rounded-full px-3 py-1">
              memory: <span className="text-grape font-semibold">{health.memory}</span> · groq:{' '}
              <span className={health.groq ? 'text-teal' : 'text-amber'}>{health.groq ? 'on' : 'simulated'}</span>
            </span>
          )}
          <Link to="/demo" className="btn-grape">▶ Run the Demo</Link>
          <button className="btn-primary" onClick={() => setAdding((a) => !a)}>
            + Add Site
          </button>
        </div>
      </div>

      {adding && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={submit}
          className="card p-5 mb-6 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
        >
          <div>
            <label className="label">Site name</label>
            <input
              className="input"
              placeholder="BuildByHet Agency"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Domain</label>
            <input
              className="input"
              placeholder="buildbyhet.me"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
            />
          </div>
          <button className="btn-primary">Create & track</button>
        </motion.form>
      )}

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : sites.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">📡</div>
          <h3 className="text-lg font-bold">No sites tracked yet</h3>
          <p className="text-slate-400 mt-1 mb-5">
            Add your first site, or jump straight into the memory demo.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button className="btn-primary" onClick={() => setAdding(true)}>+ Add Site</button>
            <Link to="/demo" className="btn-grape">▶ Run the Demo</Link>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sites.map((s) => (
            <Link key={s.id} to={`/sites/${s.id}`} className="card p-5 hover:shadow-glow transition block">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate">{s.name}</h3>
                  <p className="text-sm text-slate-400 truncate">{s.domain}</p>
                </div>
                <ShareOfModelGauge value={s.shareOfModel} size={86} label={false} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Share of Model</span>
                <span className="text-slate-300">bank: {s.bankId}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
