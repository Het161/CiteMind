// Unified data-access layer. Uses MongoDB (via mongoose models) when connected,
// otherwise an in-memory store so the demo runs with zero infrastructure.
import mongoose from 'mongoose';
import { dbState } from '../config/db.js';
import User from '../models/User.js';
import Site from '../models/Site.js';
import Query from '../models/Query.js';
import CitationCheck from '../models/CitationCheck.js';
import Recommendation from '../models/Recommendation.js';

const mem = {
  users: [],
  sites: [],
  queries: [],
  checks: [],
  recommendations: [],
  seq: 1,
};

const useMemory = () => !dbState.connected;
const newId = () => `mem_${mem.seq++}_${Date.now().toString(36)}`;

// Normalize a mongoose doc to a plain object with a string `id`.
const norm = (doc) => {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : { ...doc };
  o.id = String(o._id || o.id);
  // Stringify ObjectId refs for easy comparison on the client.
  for (const k of ['userId', 'siteId', 'queryId']) {
    if (o[k] != null) o[k] = String(o[k]);
  }
  return o;
};

const eq = (a, b) => String(a) === String(b);

/* ------------------------------- Users ------------------------------- */
export async function createUser(data) {
  if (useMemory()) {
    const u = { id: newId(), createdAt: new Date(), ...data };
    mem.users.push(u);
    return { ...u };
  }
  return norm(await User.create(data));
}

export async function findUserByEmail(email) {
  const e = String(email).toLowerCase();
  if (useMemory()) return mem.users.find((u) => u.email === e) || null;
  return norm(await User.findOne({ email: e }));
}

export async function findUserById(id) {
  if (useMemory()) return mem.users.find((u) => eq(u.id, id)) || null;
  if (!mongoose.isValidObjectId(id)) return null;
  return norm(await User.findById(id));
}

/* ------------------------------- Sites ------------------------------- */
export async function createSite(data) {
  if (useMemory()) {
    const s = { id: newId(), shareOfModel: 0, createdAt: new Date(), ...data };
    mem.sites.push(s);
    return { ...s };
  }
  return norm(await Site.create(data));
}

export async function listSites(userId) {
  if (useMemory())
    return mem.sites.filter((s) => eq(s.userId, userId)).map((s) => ({ ...s }));
  const docs = await Site.find({ userId }).sort({ createdAt: -1 });
  return docs.map(norm);
}

export async function getSite(id) {
  if (useMemory()) return mem.sites.find((s) => eq(s.id, id)) || null;
  if (!mongoose.isValidObjectId(id)) return null;
  return norm(await Site.findById(id));
}

export async function updateSiteBank(id, bankId) {
  if (useMemory()) {
    const s = mem.sites.find((x) => eq(x.id, id));
    if (s) s.bankId = bankId;
    return s ? { ...s } : null;
  }
  return norm(await Site.findByIdAndUpdate(id, { bankId }, { new: true }));
}

export async function updateSiteShareOfModel(id, shareOfModel) {
  if (useMemory()) {
    const s = mem.sites.find((x) => eq(x.id, id));
    if (s) s.shareOfModel = shareOfModel;
    return s ? { ...s } : null;
  }
  return norm(
    await Site.findByIdAndUpdate(id, { shareOfModel }, { new: true })
  );
}

/* ------------------------------ Queries ------------------------------ */
export async function createQuery(data) {
  if (useMemory()) {
    const q = { id: newId(), createdAt: new Date(), ...data };
    mem.queries.push(q);
    return { ...q };
  }
  return norm(await Query.create(data));
}

export async function listQueries(siteId) {
  if (useMemory())
    return mem.queries.filter((q) => eq(q.siteId, siteId)).map((q) => ({ ...q }));
  const docs = await Query.find({ siteId }).sort({ createdAt: 1 });
  return docs.map(norm);
}

/* --------------------------- CitationChecks -------------------------- */
export async function createCheck(data) {
  if (useMemory()) {
    const c = { id: newId(), checkedAt: new Date(), ...data };
    mem.checks.push(c);
    return { ...c };
  }
  return norm(await CitationCheck.create(data));
}

export async function listChecks(siteId, limit = 50) {
  if (useMemory())
    return mem.checks
      .filter((c) => eq(c.siteId, siteId))
      .sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt))
      .slice(0, limit)
      .map((c) => ({ ...c }));
  const docs = await CitationCheck.find({ siteId })
    .sort({ checkedAt: -1 })
    .limit(limit);
  return docs.map(norm);
}

export async function deleteChecks(siteId) {
  if (useMemory()) {
    mem.checks = mem.checks.filter((c) => !eq(c.siteId, siteId));
    return;
  }
  await CitationCheck.deleteMany({ siteId });
}

/* -------------------------- Recommendations ------------------------- */
export async function createRecommendation(data) {
  if (useMemory()) {
    const r = { id: newId(), createdAt: new Date(), ...data };
    mem.recommendations.push(r);
    return { ...r };
  }
  return norm(await Recommendation.create(data));
}

export async function deleteRecommendations(siteId) {
  if (useMemory()) {
    mem.recommendations = mem.recommendations.filter((r) => !eq(r.siteId, siteId));
    return;
  }
  await Recommendation.deleteMany({ siteId });
}
