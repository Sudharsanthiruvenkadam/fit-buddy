import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Activity from '../models/Activity.js';
import Workout from '../models/Workout.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';
import { addDays, isRealDate, serverToday } from '../utils/dates.js';

const router = Router();
router.use(requireAuth);

const num = (max) => z.number().min(0, 'Cannot be negative.').max(max, `Maximum is ${max}.`);

const baseSchema = z.object({
  date: z.string().refine(isRealDate, 'Use a valid date (YYYY-MM-DD).'),
  title: z.string().trim().min(1, 'Give the activity a name.').max(80).optional(),
  workout: z.string().nullable().optional(),
  minutes: num(600).optional(),
  calories: num(5000).optional(),
  waterMl: num(10000).optional(),
  clientRequestId: z.string().max(64).optional(),
});

const needsSomething = (d, ctx) => {
  if (!(d.minutes > 0) && !(d.waterMl > 0)) {
    ctx.addIssue({ code: 'custom', path: ['minutes'], message: 'Enter workout minutes or water intake.' });
  }
};
const noFarFuture = (d, ctx) => {
  // allow tomorrow so users east of the server's timezone are not rejected
  if (d.date && d.date > addDays(serverToday(), 1)) {
    ctx.addIssue({ code: 'custom', path: ['date'], message: 'Date cannot be in the future.' });
  }
};

const createSchema = baseSchema.superRefine(needsSomething).superRefine(noFarFuture);
const updateSchema = baseSchema.partial().superRefine(noFarFuture);

const present = (a) => ({ ...a.toObject(), id: a._id });

async function findOwned(req) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Activity not found.');
  const a = await Activity.findOne({ _id: req.params.id, user: req.user._id });
  if (!a) throw new HttpError(404, 'Activity not found.');
  return a;
}

router.get('/', async (req, res) => {
  const filter = { user: req.user._id };
  const { from, to } = req.query;
  if (typeof from === 'string' && isRealDate(from)) filter.date = { ...filter.date, $gte: from };
  if (typeof to === 'string' && isRealDate(to)) filter.date = { ...filter.date, $lte: to };
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
  const items = await Activity.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit);
  res.json({ success: true, data: items.map(present) });
});

router.post('/', async (req, res) => {
  const d = createSchema.parse(req.body);
  const doc = { user: req.user._id, date: d.date, minutes: d.minutes ?? 0, waterMl: d.waterMl ?? 0, calories: d.calories ?? 0 };
  if (d.clientRequestId) {
    const existing = await Activity.findOne({ user: req.user._id, clientRequestId: d.clientRequestId });
    if (existing) return res.status(200).json({ success: true, data: present(existing) }); // duplicate click / retry
    doc.clientRequestId = d.clientRequestId;
  }
  let title = d.title;
  if (d.workout) {
    if (!mongoose.isValidObjectId(d.workout)) throw new HttpError(400, 'Invalid workout.');
    const w = await Workout.findById(d.workout);
    if (!w) throw new HttpError(404, 'Workout not found.');
    doc.workout = w._id;
    title ||= w.name;
    if (d.calories === undefined) doc.calories = Math.round(doc.minutes * w.caloriesPerMinute); // estimate
  }
  doc.title = title || (doc.minutes > 0 ? 'Workout' : 'Water intake');
  const activity = await Activity.create(doc);
  res.status(201).json({ success: true, data: present(activity) });
});

router.get('/:id', async (req, res) => {
  res.json({ success: true, data: present(await findOwned(req)) });
});

router.patch('/:id', async (req, res) => {
  const a = await findOwned(req);
  const { workout, clientRequestId, ...d } = updateSchema.parse(req.body);
  Object.assign(a, d);
  if (!(a.minutes > 0) && !(a.waterMl > 0)) throw new HttpError(400, 'An activity needs workout minutes or water intake.');
  await a.save();
  res.json({ success: true, data: present(a) });
});

router.delete('/:id', async (req, res) => {
  const a = await findOwned(req);
  await a.deleteOne();
  res.json({ success: true, data: null });
});

export default router;
