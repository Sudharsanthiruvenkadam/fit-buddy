import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import FitnessPlan from '../models/FitnessPlan.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';

const router = Router();
router.use(requireAuth);

router.get('/me/plan', async (req, res) => {
  const plan = req.user.currentPlan
    ? await FitnessPlan.findById(req.user.currentPlan).populate('schedule.workout', 'name durationMinutes')
    : null;
  res.json({ success: true, data: plan });
});

router.put('/me/plan', async (req, res) => {
  const { planId } = z.object({ planId: z.string().nullable() }).parse(req.body);
  if (planId !== null) {
    if (!mongoose.isValidObjectId(planId) || !(await FitnessPlan.exists({ _id: planId }))) {
      throw new HttpError(404, 'Plan not found.');
    }
  }
  req.user.currentPlan = planId;
  await req.user.save();
  res.json({ success: true, data: { currentPlan: req.user.currentPlan } });
});

export default router;
