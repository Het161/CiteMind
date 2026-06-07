import express from 'express';
import auth from '../middleware/auth.js';
import { getSite, deleteChecks, deleteRecommendations, updateSiteShareOfModel, updateSiteBank } from '../store/repository.js';
import { retain, reflect, getObservations, clearBank, memoryCount } from '../services/hindsightService.js';
import { emitToSite } from '../socket.js';

const router = express.Router();
router.use(auth);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 3 months of realistic citation history told as a failure → recovery story.
// Reinforces beliefs Hindsight consolidates with MULTIPLE proofs:
//  (a) "FAQ schema + fresh stats recovers local-intent pages" → ~4-5 proofs, strengthening
//  (b) "Keyword stuffing causes citation drops" → ~2 proofs
//  (c) "Competitor BuildX displaces us within 2 weeks of a refresh" → ~2 proofs
const SEED = [
  "Jan 5, 2026: Tried keyword stuffing on the Ahmedabad page targeting 'web developer ahmedabad'. Citation dropped the next week — competitor BuildX displaced us. This was competitive decay caused by thin, stuffed content.",
  "Jan 20, 2026: OM Marketing Solutions was NOT cited by Perplexity for 'web developer ahmedabad'. Competitor BuildX was cited instead at position 1.",
  "Feb 2, 2026: Added FAQ schema markup to the Rajkot landing page for 'web designer rajkot'. The page was cited by ChatGPT within 2 weeks.",
  'Feb 18, 2026: Rajkot page citation position improved to position 1 after the FAQ schema addition held steady.',
  'Mar 3, 2026: Applied the same fix to the Ahmedabad page — added FAQ schema plus fresh 2026 statistics to replace stale data.',
  "Mar 12, 2026: Ahmedabad page was re-cited by Perplexity at position 2 for 'web developer ahmedabad'. The FAQ schema fix is working again.",
  "Mar 28, 2026: Ahmedabad page reached position 1 for 'web developer ahmedabad'. Full recovery took about 3 weeks after the FAQ schema and fresh-stats fix.",
  "Apr 5, 2026: Created a new Surat landing page targeting 'react developer for hire surat'. It is a local-intent query and the page is not yet cited anywhere.",
  'Apr 10, 2026: Added local directory backlinks plus FAQ schema to the Vadodara page. It was cited by Claude within 9 days.',
  "Apr 22, 2026: Vadodara page citation confirmed stable at position 1 for 'web development vadodara'.",
  'May 3, 2026: A second attempt at keyword stuffing on the Gandhinagar page caused another citation drop — confirming stuffed content hurts AI citations.',
  'May 15, 2026: Reverted the Gandhinagar page to FAQ-schema + concise factual content. Citation recovered within 2 weeks.',
  'May 28, 2026: Confirmed pattern across Rajkot, Ahmedabad, Vadodara, and Gandhinagar — FAQ schema plus fresh stats consistently recovers local-intent pages.',
  'Jun 2, 2026: Competitor BuildX refreshed their content and briefly displaced us on two queries — competitive decay tends to hit within 2 weeks of a competitor refresh.',
];

// Seed 3 months of history into BOTH the data store and Hindsight memory.
router.post('/:siteId/seed', async (req, res, next) => {
  try {
    const site = await getSite(req.params.siteId);
    if (!site || String(site.userId) !== String(req.user.id))
      return res.status(404).json({ error: 'Site not found' });

    // Stream each memory to the live feed immediately (for demo drama), while
    // the actual retain runs concurrently in the background. Awaiting Hindsight
    // retains one-by-one would take ~30s; this keeps the feed snappy.
    const gap = Number(req.query.gap ?? 400);
    const tasks = [];
    for (const memory of SEED) {
      emitToSite(site.id, 'memory_retained', { text: memory, ts: new Date().toISOString() });
      tasks.push(retain(site.bankId, memory)); // no siteId → don't double-emit
      if (gap > 0) await sleep(gap);
    }
    await Promise.allSettled(tasks);

    // Give Hindsight a moment to finish consolidating memory units.
    await sleep(2000);

    // Consolidate beliefs now that history exists (emits observation_formed).
    const observations = await getObservations(site.bankId, { siteId: site.id });
    emitToSite(site.id, 'seed_complete', { count: SEED.length, observations });

    res.json({ retained: SEED.length, observations, memoryCount: memoryCount(site.bankId) });
  } catch (err) {
    next(err);
  }
});

// Ask the agent with GUARANTEED-empty memory (powers the demo "before").
// Reflects on a throwaway empty bank so it always returns the generic answer,
// independent of whether the site's real bank has been seeded.
router.post('/:siteId/ask-empty', async (req, res, next) => {
  try {
    const question = req.body?.question || 'How do I get my new page cited?';
    const result = await reflect(`empty-probe-${Date.now()}`, question);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Clear the memory bank + checks for a fresh demo.
router.post('/:siteId/reset', async (req, res, next) => {
  try {
    const site = await getSite(req.params.siteId);
    if (!site || String(site.userId) !== String(req.user.id))
      return res.status(404).json({ error: 'Site not found' });

    // Hindsight cloud has no bank-delete, so rotate to a fresh empty bank.
    // (Also clears the local mirror for the old bank.)
    await clearBank(site.bankId);
    const baseBank = site.bankId.replace(/-\d{10,}$/, '');
    const freshBank = `${baseBank}-${Date.now()}`;
    await updateSiteBank(site.id, freshBank);

    await deleteChecks(site.id);
    await deleteRecommendations(site.id);
    await updateSiteShareOfModel(site.id, 0);
    emitToSite(site.id, 'demo_reset', {});

    res.json({ ok: true, bankId: freshBank });
  } catch (err) {
    next(err);
  }
});

export default router;
