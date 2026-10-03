import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true },
    currentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'FitnessPlan', default: null },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function () {
  return { id: this._id, name: this.name, email: this.email, currentPlan: this.currentPlan, createdAt: this.createdAt };
};

export default mongoose.model('User', userSchema);
