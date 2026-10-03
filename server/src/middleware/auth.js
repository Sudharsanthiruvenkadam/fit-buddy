import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HttpError } from './error.js';

export const COOKIE_NAME = 'fb_token';

export function setAuthCookie(res, userId) {
  const token = jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new HttpError(401, 'Please log in to continue.');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Your session has expired. Please log in again.');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, 'Please log in to continue.');
  req.user = user; // the ONLY source of user identity — never trust IDs sent by the browser
  next();
}
