import jwt from 'jsonwebtoken';
import { findUserById } from '../store/repository.js';

export default async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await findUserById(payload.id);
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    req.user = { id: user.id, name: user.name, email: user.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
