import mongoose from 'mongoose';

export const GOAL_TYPES = ['minutes', 'sessions', 'water', 'custom'];

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    type: { type: String, enum: GOAL_TYPES, required: true },
    targetValue: { type: Number, required: true, min: 1 },
    manualValue: { type: Number, min: 0, default: 0 }, // only used by "custom" goals
    unit: { type: String, required: true, trim: true, maxlength: 20 },
    startDate: { type: String, required: true }, // YYYY-MM-DD
    deadline: { type: String, default: null }, // YYYY-MM-DD
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Goal', goalSchema);
