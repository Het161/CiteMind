import express from 'express';
import auth from '../middleware/auth.js';
import {
  createSite,
  listSites,
  getSite,
  createQuery,
  listQueries,
  listChecks,
} from '../store/repository.js';

const router = express.Router();
router.use(auth);

const slug = (domain) =>
  'site-' +
  String(domain)
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Create a tracked site (also derives its Hindsight bank id).
router.post('/', async (req, res, next) => {
  try {
    const { domain, name } = req.body;
    if (!domain || !name) return res.status(400).json({ error: 'domain and name are required' });
    const site = await createSite({
      userId: req.user.id,
      domain,
      name,
      bankId: slug(domain),
      shareOfModel: 0,
    });
    res.status(201).json(site);
  } catch (err) {
    next(err);
  }
});

// List the user's sites.
router.get('/', async (req, res, next) => {
  try {
    res.json(await listSites(req.user.id));
  } catch (err) {
    next(err);
  }
});

// Site detail + queries + recent checks.
router.get('/:id', async (req, res, next) => {
  try {
    const site = await getSite(req.params.id);
    if (!site || String(site.userId) !== String(req.user.id))
      return res.status(404).json({ error: 'Site not found' });
    const [queries, checks] = await Promise.all([
      listQueries(site.id),
      listChecks(site.id, 50),
    ]);
    res.json({ site, queries, checks });
  } catch (err) {
    next(err);
  }
});

// Add target queries to a site (accepts one or many).
router.post('/:id/queries', async (req, res, next) => {
  try {
    const site = await getSite(req.params.id);
    if (!site || String(site.userId) !== String(req.user.id))
      return res.status(404).json({ error: 'Site not found' });

    const items = Array.isArray(req.body.queries) ? req.body.queries : [req.body];
    const created = [];
    for (const item of items) {
      if (!item.text) continue;
      created.push(
        await createQuery({
          siteId: site.id,
          text: item.text,
          intent: item.intent || 'informational',
        })
      );
    }
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;
