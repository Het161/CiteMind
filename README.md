# CiteMind

CiteMind is an AI citation memory agent for teams that want to understand,
recover, and improve how their websites are cited by AI answer engines.

Instead of only monitoring whether a site is cited by tools such as ChatGPT,
Perplexity, Claude, or Google AI Overviews, CiteMind remembers every citation
check, failed experiment, optimization, recovery, and recommendation. Over time
it turns that history into reusable beliefs for each tracked website.

Built for HackBaroda 2026.

## Documentation

### Problem Statement Selected

Modern web agencies and SEO teams are entering the Generative Engine
Optimization era. Their clients now care about being cited in AI-generated
answers, not only ranking on traditional search result pages.

The problem is that most monitoring tools answer only one question:

> Is my site cited right now?

They do not remember:

- why a citation dropped;
- which competitor displaced the page;
- which optimization recovered the citation;
- how long recovery took;
- whether the same fix worked for similar pages before.

CiteMind solves the memory gap in AI citation optimization.

### Solution Overview

CiteMind creates one memory bank per tracked site and runs a closed feedback
loop:

1. A user registers and adds a website.
2. The user adds target AI-answer queries.
3. CiteMind checks citations across configured AI engines.
4. Each check is stored as structured history and retained as memory.
5. The agent consolidates repeated patterns into observations.
6. The user asks the agent what to do next.
7. The agent responds with recommendations backed by past site-specific proof.

The demo flow shows the difference between an agent with empty memory and an
agent that has retained three months of citation history.

### Features Implemented

- JWT-based user registration and login.
- Tracked site creation with a derived memory bank id.
- Query management for local, commercial, and informational intents.
- Citation monitoring across Perplexity, ChatGPT, Claude, and AI Overview
  labels.
- Share-of-model score calculation for tracked sites.
- Citation decay classification: statistical, structural, and competitive.
- Site-specific memory retention using Hindsight when credentials are present.
- Built-in fallback memory engine when Hindsight is unavailable.
- Groq-powered answer generation when a Groq key is present.
- Deterministic simulated mode when external API keys are absent.
- Consolidated observation cards that surface learned citation patterns.
- Agent Q&A that uses retained memory to produce proof-backed
  recommendations.
- WebSocket events for live monitoring, retained memory, observations, demo
  reset, and demo seed progress.
- Guided demo page with before/after agent comparison.

### Technology Stack Used

| Layer | Technology |
| --- | --- |
| Frontend | Vite, React 18, React Router, Tailwind CSS |
| UI/Animation | Framer Motion, GSAP, Three.js, react-circular-progressbar |
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB with Mongoose, with in-memory fallback |
| Auth | JSON Web Tokens, bcryptjs |
| AI Model | Groq SDK, default model `openai/gpt-oss-120b` |
| Memory | Hindsight client, with local fallback engine |
| Deployment | Render backend blueprint, Vercel-ready frontend config |

### Setup Instructions

Prerequisites:

- Node.js 18 or newer
- npm
- Optional: MongoDB connection string
- Optional: Groq API key
- Optional: Hindsight API key

Install and run the backend:

```bash
cd backend
npm install
npm run dev
```

The backend starts on `http://localhost:5000`.

Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.

Optional backend environment variables:

```bash
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace-with-a-secret
MONGODB_URI=mongodb://localhost:27017/citemind
GROQ_API_KEY=your-groq-key
GROQ_MODEL=openai/gpt-oss-120b
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your-hindsight-key
```

The app still runs without MongoDB, Groq, or Hindsight. In that case it uses an
in-memory data store, simulated citation checks, and a fallback memory engine so
the demo remains usable.

Health check:

```bash
curl http://localhost:5000/api/health
```

Expected response shape:

```json
{
  "ok": true,
  "memory": "fallback",
  "groq": false
}
```

## Media Assets

Existing visual assets:

- `frontend/public/architecture-system.png` - system architecture visual.
- `frontend/public/dataflow.png` - application data flow visual.
- `frontend/public/favicon.png` and `frontend/public/favicon.svg` - app icons.

Generated presentation assets:

- `media/presentation/citemind_pitch.mp4` - generated 90-second video.
- `media/presentation/narration.wav` - generated narration or fallback audio.
- `media/presentation/slide_*.png` - generated presentation slides.
- `media/presentation/storyboard.html` - browser-friendly pitch storyboard.

Generate the pitch video:

```bash
python scripts/generate_presentation.py
```

The script uses MoviePy and Pillow, which are already available in the current
workspace. It attempts Windows text-to-speech narration first and falls back to
a generated audio track if speech synthesis is unavailable.

## Additional Files

- Database schema: `docs/database-schema.md`
- API documentation: `docs/api.md`
- Sample dataset: `docs/sample-dataset.json`
- Presentation generator: `scripts/generate_presentation.py`

## Demonstration Video Structure

Recommended duration: 1.5 minutes.

### Introduction

- Team name: CiteMind Team
- Problem statement: AI citation monitoring tools lack memory of what worked,
  why citations changed, and how to recover them.

### Solution Overview

- Architecture: React frontend, Express API, Socket.io live updates, MongoDB or
  in-memory storage, Groq model integration, and Hindsight/fallback memory.
- Main idea: every citation check and optimization outcome becomes memory for a
  site-specific agent.

### Live Demonstration

- Register or log in.
- Add a client website.
- Add AI-answer queries.
- Run citation monitoring.
- Seed the demo history.
- Compare empty-memory advice with memory-backed recommendations.
- View observation cards that prove the agent learned from repeated outcomes.

### Conclusion

Future enhancements:

- Add real integrations for more AI answer engines.
- Add scheduled monitoring jobs.
- Add exportable client reports.
- Add agency-level dashboards across many client sites.
- Add stronger analytics for citation recovery time and competitor movement.

Impact and scalability:

CiteMind can scale from a single client website to an agency portfolio because
each site has its own memory bank. The more checks and experiments a team runs,
the more useful the recommendations become.

## Project Structure

```text
CiteMind/
├── backend/
│   ├── server.js
│   └── src/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── store/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── services/
├── docs/
├── media/
├── scripts/
└── render.yaml
```

## One-Line Pitch

CiteMind does not just tell you that your AI citations changed; it remembers
what caused the change, what fixed it, and what your team should do next.
