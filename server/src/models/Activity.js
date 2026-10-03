import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD (user's local day)
    title: { type: String, required: true, trim: true, maxlength: 80 },
    workout: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', default: null },
    minutes: { type: Number, min: 0, max: 600, default: 0 },
    calories: { type: Number, min: 0, max: 5000, default: 0 }, // ESTIMATE
    waterMl: { type: Number, min: 0, max: 10000, default: 0 },
    clientRequestId: { type: String, maxlength: 64 }, // stops double-submits creating duplicates
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, date: -1 });
activitySchema.index(
  { user: 1, clientRequestId: 1 },
  { unique: true, partialFilterExpression: { clientRequestId: { $type: 'string' } } }
);

export default mongoose.model('Activity', activitySchema);
