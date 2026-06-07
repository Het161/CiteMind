import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  getSites,
  createSite,
  addQueries,
  askAgent,
  askEmpty,
  seedDemo,
  resetDemo,
  getObservations,
} from '../services/api.js';
import { useSocket } from '../hooks/useSocket.js';
import MemoryFeed from '../components/MemoryFeed.jsx';
import ObservationCard from '../components/ObservationCard.jsx';
import BeforeAfterPanel from '../components/BeforeAfterPanel.jsx';

const DEMO_NAME = 'CiteMind Demo — OM Marketing Solutions';
const DEMO_DOMAIN = 'ommarketing.in';
const QUESTION = 'How do I get my new Surat page cited?';

export default function Demo() {
  const [site, setSite] = useState(null);
  const [memories, setMemories] = useState([]);
  const [observations, setObservations] = useState([]);
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [afterProof, setAfterProof] = useState(0);
  const [busy, setBusy] = useState('');
  const bootstrapped = useRef(false);

  // Ensure a dedicated demo site exists, then reset its memory for a clean run.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    (async () => {
      const { data: sites } = await getSites();
      let s = sites.find((x) => x.name === DEMO_NAME);
      if (!s) {
        const { data } = await createSite({ name: DEMO_NAME, domain: DEMO_DOMAIN });
        s = data;
        await addQueries(s.id, [
          { text: 'react developer for hire surat', intent: 'local' },
          { text: 'web developer ahmedabad', intent: 'local' },
        ]);
      }
      setSite(s);
      await resetDemo(s.id);
    })();
  }, []);

  useSocket(site?.id, {
    memory_retained: (m) =>
      setMemories((prev) => [{ ...m, id: `${Date.now()}-${Math.random()}` }, ...prev]),
    observation_formed: (o) =>
      setObservations((prev) =>
        prev.some((p) => p.belief === o.belief) ? prev : [...prev, o]
      ),
  });

  // Step 1 — generic answer with no memory (always empty, re-runnable).
  const step1 = async () => {
    setBusy('step1');
    try {
      const { data } = await askEmpty(site.id, QUESTION);
      setBefore(data.text);
    } finally {
      setBusy('');
    }
  };

  // Step 2 — stream 3 months of history; beliefs consolidate (and keep
  // strengthening as Hindsight finishes merging memory units).
  const step2 = async () => {
    setBusy('step2');
    setMemories([]);
    setObservations([]);
    try {
      const { data } = await seedDemo(site.id);
      if (data.observations?.length) setObservations(data.observations);
      [4000, 9000, 14000].forEach((delay) =>
        setTimeout(async () => {
          try {
            const { data: obs } = await getObservations(site.id);
            if (obs.observations?.length) setObservations(obs.observations);
          } catch {
            /* ignore */
          }
        }, delay)
      );
    } finally {
      setBusy('');
    }
  };

  // Step 3 — same question, now backed by memory.
  const step3 = async () => {
    setBusy('step3');
    try {
      const { data } = await askAgent(site.id, QUESTION);
      setAfter(data.text);
      setAfterProof(data.proofCount);
    } finally {
      setBusy('');
    }
  };

  const reset = async () => {
    setBusy('reset');
    try {
      await resetDemo(site.id);
      setMemories([]);
      setObservations([]);
      setBefore('');
      setAfter('');
      setAfterProof(0);
    } finally {
      setBusy('');
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Title */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">
            CiteMind — <span className="text-teal">memory in action</span>
          </h1>
          <p className="text-slate-400 mt-1">
            The same question, asked twice — watch memory turn a generic answer into a proven playbook.
          </p>
        </div>
        <button className="btn-ghost" onClick={reset} disabled={!site || !!busy}>
          ↺ Reset demo
        </button>
      </div>

      {/* Steps (stacked) */}
      <div className="space-y-4">
        <StepCard
          n="1"
          accent="rose"
          title="Ask with empty memory"
          note="The agent has no history yet — expect the same generic advice any AI gives."
          done={!!before}
          loading={busy === 'step1'}
          disabled={!site}
          cta={`Ask: "${QUESTION}"`}
          onClick={step1}
        />

        <StepCard
          n="2"
          accent="grape"
          title="Feed it 3 months of real history"
          note="Hindsight is consolidating beliefs from these experiments automatically."
          done={memories.length > 0}
          loading={busy === 'step2'}
          disabled={!site || !before}
          cta="Seed citation history"
          onClick={step2}
        />

        {/* Step 2 output — live memory feed + consolidated beliefs */}
        {(memories.length > 0 || observations.length > 0) && (
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="h-[380px]">
              <MemoryFeed memories={memories} />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 mb-3">
                Consolidated Beliefs
                <span className="ml-2 text-xs text-slate-500 font-normal">
                  auto-merged by Hindsight
                </span>
              </h3>
              <div className="space-y-3">
                {observations.length === 0 && (
                  <div className="card p-6 text-center text-slate-500 text-sm">
                    Consolidating… beliefs will appear and strengthen as memories merge.
                  </div>
                )}
                {observations.map((o, i) => (
                  <ObservationCard
                    key={i}
                    belief={o.belief}
                    proofCount={o.proofCount}
                    trend={o.trend}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <StepCard
          n="3"
          accent="teal"
          title="Ask the same question — now with memory"
          note="Specific, proof-backed, and tailored to this site's own experiments."
          done={!!after}
          loading={busy === 'step3'}
          disabled={!site || observations.length === 0}
          cta="Ask the same question — now with memory"
          onClick={step3}
        />
      </div>

      {/* Persistent before/after at the bottom */}
      <div className="mt-8">
        <h2 className="font-bold text-slate-100 mb-3">Same question, two brains</h2>
        <BeforeAfterPanel before={before} after={after} afterProofCount={afterProof} />
      </div>
    </main>
  );
}

function StepCard({ n, title, accent, note, cta, onClick, loading, disabled, done }) {
  const ring = { rose: 'border-l-rose-500', grape: 'border-l-grape', teal: 'border-l-teal' }[accent];
  const btn = { rose: 'btn-ghost', grape: 'btn-grape', teal: 'btn-primary' }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-5 border-l-4 ${ring} flex flex-col sm:flex-row sm:items-center gap-4`}
    >
      <div className="flex items-start gap-3 flex-1">
        <span
          className={`shrink-0 w-9 h-9 rounded-full grid place-items-center font-bold ${
            done ? 'bg-teal text-ink' : 'bg-panel2 text-slate-200'
          }`}
        >
          {done ? '✓' : n}
        </span>
        <div>
          <h3 className="font-bold text-slate-100">{title}</h3>
          <p className="text-sm text-slate-400 mt-0.5">{note}</p>
        </div>
      </div>
      <button
        className={`${btn} sm:w-auto w-full shrink-0`}
        onClick={onClick}
        disabled={disabled || !!loading}
      >
        {loading ? 'Working…' : cta}
      </button>
    </motion.div>
  );
}
