import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import { connectDB } from './src/config/db.js';
import { initHindsight, getHindsightMode } from './src/config/hindsight.js';
import { setIo } from './src/socket.js';
import { groqEnabled } from './src/services/groqService.js';
import logger from './src/utils/logger.js';
import errorHandler from './src/middleware/errorHandler.js';

import authRoutes from './src/routes/auth.js';
import siteRoutes from './src/routes/sites.js';
import monitorRoutes from './src/routes/monitor.js';
import agentRoutes from './src/routes/agent.js';
import demoRoutes from './src/routes/demo.js';

const PORT = process.env.PORT || 5000;
// CORS origin: set CLIENT_URL to your frontend URL to lock it down, or leave it
// unset / "*" to allow any origin (handy for Vercel preview URLs during a demo).
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const CORS_ORIGIN = !process.env.CLIENT_URL || process.env.CLIENT_URL === '*' ? true : CLIENT_URL;

async function start() {
  await connectDB();
  await initHindsight();

  const app = express();
  app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
  app.use(express.json());

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: CORS_ORIGIN } });
  setIo(io);

  io.on('connection', (socket) => {
    socket.on('join_site', (siteId) => socket.join(String(siteId)));
    socket.on('leave_site', (siteId) => socket.leave(String(siteId)));
  });

  app.get('/api/health', (req, res) =>
    res.json({
      ok: true,
      memory: getHindsightMode(), // 'hindsight' | 'fallback'
      groq: groqEnabled(),
    })
  );

  app.use('/api/auth', authRoutes);
  app.use('/api/sites', siteRoutes);
  app.use('/api/monitor', monitorRoutes);
  app.use('/api/agent', agentRoutes);
  app.use('/api/demo', demoRoutes);

  app.use(errorHandler);

  server.listen(PORT, () => {
    logger.info(`CiteMind backend on http://localhost:${PORT}`);
    logger.info(`Memory mode: ${getHindsightMode()} | Groq: ${groqEnabled() ? 'on' : 'off (simulated)'}`);
  });
}

start().catch((err) => {
  logger.error(`Failed to start: ${err.stack || err.message}`);
  process.exit(1);
});
