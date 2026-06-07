import { checkCitation } from './groqService.js';
import { analyzeDecay } from './decayAnalyzer.js';
import { retainCitationEvent } from './hindsightService.js';
import {
  createCheck,
  listChecks,
  updateSiteShareOfModel,
  listQueries,
} from '../store/repository.js';
import { emitToSite } from '../socket.js';
import logger from '../utils/logger.js';

const ENGINES = ['perplexity', 'chatgpt', 'claude', 'ai_overview'];
const COMPETITORS = ['buildx.com', 'webwizards.in', 'pixelforge.dev', 'codecraft.io'];

function pickEngine(i) {
  return ENGINES[i % ENGINES.length];
}

/**
 * Run a citation check for one site + one query against one AI engine.
 * Saves a CitationCheck, retains it to memory, emits a live socket event.
 */
export async function runCheckForQuery(site, query, engine) {
  const result = await checkCitation(query.text, site.domain, COMPETITORS);
  const sources = (result.cited_sources || []).map((s) => String(s).toLowerCase());
  const domain = site.domain.toLowerCase();

  const cited = sources.some((s) => s.includes(domain) || domain.includes(s));
  const position = cited ? sources.findIndex((s) => s.includes(domain) || domain.includes(s)) + 1 : null;
  const competitorCited = cited ? null : result.cited_sources?.[0] || COMPETITORS[0];

  let decayType = null;
  if (!cited) {
    try {
      decayType = await analyzeDecay(query.text, site.domain, competitorCited);
    } catch (err) {
      logger.warn(`decay analyze failed: ${err.message}`);
      decayType = 'structural';
    }
  }

  const check = await createCheck({
    siteId: site.id,
    queryId: query.id,
    engine,
    cited,
    position,
    competitorCited,
    decayType,
    rawAnswer: result.answer_summary || '',
  });

  // Live UI event for the citation result.
  emitToSite(site.id, 'citation_checked', {
    query: query.text,
    engine,
    cited,
    position,
    competitorCited,
    decayType,
  });

  // Store the outcome as memory (also emits memory_retained).
  await retainCitationEvent(site.bankId, check, query, site, { siteId: site.id });

  return check;
}

/** Run checks across all of a site's queries. Recomputes Share of Model. */
export async function runMonitor(site) {
  const queries = await listQueries(site.id);
  const results = [];

  for (let i = 0; i < queries.length; i++) {
    const engine = pickEngine(i);
    try {
      results.push(await runCheckForQuery(site, queries[i], engine));
    } catch (err) {
      logger.error(`check failed for "${queries[i].text}": ${err.message}`);
    }
  }

  const shareOfModel = await recomputeShareOfModel(site.id);
  emitToSite(site.id, 'monitor_complete', { shareOfModel, checks: results.length });

  return { results, shareOfModel };
}

/** Share of Model = % of a site's queries where the latest check was cited. */
export async function recomputeShareOfModel(siteId) {
  const checks = await listChecks(siteId, 500);
  const latestByQuery = new Map();
  for (const c of checks) {
    // checks come back newest-first, so the first one we see per query is latest.
    if (!latestByQuery.has(String(c.queryId))) latestByQuery.set(String(c.queryId), c);
  }
  const all = [...latestByQuery.values()];
  if (all.length === 0) return 0;
  const cited = all.filter((c) => c.cited).length;
  const share = Math.round((cited / all.length) * 100);
  await updateSiteShareOfModel(siteId, share);
  return share;
}
