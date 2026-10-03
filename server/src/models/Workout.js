import mongoose from 'mongoose';

export const CATEGORIES = ['Strength', 'Cardio', 'HIIT', 'Core', 'Flexibility'];
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const workoutSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    difficulty: { type: String, enum: DIFFICULTIES, required: true, index: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 240 },
    caloriesPerMinute: { type: Number, required: true, min: 0, max: 30 }, // rough estimate only
    equipment: [String],
    muscleGroups: [String],
    instructions: [String],
  },
  { timestamps: true }
);

export default mongoose.model('Workout', workoutSchema);
