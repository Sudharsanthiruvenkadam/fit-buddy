import { Router } from 'express';
import Activity from '../models/Activity.js';
import Goal from '../models/Goal.js';
import { requireAuth } from '../middleware/auth.js';
import { addDays, resolveToday, weekStart } from '../utils/dates.js';
import { calculateStreak } from '../utils/progress.js';
import { presentGoal } from './goals.js';

const router = Router();
router.use(requireAuth);

const sumStage = {
  minutes: { $sum: '$minutes' },
  calories: { $sum: '$calories' },
  waterMl: { $sum: '$waterMl' },
  sessions: { $sum: { $cond: [{ $gt: ['$minutes', 0] }, 1, 0] } },
};
const empty = { minutes: 0, calories: 0, waterMl: 0, sessions: 0 };
const pick = (row) => (row ? { minutes: row.minutes, calories: row.calories, waterMl: row.waterMl, sessions: row.sessions } : { ...empty });

router.get('/summary', async (req, res) => {
  const userId = req.user._id;
  const today = resolveToday(req.query.today);
  const wk = weekStart(today);

  const [[todayRow], [weekRow], [allRow], workoutDays, goals] = await Promise.all([
    Activity.aggregate([{ $match: { user: userId, date: today } }, { $group: { _id: null, ...sumStage } }]),
    Activity.aggregate([{ $match: { user: userId, date: { $gte: wk, $lte: addDays(wk, 6) } } }, { $group: { _id: null, ...sumStage } }]),
    Activity.aggregate([{ $match: { user: userId } }, { $group: { _id: null, ...sumStage } }]),
    Activity.distinct('date', { user: userId, minutes: { $gt: 0 } }),
    Goal.find({ user: userId }),
  ]);

  const presented = await Promise.all(goals.map((g) => presentGoal(userId, g, today)));
  // "Goal completion" = average percent across all of the user's goals (0 when there are none)
  const percent = presented.length ? Math.round(presented.reduce((s, g) => s + g.percent, 0) / presented.length) : 0;

  res.json({
    success: true,
    data: {
      today: pick(todayRow),
      week: pick(weekRow),
      total: pick(allRow),
      streak: calculateStreak(workoutDays, today),
      goalCompletion: { percent, completed: presented.filter((g) => g.status === 'completed').length, total: presented.length },
    },
  });
});

router.get('/history', async (req, res) => {
  const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 7;
  const today = resolveToday(req.query.today);
  const from = addDays(today, -(days - 1));
  const rows = await Activity.aggregate([
    { $match: { user: req.user._id, date: { $gte: from, $lte: today } } },
    { $group: { _id: '$date', ...sumStage } },
  ]);
  const byDate = new Map(rows.map((r) => [r._id, r]));
  const data = Array.from({ length: days }, (_, i) => {
    const date = addDays(from, i);
    return { date, ...pick(byDate.get(date)) };
  });
  res.json({ success: true, data });
});

export default router;
