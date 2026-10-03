import { addDays } from './dates.js';

/**
 * Streak rule: a streak is the number of consecutive calendar days, ending today,
 * that each have at least one workout (minutes > 0). If today has no workout yet,
 * the streak is still alive and counts back from yesterday. One missed full day resets it.
 */
export function calculateStreak(workoutDates, today) {
  const days = new Set(workoutDates);
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export const percentOf = (current, target) =>
  target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

export function goalStatus({ current, target, completedAt, deadline }, today) {
  if (completedAt || current >= target) return 'completed';
  if (deadline && deadline < today) return 'overdue';
  return 'active';
}
