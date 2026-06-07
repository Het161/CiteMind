import express from 'express';
import auth from '../middleware/auth.js';
import { getSite, createRecommendation } from '../store/repository.js';
import { getObservations, reflect } from '../services/hindsightService.js';

const router = express.Router();
router.use(auth);

// Consolidated beliefs (proof that memory is working).
router.get('/:siteId/observations', async (req, res, next) => {
  try {
    const site = await getSite(req.params.siteId);
    if (!site || String(site.userId) !== String(req.user.id))
      return res.status(404).json({ error: 'Site not found' });

    const observations = await getObservations(site.bankId, { siteId: site.id });
    res.json({ observations });
  } catch (err) {
    next(err);
  }
});

// Ask the agent — reasons over memory via reflect().
router.post('/:siteId/ask', async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });

    const site = await getSite(req.params.siteId);
    if (!site || String(site.userId) !== String(req.user.id))
      return res.status(404).json({ error: 'Site not found' });

    const result = await reflect(site.bankId, question);
    await createRecommendation({
      siteId: site.id,
      queryText: question,
      answer: result.text,
      backedByMemory: result.backedByMemory,
      proofCount: result.proofCount,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
