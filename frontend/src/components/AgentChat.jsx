import { useState } from 'react';
import { motion } from 'framer-motion';
import { askAgent } from '../services/api.js';

export default function AgentChat({ siteId, suggestions = [] }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const { data } = await askAgent(siteId, q);
      setMessages((m) => [
        ...m,
        { role: 'agent', text: data.text, backedByMemory: data.backedByMemory, proofCount: data.proofCount },
      ]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'agent', text: 'Something went wrong asking the agent.', error: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 flex flex-col h-full">
      <h3 className="font-bold text-slate-100 mb-3">Ask the Agent</h3>

      <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1 min-h-[160px]">
        {messages.length === 0 && (
          <div className="text-sm text-slate-500 py-6 text-center">
            Ask anything — the agent reasons over this site's memory.
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-snug ${
                m.role === 'user'
                  ? 'bg-teal text-ink font-medium'
                  : 'bg-ink border border-edge text-slate-200'
              }`}
            >
              {m.text}
              {m.role === 'agent' && m.backedByMemory && (
                <div className="mt-2">
                  <span className="text-[11px] font-bold text-teal bg-teal/10 border border-teal/30 rounded-full px-2 py-0.5">
                    Backed by {m.proofCount} {m.proofCount === 1 ? 'experiment' : 'experiments'}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {loading && <div className="text-sm text-slate-500">Thinking over memory…</div>}
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs border border-edge rounded-full px-3 py-1 text-slate-300 hover:bg-panel2"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          className="input"
          placeholder="How do I get my new page cited?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn-primary" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}
