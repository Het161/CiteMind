# 🧠 CiteMind — AI Citation Memory Agent

> **Everyone has monitoring. We have memory.**

CiteMind is an AI agent for web agencies that tracks whether their content gets
cited by AI engines (ChatGPT, Perplexity, Claude, Google AI Overviews) and —
using a persistent memory layer ([Hindsight](https://ui.hindsight.vectorize.io)) —
**learns over time which optimization strategies actually recover and grow
citations** for a specific site.

Built for **HackBaroda 2026** final round.

The core differentiator: every GEO tool *monitors* citations. None of them
*remember why* a citation worked or failed. CiteMind retains every experiment,
consolidates it into beliefs, and recommends the proven fix before you ask.

---

## Why memory is the star

The closed loop of modern GEO is **monitor → diagnose → fix → verify → repeat**.
CiteMind runs that loop *and remembers every turn of it* using Hindsight's three
operations:

| Operation | In CiteMind |
|-----------|-------------|
| `retain()` | Every citation check + every optimization + every outcome becomes a memory. |
| **observation consolidation** | Hindsight auto-merges repeated facts into **beliefs** like *"FAQ schema recovers local pages — strengthening."* Surfaced as **ObservationCards**. |
| `reflect()` | "What should I do?" → the agent reasons over all memory and answers with proof from past experiments. |

One **memory bank per site** (`bank_id = site-{domain-slug}`) keeps each client's
institutional knowledge separate.

---

## The 90-second demo (Demo page)

A guided 3-step story that shows the agent going from generic to expert:

1. **Ask with empty memory** → generic answer (same as any AI). ❌
2. **Seed 3 months of history** → ~15 memories stream into the live feed, then
   Hindsight consolidates beliefs (*"FAQ schema recovers local pages, strengthening"*). 🧠
3. **Ask the same question again** → specific, proof-backed answer rendered
   side-by-side with step 1 in the **Before/After panel**. ✅

> *"Claude knows SEO. My agent knows MY SEO — and gets smarter every week."*

---

## Stack

- **Backend:** Node + Express (ESM), Socket.io, MongoDB (mongoose), Groq SDK, `@vectorize-io/hindsight-client`
- **Frontend:** Vite + React 18, Tailwind, framer-motion, react-circular-progressbar, socket.io-client
- **LLM:** Groq (`openai/gpt-oss-120b` by default)
- **Memory:** Hindsight (cloud or local)

### Graceful degradation (so the demo *always* works)
- **No MongoDB?** → falls back to an in-memory store automatically.
- **No Hindsight creds?** → a built-in Groq-backed memory engine provides
  retain / recall / reflect / observations.
- **No Groq key?** → citation checks are simulated and reflect/observations use a
  deterministic heuristic. The full before/after demo still runs.

Check `GET /api/health` to see active modes: `{ memory: "hindsight"|"fallback", groq: bool }`.

---

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env     # fill GROQ_API_KEY and (optionally) Hindsight creds
npm run dev              # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

### Keys
- **Groq:** free key at https://console.groq.com → `GROQ_API_KEY`
- **Hindsight:** sign up at https://ui.hindsight.vectorize.io (promo `MEMHACK6`
  for $50 credits) → set `HINDSIGHT_BASE_URL` (+ `HINDSIGHT_API_KEY`).
  Or run locally (`pip install hindsight-api`) and point at `http://localhost:8888`.

> Both keys are **optional** — see *Graceful degradation* above.

---

## API

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/register`, `/api/auth/login` | JWT auth |
| POST/GET | `/api/sites` | create / list tracked sites (auto-creates Hindsight bank id) |
| GET | `/api/sites/:id` | site detail + queries + recent checks |
| POST | `/api/sites/:id/queries` | add target queries |
| POST | `/api/monitor/:siteId/run` | run citation checks across all queries (retains each to memory) |
| GET | `/api/agent/:siteId/observations` | consolidated beliefs (proof memory works) |
| POST | `/api/agent/:siteId/ask` | reflect() → recommendation + proof count |
| POST | `/api/demo/:siteId/seed` | seed 3 months of history into store + memory |
| POST | `/api/demo/:siteId/reset` | clear bank + checks for a fresh demo |

### WebSocket events (per site room)
`citation_checked` · `memory_retained` · `observation_formed` · `monitor_complete` · `seed_complete` · `demo_reset`

---

## Project structure

```
citemind/
├── backend/   # Express API, services (the "brain"), Hindsight + Groq wrappers
└── frontend/  # React dashboard + the winning Demo page
```

Key files:
- `backend/src/services/hindsightService.js` — retain / recall / reflect / observations (the heart)
- `backend/src/services/citationChecker.js` — runs checks, classifies decay, retains outcomes
- `frontend/src/pages/Demo.jsx` — the 3-step before/after story
- `frontend/src/components/BeforeAfterPanel.jsx` — the single most important visual

---

## One-line pitch

> Every GEO tool tells you your AI citations dropped. CiteMind remembers **why**
> they dropped last time, **what** fixed it, and gives you the proven playbook —
> because it learns from every experiment you've ever run.

Built for HackBaroda 2026 — Community/Company Edition.
