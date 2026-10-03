import { Router } from 'express';
import mongoose from 'mongoose';
import Workout, { CATEGORIES, DIFFICULTIES } from '../models/Workout.js';
import { HttpError } from '../middleware/error.js';

const router = Router();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res) => {
  const { q, category, difficulty } = req.query;
  const filter = {};
  if (typeof q === 'string' && q.trim()) filter.name = new RegExp(escapeRegex(q.trim().slice(0, 50)), 'i');
  if (CATEGORIES.includes(category)) filter.category = category;
  if (DIFFICULTIES.includes(difficulty)) filter.difficulty = difficulty;
  const workouts = await Workout.find(filter).sort({ difficulty: 1, name: 1 });
  res.json({ success: true, data: workouts });
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Workout not found.');
  const workout = await Workout.findById(req.params.id);
  if (!workout) throw new HttpError(404, 'Workout not found.');
  res.json({ success: true, data: workout });
});

export default router;
