import Groq from 'groq-sdk';
import logger from '../utils/logger.js';

const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const hasKey = !!process.env.GROQ_API_KEY;

const groq = hasKey ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export const groqEnabled = () => hasKey;

/**
 * Low-level chat helper with one retry. Returns the assistant message string.
 */
export async function chat(messages, { json = false, temperature = 0.4 } = {}) {
  if (!groq) throw new Error('GROQ_API_KEY not configured');

  const opts = {
    model: MODEL,
    messages,
    temperature,
    ...(json ? { response_format: { type: 'json_object' } } : {}),
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await groq.chat.completions.create(opts);
      return res.choices[0]?.message?.content ?? '';
    } catch (err) {
      logger.warn(`Groq call failed (attempt ${attempt + 1}): ${err.message}`);
      if (attempt === 1) throw err;
    }
  }
}

/** Parse JSON defensively from an LLM response (handles ```json fences). */
export function safeJson(text, fallback = {}) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* fall through */
      }
    }
    return fallback;
  }
}

/**
 * Ask Groq to roleplay as an AI search engine and tell us which sources it
 * would cite for a query. This is our citation check.
 */
export async function checkCitation(queryText, siteDomain, competitors = []) {
  const known = [siteDomain, ...competitors].filter(Boolean).join(', ');
  const prompt = `You are an AI search engine like Perplexity. A user asks: "${queryText}".
Based on general web knowledge, list the top 3 source websites you would cite in your answer.
Known players in this space: ${known}.
Respond ONLY as JSON: {"cited_sources":["domain1","domain2","domain3"],"answer_summary":"one sentence"}`;

  if (!groq) {
    // Deterministic-ish fallback so the monitor still produces a result.
    const pool = [...competitors];
    const cited = Math.random() > 0.5;
    return {
      cited_sources: cited
        ? [siteDomain, ...pool].slice(0, 3)
        : [...pool, 'wikipedia.org'].slice(0, 3),
      answer_summary: `Simulated answer for "${queryText}" (Groq key not set).`,
    };
  }

  try {
    const text = await chat([{ role: 'user', content: prompt }], { json: true });
    const data = safeJson(text, null);
    if (!data || !Array.isArray(data.cited_sources)) throw new Error('bad shape');
    return data;
  } catch (err) {
    logger.warn(`checkCitation fallback for "${queryText}": ${err.message}`);
    return {
      cited_sources: [...competitors, 'wikipedia.org'].slice(0, 3),
      answer_summary: `Could not parse AI answer for "${queryText}".`,
    };
  }
}

/** Classify why a previously-cited query lost its citation. */
export async function classifyDecay(queryText, siteDomain, competitorCited) {
  const prompt = `A website (${siteDomain}) used to be cited by AI engines for the query "${queryText}" but no longer is${
    competitorCited ? `; competitor ${competitorCited} is now cited instead` : ''
  }.
Classify the most likely cause of this citation decay as exactly one of:
- "statistical" (the content has stale/old statistics)
- "structural" (AI engines now reward a different format, e.g. Q&A, bullets, schema)
- "competitive" (a competitor published deeper/fresher content)
Respond ONLY as JSON: {"decayType":"statistical|structural|competitive","reason":"short"}`;

  if (!groq) {
    const types = ['statistical', 'structural', 'competitive'];
    return { decayType: competitorCited ? 'competitive' : types[Math.floor(Math.random() * 3)], reason: 'simulated' };
  }

  try {
    const text = await chat([{ role: 'user', content: prompt }], { json: true });
    const data = safeJson(text, null);
    const valid = ['statistical', 'structural', 'competitive'];
    if (!data || !valid.includes(data.decayType)) throw new Error('bad shape');
    return data;
  } catch (err) {
    logger.warn(`classifyDecay fallback: ${err.message}`);
    return { decayType: competitorCited ? 'competitive' : 'structural', reason: 'fallback' };
  }
}
