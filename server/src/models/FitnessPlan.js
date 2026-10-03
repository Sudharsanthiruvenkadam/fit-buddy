import mongoose from 'mongoose';
import { DIFFICULTIES } from './Workout.js';

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    goal: { type: String, required: true },
    durationWeeks: { type: Number, required: true, min: 1, max: 52 },
    difficulty: { type: String, enum: DIFFICULTIES, required: true },
    sessionsPerWeek: { type: Number, required: true, min: 1, max: 7 },
    schedule: [
      {
        day: { type: String, required: true },
        title: { type: String, required: true },
        workout: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('FitnessPlan', planSchema);
