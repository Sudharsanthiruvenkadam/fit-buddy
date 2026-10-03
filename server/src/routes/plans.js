import { Router } from 'express';
import mongoose from 'mongoose';
import FitnessPlan from '../models/FitnessPlan.js';
import { HttpError } from '../middleware/error.js';

const router = Router();

router.get('/', async (req, res) => {
  const plans = await FitnessPlan.find().sort({ durationWeeks: 1 }).populate('schedule.workout', 'name durationMinutes');
  res.json({ success: true, data: plans });
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Plan not found.');
  const plan = await FitnessPlan.findById(req.params.id).populate('schedule.workout', 'name durationMinutes');
  if (!plan) throw new HttpError(404, 'Plan not found.');
  res.json({ success: true, data: plan });
});

export default router;
