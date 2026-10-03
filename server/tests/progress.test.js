import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStreak, percentOf, goalStatus } from '../src/utils/progress.js';
import { addDays, weekStart, isRealDate } from '../src/utils/dates.js';

test('streak counts consecutive days ending today', () => {
  assert.equal(calculateStreak(['2025-03-01', '2025-03-02', '2025-03-03'], '2025-03-03'), 3);
});
test('streak stays alive when today has no workout yet', () => {
  assert.equal(calculateStreak(['2025-03-01', '2025-03-02'], '2025-03-03'), 2);
});
test('streak resets after a missed full day', () => {
  assert.equal(calculateStreak(['2025-03-01', '2025-03-02'], '2025-03-04'), 0);
});
test('streak handles a gap in the middle', () => {
  assert.equal(calculateStreak(['2025-03-01', '2025-03-03', '2025-03-04'], '2025-03-04'), 2);
});
test('streak crosses month and leap-year boundaries', () => {
  assert.equal(calculateStreak(['2024-02-28', '2024-02-29', '2024-03-01'], '2024-03-01'), 3);
  assert.equal(calculateStreak(['2024-12-31', '2025-01-01'], '2025-01-01'), 2);
});
test('streak is 0 with no workouts', () => {
  assert.equal(calculateStreak([], '2025-03-04'), 0);
});
test('percentOf caps at 100 and handles zero target', () => {
  assert.equal(percentOf(50, 100), 50);
  assert.equal(percentOf(250, 100), 100);
  assert.equal(percentOf(5, 0), 0);
});
test('goalStatus', () => {
  assert.equal(goalStatus({ current: 10, target: 10, deadline: null }, '2025-03-01'), 'completed');
  assert.equal(goalStatus({ current: 1, target: 10, completedAt: new Date() }, '2025-03-01'), 'completed');
  assert.equal(goalStatus({ current: 1, target: 10, deadline: '2025-02-28' }, '2025-03-01'), 'overdue');
  assert.equal(goalStatus({ current: 1, target: 10, deadline: '2025-03-05' }, '2025-03-01'), 'active');
});
test('date helpers', () => {
  assert.equal(addDays('2025-03-01', -1), '2025-02-28');
  assert.equal(weekStart('2025-03-02'), '2025-02-24'); // Sunday -> previous Monday
  assert.equal(weekStart('2025-03-03'), '2025-03-03'); // Monday
  assert.equal(isRealDate('2025-02-30'), false);
  assert.equal(isRealDate('2025-02-28'), true);
});
