import express from 'express';
import auth from '../middleware/auth.js';
import { getSite } from '../store/repository.js';
import { runMonitor } from '../services/citationChecker.js';

const router = express.Router();
router.use(auth);

// Run a citation check across all queries for a site.
// Emits live socket events; each result is retained to Hindsight.
router.post('/:siteId/run', async (req, res, next) => {
  try {
    const site = await getSite(req.params.siteId);
    if (!site || String(site.userId) !== String(req.user.id))
      return res.status(404).json({ error: 'Site not found' });

    const { results, shareOfModel } = await runMonitor(site);
    res.json({
      shareOfModel,
      checks: results.map((c) => ({
        engine: c.engine,
        cited: c.cited,
        position: c.position,
        competitorCited: c.competitorCited,
        decayType: c.decayType,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
