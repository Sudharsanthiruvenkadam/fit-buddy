import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import User from '../models/User.js';
import { HttpError } from '../middleware/error.js';
import { requireAuth, setAuthCookie, COOKIE_NAME } from '../middleware/auth.js';

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please wait a few minutes and try again.' },
});

const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(254);

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(50),
    email,
    password: z.string().min(8, 'Password must be at least 8 characters.').max(72, 'Password is too long.'),
    confirmPassword: z.string().optional(),
  })
  .refine((d) => d.confirmPassword === undefined || d.confirmPassword === d.password, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

const loginSchema = z.object({ email, password: z.string().min(1, 'Enter your password.').max(72) });

router.post('/register', limiter, async (req, res) => {
  const data = registerSchema.parse(req.body);
  if (await User.exists({ email: data.email })) {
    throw new HttpError(409, 'An account with this email already exists.', { email: 'This email is already registered.' });
  }
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({ name: data.name, email: data.email, passwordHash });
  setAuthCookie(res, user._id);
  res.status(201).json({ success: true, data: user.toPublic() });
});

router.post('/login', limiter, async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({ email: data.email });
  const ok = user && (await bcrypt.compare(data.password, user.passwordHash));
  if (!ok) throw new HttpError(401, 'Invalid email or password.');
  setAuthCookie(res, user._id);
  res.json({ success: true, data: user.toPublic() });
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ success: true, data: null });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ success: true, data: req.user.toPublic() });
});

export default router;
