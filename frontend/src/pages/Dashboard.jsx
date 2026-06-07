import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSites, createSite, addQueries, getHealth } from '../services/api.js';
import ShareOfModelGauge from '../components/ShareOfModelGauge.jsx';
import { useStaggerReveal, useReveal } from '../hooks/useGSAP.js';

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

  const headingRef = useReveal({ from: 'bottom' });
  const gridRef    = useStaggerReveal(0.1);

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
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div
        ref={headingRef}
        className="flex items-end justify-between flex-wrap gap-4 mb-10"
      >
        <div>
          <div className="badge-teal mb-3">
            <span>⬡</span> AI Citation Tracker
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Tracked <span className="gradient-text">Sites</span>
          </h1>
          <p className="text-slate-400 mt-2 text-base">
            Monitor AI citations — and remember what fixes them.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {health && (
            <span
              className="text-xs text-slate-400 rounded-full px-3 py-1.5 flex items-center gap-2"
              style={{
                background: 'rgba(167,139,250,0.08)',
                border: '1px solid rgba(167,139,250,0.2)',
              }}
            >
              memory:{' '}
              <span className="text-grape font-semibold">{health.memory}</span>
              <span className="w-px h-3 bg-edge inline-block" />
              groq:{' '}
              <span className={health.groq ? 'text-teal' : 'text-amber'}>
                {health.groq ? 'on' : 'simulated'}
              </span>
            </span>
          )}
          <Link to="/demo" className="btn-grape" id="dash-run-demo">
            ▶ Run the Demo
          </Link>
          <button
            id="dash-add-site"
            className="btn-primary"
            onClick={() => setAdding((a) => !a)}
          >
            + Add Site
          </button>
        </div>
      </div>

      {/* Add site form */}
      {adding && (
        <motion.form
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onSubmit={submit}
          className="glass rounded-2xl p-5 mb-8 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
          style={{ boxShadow: 'var(--glow-teal)' }}
        >
          <div>
            <label className="label" htmlFor="form-site-name">Site name</label>
            <input
              id="form-site-name"
              className="input"
              placeholder="My Agency"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="form-site-domain">Domain</label>
            <input
              id="form-site-domain"
              className="input"
              placeholder="myagency.com"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
            />
          </div>
          <button id="form-site-submit" className="btn-primary">Create &amp; track</button>
        </motion.form>
      )}

      {/* Sites grid */}
      {loading ? (
        <div className="text-slate-500 text-center py-16">
          <div className="text-3xl mb-3 pulse-glow">⬡</div>
          Loading your sites…
        </div>
      ) : sites.length === 0 ? (
        <div
          className="glass rounded-2xl p-12 text-center"
          style={{ boxShadow: 'var(--glow-grape)' }}
        >
          <div className="text-5xl mb-4 float-anim">📡</div>
          <h3 className="text-lg font-bold mb-2">No sites tracked yet</h3>
          <p className="text-slate-400 mb-6 text-sm max-w-sm mx-auto">
            Add your first site, or jump straight into the memory demo to see CiteMind in action.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              id="empty-add-site"
              className="btn-primary"
              onClick={() => setAdding(true)}
            >
              + Add Site
            </button>
            <Link to="/demo" className="btn-grape" id="empty-run-demo">
              ▶ Run the Demo
            </Link>
          </div>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {sites.map((s) => (
            <Link
              key={s.id}
              to={`/sites/${s.id}`}
              className="card p-5 block group"
              style={{ transition: 'box-shadow 0.25s ease, transform 0.25s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--glow-teal)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.transform = '';
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="badge-teal mb-2 w-fit">Site</div>
                  <h3 className="font-bold text-lg truncate">{s.name}</h3>
                  <p className="text-sm text-slate-400 truncate">{s.domain}</p>
                </div>
                <ShareOfModelGauge value={s.shareOfModel} size={86} label={false} />
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-edge pt-3">
                <span>Share of Model</span>
                <span
                  className="text-slate-300 font-mono text-[11px]"
                  style={{ color: 'var(--color-grape)' }}
                >
                  bank: {s.bankId}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
