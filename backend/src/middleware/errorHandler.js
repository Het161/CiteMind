import logger from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} — ${err.stack || err.message}`);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}
