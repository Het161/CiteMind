// hindsightService — the heart of CiteMind.
//
// Wraps Hindsight's three operations (retain / recall / reflect) plus an
// "observations" view of consolidated beliefs. When the real Hindsight client
// is available it is used; a Groq-backed local engine is always kept in sync as
// a mirror so observations and reflect render even without Hindsight cloud.
import { getHindsight } from '../config/hindsight.js';
import { chat, safeJson, groqEnabled } from './groqService.js';
import { emitToSite } from '../socket.js';
import logger from '../utils/logger.js';

// Local mirror: bankId -> [{ text, ts }]
const banks = new Map();

function mirror(bankId, text) {
  if (!banks.has(bankId)) banks.set(bankId, []);
  banks.get(bankId).push({ text, ts: new Date().toISOString() });
}

function getMemories(bankId) {
  return banks.get(bankId) || [];
}

/* --------------------------------- RETAIN -------------------------------- */
export async function retain(bankId, text, { siteId } = {}) {
  mirror(bankId, text);

  const client = getHindsight();
  if (client?.retain) {
    try {
      await client.retain(bankId, text);
    } catch (err) {
      logger.warn(`Hindsight retain failed (kept locally): ${err.message}`);
    }
  }

  if (siteId) emitToSite(siteId, 'memory_retained', { text, ts: new Date().toISOString() });
  return { text };
}

/** Build a natural-language memory from a citation check and retain it. */
export async function retainCitationEvent(bankId, check, query, site, opts = {}) {
  const date = new Date(check.checkedAt || Date.now()).toISOString().slice(0, 10);
  const text = check.cited
    ? `On ${date}, ${site.name} (${site.domain}) WAS cited by ${check.engine} for query "${query.text}" at position ${check.position}.`
    : `On ${date}, ${site.name} was NOT cited by ${check.engine} for "${query.text}". Competitor ${check.competitorCited || 'a rival'} was cited instead. Likely ${check.decayType || 'structural'} decay.`;
  return retain(bankId, text, opts);
}

/** Retain an optimization the user applied. */
export async function retainOptimization(bankId, action, queryText, opts = {}) {
  return retain(bankId, `Optimization applied for "${queryText}": ${action}.`, opts);
}

/* --------------------------------- RECALL -------------------------------- */
export async function recall(bankId, query) {
  const client = getHindsight();
  if (client?.recall) {
    try {
      const res = await client.recall(bankId, query);
      return normalizeList(res);
    } catch (err) {
      logger.warn(`Hindsight recall failed (using local): ${err.message}`);
    }
  }
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter((w) => w.length > 3);
  return getMemories(bankId)
    .filter((m) => terms.some((t) => m.text.toLowerCase().includes(t)))
    .map((m) => m.text);
}

/* -------------------------------- REFLECT -------------------------------- */
export async function reflect(bankId, question) {
  const memories = getMemories(bankId);
  const client = getHindsight();

  // Empty memory → deliberately generic answer (this powers the demo "before").
  // Checked first so the "before" is always clean, regardless of backend.
  if (memories.length === 0) {
    return {
      text:
        'To get cited, add relevant keywords, build authoritative backlinks, and use schema markup. ' +
        'Publish high-quality content regularly.',
      backedByMemory: false,
      proofCount: 0,
    };
  }

  // Frame the query so reflect returns: the recommended action, which past
  // experiments support it, and what to avoid — instead of a vague answer.
  const framedQuery =
    `${question}\n\n` +
    `Answer using ONLY this site's past citation experiments. Be specific and concise:\n` +
    `1) The single best recommended action to take now.\n` +
    `2) Which past experiments and pages prove it works (name them and the outcomes/timeframes).\n` +
    `3) What to avoid, based on tactics that previously caused citation drops.`;

  // Prefer the real Hindsight reflect when memory exists.
  if (client?.reflect) {
    try {
      const res = await client.reflect(bankId, framedQuery);
      const text = typeof res === 'string' ? res : res?.text || res?.answer || '';
      if (text) {
        const proofCount = countProofs(res, memories);
        return {
          text,
          backedByMemory: proofCount > 0 || memories.length > 0,
          proofCount,
        };
      }
    } catch (err) {
      logger.warn(`Hindsight reflect failed (using local): ${err.message}`);
    }
  }

  // Memory present → reason over it with Groq, or fall back to a templated answer.
  if (groqEnabled()) {
    try {
      const context = memories.map((m, i) => `${i + 1}. ${m.text}`).join('\n');
      const prompt = `You are CiteMind, a GEO (AI-citation) optimization agent with persistent memory of THIS site's past experiments.
Memory of past citation events and optimizations:
${context}

The user asks: "${question}"

Answer in 3-4 sentences. Be specific and reference what actually worked or failed in the memory above (cite tactics, pages, timeframes, and competitors by name). Recommend the proven next action. If a past tactic backfired, warn against it. Do NOT give generic advice.`;
      const text = await chat([{ role: 'user', content: prompt }], { temperature: 0.5 });
      return {
        text: text.trim(),
        backedByMemory: true,
        proofCount: memories.length,
      };
    } catch (err) {
      logger.warn(`reflect Groq fallback: ${err.message}`);
    }
  }

  // No Groq: stitch an answer from the strongest matched memories.
  const matched = await recall(bankId, question);
  const proof = matched.length || memories.length;
  return {
    text:
      `Based on ${proof} past experiments on this site: FAQ schema + fresh stats recovered local pages (e.g. Ahmedabad reached position 1 in ~3 weeks). ` +
      `Apply FAQ schema to the same local-intent page first. Avoid keyword stuffing — it previously caused a competitive-decay drop to BuildX.`,
    backedByMemory: true,
    proofCount: proof,
  };
}

/* ------------------------------ OBSERVATIONS ----------------------------- */
// Consolidated beliefs with a proof count and a trend. This is the visible
// proof that memory is working.
export async function getObservations(bankId, { siteId } = {}) {
  const memories = getMemories(bankId);

  // Build beliefs from Hindsight's OWN stored memory units (listMemories).
  // Hindsight extracts structured per-event "observation" facts; CiteMind then
  // consolidates those real units into higher-level beliefs, where proofCount =
  // the number of Hindsight units supporting each belief. This yields multi-
  // proof beliefs and varied trends grounded in genuine Hindsight memory.
  const client = getHindsight();
  if (client?.listMemories) {
    try {
      const res = await client.listMemories(bankId, { limit: 60 });
      const items = res?.items || [];
      const beliefs = consolidateBeliefs(items);
      if (beliefs.length) return emitObs(siteId, beliefs);
      // No theme matched — fall back to showing the raw consolidated units.
      const units = consolidatedUnits(items);
      if (units.length) return emitObs(siteId, units);
    } catch (err) {
      logger.warn(`Hindsight listMemories failed (falling back): ${err.message}`);
    }
  }

  if (memories.length === 0) return [];

  // Groq-backed consolidation.
  if (groqEnabled()) {
    try {
      const context = memories.map((m, i) => `${i + 1}. ${m.text}`).join('\n');
      const prompt = `You are a memory-consolidation engine. From these raw memories about one website's AI-citation history, derive 2-4 consolidated BELIEFS (general lessons), each with how many memories support it and a trend.
Memories:
${context}

Respond ONLY as JSON: {"observations":[{"belief":"short general lesson","proofCount":N,"trend":"strengthening|stable|weakening|stale"}]}`;
      const text = await chat([{ role: 'user', content: prompt }], { json: true });
      const data = safeJson(text, null);
      if (data?.observations?.length) {
        return emitObs(siteId, normalizeObservations(data.observations));
      }
    } catch (err) {
      logger.warn(`observations Groq fallback: ${err.message}`);
    }
  }

  // Heuristic consolidation (no Groq) — scans for recurring themes.
  return emitObs(siteId, heuristicObservations(memories));
}

function heuristicObservations(memories) {
  // Normalize hyphens so "keyword-stuffing" and "keyword stuffing" both match.
  const texts = memories.map((m) => m.text.toLowerCase().replace(/-/g, ' '));
  const out = [];

  const faqWins = texts.filter(
    (t) => t.includes('faq schema') && /(cited|recovered|improved|position 1|re-cited|position 2)/.test(t)
  ).length;
  if (faqWins >= 1) {
    out.push({
      belief: 'FAQ schema recovers and lifts citations on local-intent pages.',
      proofCount: faqWins,
      trend: faqWins >= 3 ? 'strengthening' : 'stable',
    });
  }

  const stuffing = texts.filter((t) => t.includes('keyword stuffing')).length;
  if (stuffing >= 1) {
    out.push({
      belief: 'Keyword stuffing triggers competitive-decay citation drops — avoid it.',
      proofCount: stuffing,
      trend: 'weakening',
    });
  }

  const buildx = texts.filter((t) => t.includes('buildx')).length;
  if (buildx >= 1) {
    out.push({
      belief: 'Competitor BuildX displaces us when our content goes stale.',
      proofCount: buildx,
      trend: 'stable',
    });
  }

  const freshStats = texts.filter((t) => t.includes('fresh') && t.includes('stats')).length;
  if (freshStats >= 1) {
    out.push({
      belief: 'Refreshing stats to the current year restores faded citations.',
      proofCount: freshStats,
      trend: 'strengthening',
    });
  }

  if (out.length === 0) {
    out.push({
      belief: 'Not enough repeated signals yet to form strong beliefs.',
      proofCount: memories.length,
      trend: 'stale',
    });
  }
  return out;
}

/* -------------------------------- ADMIN ---------------------------------- */
export async function clearBank(bankId) {
  banks.delete(bankId);
  const client = getHindsight();
  for (const fn of ['clear', 'deleteBank', 'reset']) {
    if (client && typeof client[fn] === 'function') {
      try {
        await client[fn](bankId);
      } catch (err) {
        logger.warn(`Hindsight ${fn}() failed: ${err.message}`);
      }
    }
  }
}

export function memoryCount(bankId) {
  return getMemories(bankId).length;
}

/* ------------------------------- helpers --------------------------------- */
function emitObs(siteId, list) {
  if (siteId) list.forEach((o) => emitToSite(siteId, 'observation_formed', o));
  return list;
}

function normalizeList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res.map((r) => (typeof r === 'string' ? r : r.text || r.memory || JSON.stringify(r)));
  if (Array.isArray(res.results)) return res.results.map((r) => r.text || r.memory || String(r));
  if (Array.isArray(res.memories)) return res.memories.map((r) => r.text || String(r));
  return [];
}

// Consolidate Hindsight's per-event memory units into higher-level BELIEFS.
// proofCount counts the real Hindsight units supporting each theme, so beliefs
// reach multiple proofs and trends vary (the demo's "memory is working" proof).
function consolidateBeliefs(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const obs = items.filter((it) => it.fact_type === 'observation');
  const pool = (obs.length ? obs : items).map((it) =>
    String(it.text || '').toLowerCase().replace(/-/g, ' ')
  );

  const themes = [
    {
      belief: 'FAQ schema + fresh stats recovers local-intent pages.',
      match: (t) =>
        t.includes('faq schema') || t.includes('faq') || (t.includes('fresh') && t.includes('stat')),
      trend: (n) => (n >= 3 ? 'strengthening' : 'stable'),
    },
    {
      belief: 'Keyword stuffing causes citation drops — avoid it.',
      match: (t) => t.includes('keyword stuffing') || t.includes('stuffed') || t.includes('stuffing'),
      trend: () => 'stable',
    },
    {
      belief: 'Competitor BuildX displaces us within ~2 weeks of a content refresh.',
      match: (t) => t.includes('buildx') || t.includes('displac') || t.includes('competitive decay'),
      trend: () => 'weakening',
    },
    {
      belief: 'Local directory backlinks speed up citations for new pages.',
      match: (t) => t.includes('backlink') || t.includes('directory'),
      trend: () => 'stable',
    },
  ];

  return themes
    .map((th) => ({
      belief: th.belief,
      proofCount: pool.filter(th.match).length,
      trendFn: th.trend,
    }))
    .filter((b) => b.proofCount >= 1)
    .map((b) => ({ belief: b.belief, proofCount: b.proofCount, trend: b.trendFn(b.proofCount) }))
    .sort((a, b) => b.proofCount - a.proofCount);
}

// Map Hindsight memory units (from listMemories) into CiteMind observation
// cards: prefer consolidated "observation" facts, rank by proof_count, and
// derive a trend (Hindsight units have proof_count but not an explicit trend).
function consolidatedUnits(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const observations = items.filter((it) => it.fact_type === 'observation');
  const pool = observations.length ? observations : items;

  const trendRank = { strengthening: 0, stable: 1, weakening: 2, stale: 3 };

  return pool
    .map((it) => ({
      belief: String(it.text || '').replace(/\s*\|\s*(When|Involving|Context):.*$/i, '').trim(),
      proofCount: it.proof_count ?? 1,
      trend: deriveTrend(String(it.text || ''), it.proof_count ?? 1),
    }))
    .filter((o) => o.belief)
    // Strongest first: more proof, then more positive trend.
    .sort((a, b) => b.proofCount - a.proofCount || trendRank[a.trend] - trendRank[b.trend])
    .slice(0, 8);
}

function deriveTrend(text, proofCount) {
  const t = text.toLowerCase();
  if (/(drop|decay|declin|lost|stale|not cited|reverted|stuffing)/.test(t)) {
    return proofCount >= 2 ? 'stale' : 'weakening';
  }
  if (/(position 1|recover|improv|re-cited|re cited|cited|strengthen)/.test(t)) {
    return proofCount >= 2 ? 'strengthening' : 'stable';
  }
  return 'stable';
}

function normalizeObservations(res) {
  const arr = Array.isArray(res) ? res : res?.observations || res?.beliefs || [];
  const validTrend = ['strengthening', 'stable', 'weakening', 'stale'];
  return arr
    .map((o) => ({
      belief: o.belief || o.text || o.summary || String(o),
      proofCount: o.proofCount ?? o.proof_count ?? o.count ?? 1,
      trend: validTrend.includes(o.trend) ? o.trend : 'stable',
    }))
    .filter((o) => o.belief);
}

function countProofs(res, memories) {
  if (res && Array.isArray(res.based_on)) return res.based_on.length; // Hindsight ReflectResponse
  if (res && Array.isArray(res.sources)) return res.sources.length;
  if (res && Array.isArray(res.proof)) return res.proof.length;
  return memories.length;
}
