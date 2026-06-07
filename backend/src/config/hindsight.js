import logger from '../utils/logger.js';

// Attempts to construct the real Hindsight client. If the package or
// credentials are missing, returns null and the service layer falls back to a
// built-in Groq-backed memory engine so the demo still works.
let client = null;
let mode = 'fallback';

export async function initHindsight() {
  const baseUrl = process.env.HINDSIGHT_BASE_URL;
  if (!baseUrl) {
    logger.warn('HINDSIGHT_BASE_URL not set — using built-in memory engine (fallback mode).');
    return { client: null, mode };
  }

  try {
    const mod = await import('@vectorize-io/hindsight-client');
    const HindsightClient = mod.HindsightClient || mod.default;
    client = new HindsightClient({
      baseUrl,
      ...(process.env.HINDSIGHT_API_KEY ? { apiKey: process.env.HINDSIGHT_API_KEY } : {}),
    });
    mode = 'hindsight';
    logger.info(`Hindsight client connected: ${baseUrl}`);
  } catch (err) {
    logger.warn(`Hindsight client unavailable (${err.message}). Using built-in memory engine.`);
    client = null;
    mode = 'fallback';
  }

  return { client, mode };
}

export const getHindsight = () => client;
export const getHindsightMode = () => mode;
