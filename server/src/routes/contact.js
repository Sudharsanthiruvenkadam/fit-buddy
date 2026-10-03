import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import ContactMessage from '../models/ContactMessage.js';

const router = Router();

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'You have sent several messages recently. Please try again later.' },
});

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(254),
  subject: z.string().trim().max(120).optional().default(''),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.').max(2000, 'Message must be 2000 characters or fewer.'),
});

router.post('/', limiter, async (req, res) => {
  const data = schema.parse(req.body);
  await ContactMessage.create(data);
  res.status(201).json({ success: true, data: { saved: true } });
});

export default router;
