import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Goal, { GOAL_TYPES } from '../models/Goal.js';
import Activity from '../models/Activity.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';
import { isRealDate, resolveToday } from '../utils/dates.js';
import { percentOf, goalStatus } from '../utils/progress.js';

const router = Router();
router.use(requireAuth);

const DEFAULT_UNITS = { minutes: 'min', sessions: 'sessions', water: 'ml' };
const dateField = z.string().refine(isRealDate, 'Use a valid date (YYYY-MM-DD).');

const baseSchema = z.object({
  title: z.string().trim().min(2, 'Give your goal a title.').max(80),
  description: z.string().trim().max(300).optional().default(''),
  type: z.enum(GOAL_TYPES),
  targetValue: z.number({ invalid_type_error: 'Target must be a number.' }).positive('Target must be greater than 0.').max(1_000_000),
  unit: z.string().trim().max(20).optional(),
  startDate: dateField,
  deadline: dateField.nullable().optional(),
});

const checkDates = (d, ctx) => {
  if (d.deadline && d.startDate && d.deadline < d.startDate) {
    ctx.addIssue({ code: 'custom', path: ['deadline'], message: 'Deadline cannot be before the start date.' });
  }
};
const createSchema = baseSchema.superRefine(checkDates);
const updateSchema = baseSchema
  .partial()
  .extend({ manualValue: z.number().min(0).max(1_000_000).optional(), completed: z.boolean().optional() })
  .superRefine(checkDates);

// Progress rule: minutes / sessions / water goals are calculated from the user's recorded
// activities between startDate and deadline (inclusive). "custom" goals use manualValue.
async function currentValue(userId, goal) {
  if (goal.type === 'custom') return goal.manualValue;
  const range = { $gte: goal.startDate };
  if (goal.deadline) range.$lte = goal.deadline;
  const [row] = await Activity.aggregate([
    { $match: { user: userId, date: range } },
    {
      $group: {
        _id: null,
        minutes: { $sum: '$minutes' },
        water: { $sum: '$waterMl' },
        sessions: { $sum: { $cond: [{ $gt: ['$minutes', 0] }, 1, 0] } },
      },
    },
  ]);
  return row ? row[goal.type] : 0;
}

export async function presentGoal(userId, goal, today) {
  const current = await currentValue(userId, goal);
  const o = goal.toObject();
  return {
    ...o,
    id: o._id,
    currentValue: current,
    percent: percentOf(current, goal.targetValue),
    status: goalStatus({ current, target: goal.targetValue, completedAt: goal.completedAt, deadline: goal.deadline }, today),
  };
}

async function findOwned(req) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Goal not found.');
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id }); // ownership enforced here
  if (!goal) throw new HttpError(404, 'Goal not found.');
  return goal;
}

router.get('/', async (req, res) => {
  const today = resolveToday(req.query.today);
  const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
  const data = await Promise.all(goals.map((g) => presentGoal(req.user._id, g, today)));
  res.json({ success: true, data });
});

router.post('/', async (req, res) => {
  const d = createSchema.parse(req.body);
  const goal = await Goal.create({
    user: req.user._id,
    ...d,
    unit: d.unit || DEFAULT_UNITS[d.type] || 'units',
    deadline: d.deadline ?? null,
  });
  res.status(201).json({ success: true, data: await presentGoal(req.user._id, goal, resolveToday(req.query.today)) });
});

router.get('/:id', async (req, res) => {
  const goal = await findOwned(req);
  res.json({ success: true, data: await presentGoal(req.user._id, goal, resolveToday(req.query.today)) });
});

router.patch('/:id', async (req, res) => {
  const goal = await findOwned(req);
  const { completed, ...d } = updateSchema.parse(req.body);
  if (d.type && d.type !== goal.type && !d.unit) d.unit = DEFAULT_UNITS[d.type] || goal.unit;
  Object.assign(goal, d);
  if (goal.deadline && goal.deadline < goal.startDate) throw new HttpError(400, 'Deadline cannot be before the start date.');
  if (completed === true) goal.completedAt = new Date();
  if (completed === false) goal.completedAt = null;
  await goal.save();
  res.json({ success: true, data: await presentGoal(req.user._id, goal, resolveToday(req.query.today)) });
});

router.delete('/:id', async (req, res) => {
  const goal = await findOwned(req);
  await goal.deleteOne();
  res.json({ success: true, data: null });
});

export default router;
