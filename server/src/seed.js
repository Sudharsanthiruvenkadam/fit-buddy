// Run with:  npm run seed   (safe to run more than once — it updates by name)
import './config/env.js';
import mongoose from 'mongoose';
import { validateEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import Workout from './models/Workout.js';
import FitnessPlan from './models/FitnessPlan.js';

const workouts = [
  { name: 'Bodyweight Basics', category: 'Strength', difficulty: 'Beginner', durationMinutes: 20, caloriesPerMinute: 5, equipment: ['None'], muscleGroups: ['Legs', 'Chest', 'Core'],
    description: 'A simple full-body routine that needs no equipment. Good for learning basic movement patterns.',
    instructions: ['Warm up with 2 minutes of marching on the spot.', 'Do 10 bodyweight squats.', 'Do 8 push-ups (on your knees if needed).', 'Hold a plank for 20 seconds.', 'Do 10 glute bridges. Rest 60 seconds and repeat 3 times.'] },
  { name: 'Brisk Walk Intervals', category: 'Cardio', difficulty: 'Beginner', durationMinutes: 25, caloriesPerMinute: 4.5, equipment: ['Comfortable shoes'], muscleGroups: ['Legs', 'Heart and lungs'],
    description: 'Alternate comfortable walking with faster-paced walking. Easy on the joints and easy to start.',
    instructions: ['Walk at an easy pace for 5 minutes.', 'Walk briskly for 2 minutes — you can talk, but not sing.', 'Walk easily for 2 minutes.', 'Repeat the brisk/easy cycle 4 times.', 'Cool down with 3 minutes of slow walking.'] },
  { name: 'Core Stability', category: 'Core', difficulty: 'Beginner', durationMinutes: 15, caloriesPerMinute: 4, equipment: ['Mat'], muscleGroups: ['Abdominals', 'Lower back'],
    description: 'Gentle core exercises that focus on control rather than speed.',
    instructions: ['Dead bug: 8 slow reps per side.', 'Bird dog: 8 reps per side.', 'Forearm plank: hold 20 seconds.', 'Side plank: hold 15 seconds per side.', 'Rest 45 seconds and repeat 2 times.'] },
  { name: 'Morning Mobility Flow', category: 'Flexibility', difficulty: 'Beginner', durationMinutes: 15, caloriesPerMinute: 2.5, equipment: ['Mat'], muscleGroups: ['Hips', 'Shoulders', 'Spine'],
    description: 'A slow sequence to loosen the hips, shoulders and spine. Move only within a comfortable range.',
    instructions: ['Cat-cow: 10 slow breaths.', 'World’s greatest stretch: 5 reps per side.', 'Hip circles: 8 per direction.', 'Child’s pose: hold 30 seconds.', 'Shoulder rolls and neck tilts: 1 minute.'] },
  { name: 'Beginner HIIT Starter', category: 'HIIT', difficulty: 'Beginner', durationMinutes: 15, caloriesPerMinute: 8, equipment: ['None'], muscleGroups: ['Full body'],
    description: 'Short bursts of effort followed by generous rest. Scale every move to your own level.',
    instructions: ['Warm up for 3 minutes.', 'Work 20 seconds, rest 40 seconds: high knees.', 'Same timing: squat to reach.', 'Same timing: step-back lunges.', 'Same timing: fast marching with arm swings. Cycle through twice, then cool down.'] },
  { name: 'Full-Body Dumbbell Circuit', category: 'Strength', difficulty: 'Intermediate', durationMinutes: 35, caloriesPerMinute: 6, equipment: ['Dumbbells', 'Bench (optional)'], muscleGroups: ['Legs', 'Back', 'Chest', 'Shoulders'],
    description: 'A circuit of compound dumbbell exercises for general strength.',
    instructions: ['Warm up for 5 minutes.', 'Goblet squat: 12 reps.', 'One-arm row: 10 reps per side.', 'Dumbbell press: 10 reps.', 'Romanian deadlift: 10 reps. Rest 90 seconds; complete 3 rounds.'] },
  { name: 'Jump Rope Cardio', category: 'Cardio', difficulty: 'Intermediate', durationMinutes: 20, caloriesPerMinute: 10, equipment: ['Jump rope'], muscleGroups: ['Calves', 'Shoulders', 'Heart and lungs'],
    description: 'Rope skipping in short rounds to build coordination and endurance.',
    instructions: ['Warm up with ankle bounces for 2 minutes.', 'Skip for 1 minute at a steady pace.', 'Rest 30 seconds.', 'Repeat for 10 rounds, keeping jumps low and landings soft.', 'Stretch calves and shoulders to finish.'] },
  { name: 'Upper Body Push-Pull', category: 'Strength', difficulty: 'Intermediate', durationMinutes: 40, caloriesPerMinute: 5.5, equipment: ['Dumbbells', 'Resistance band'], muscleGroups: ['Chest', 'Back', 'Arms', 'Shoulders'],
    description: 'Pairs a pushing movement with a pulling movement to keep the upper body balanced.',
    instructions: ['Warm up with band pull-aparts: 15 reps.', 'Push-ups: 10–15 reps.', 'Dumbbell row: 10–12 reps per side.', 'Overhead press: 8–10 reps.', 'Band face pulls: 15 reps. Rest 90 seconds; complete 3 rounds.'] },
  { name: 'Tabata Burn', category: 'HIIT', difficulty: 'Advanced', durationMinutes: 20, caloriesPerMinute: 11, equipment: ['None'], muscleGroups: ['Full body'],
    description: 'Eight rounds of 20 seconds hard effort and 10 seconds rest, across four exercises. Only for people already comfortable with high-intensity training.',
    instructions: ['Warm up thoroughly for 5 minutes.', 'Round 1: burpees, 8 × (20s on / 10s off).', 'Round 2: mountain climbers, same timing.', 'Round 3: jump squats, same timing. Rest 1 minute between rounds.', 'Cool down and stretch for 5 minutes.'] },
  { name: 'Lower Body Strength', category: 'Strength', difficulty: 'Advanced', durationMinutes: 45, caloriesPerMinute: 6, equipment: ['Barbell or dumbbells', 'Rack'], muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes'],
    description: 'Heavier lower-body lifts for people with training experience. Use a spotter or safety bars for heavy sets.',
    instructions: ['Warm up with light squats and hip hinges.', 'Back squat: 4 sets of 6.', 'Romanian deadlift: 3 sets of 8.', 'Walking lunges: 3 sets of 10 per leg.', 'Calf raises: 3 sets of 15. Rest 2 minutes between heavy sets.'] },
];

const plans = [
  { name: 'First Steps', difficulty: 'Beginner', durationWeeks: 4, sessionsPerWeek: 3, goal: 'Build a consistent habit',
    description: 'Three short sessions a week to help you get moving and find a routine you can keep.',
    schedule: [['Mon', 'Full-body basics', 'Bodyweight Basics'], ['Wed', 'Easy cardio', 'Brisk Walk Intervals'], ['Fri', 'Core and mobility', 'Core Stability']] },
  { name: 'Strength Builder', difficulty: 'Intermediate', durationWeeks: 6, sessionsPerWeek: 4, goal: 'Build general strength',
    description: 'Four sessions a week alternating upper-body, full-body and lower-body strength work.',
    schedule: [['Mon', 'Full-body circuit', 'Full-Body Dumbbell Circuit'], ['Tue', 'Upper body', 'Upper Body Push-Pull'], ['Thu', 'Core', 'Core Stability'], ['Sat', 'Lower body', 'Lower Body Strength']] },
  { name: 'Cardio Boost', difficulty: 'Beginner', durationWeeks: 4, sessionsPerWeek: 4, goal: 'Improve stamina',
    description: 'Mix steady walking, intervals and skipping to gradually build endurance.',
    schedule: [['Mon', 'Walk intervals', 'Brisk Walk Intervals'], ['Wed', 'HIIT starter', 'Beginner HIIT Starter'], ['Fri', 'Jump rope', 'Jump Rope Cardio'], ['Sun', 'Mobility', 'Morning Mobility Flow']] },
];

validateEnv();
await connectDB();

for (const w of workouts) await Workout.updateOne({ name: w.name }, { $set: w }, { upsert: true });
const byName = Object.fromEntries((await Workout.find()).map((w) => [w.name, w._id]));
for (const p of plans) {
  const doc = { ...p, schedule: p.schedule.map(([day, title, wn]) => ({ day, title, workout: byName[wn] })) };
  await FitnessPlan.updateOne({ name: p.name }, { $set: doc }, { upsert: true });
}
console.log(`Seeded ${workouts.length} workouts and ${plans.length} plans.`);
await mongoose.disconnect();
