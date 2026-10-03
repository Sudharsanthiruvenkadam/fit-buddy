// The user's LOCAL calendar day as YYYY-MM-DD (not UTC)
export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export const QUOTES = [
  'Stronger together.',
  'No excuses. Just progress.',
  'One more rep. One step closer.',
  'Show up. Level up.',
  'Your journey. Your pace. Your progress.',
  'Find your fit. Find your buddy.',
  'Train together. Grow together.',
  'Consistency creates champions.',
  'Progress over perfection.',
  'Every rep counts.',
  'Discipline builds strong habits.',
  'Small wins. Big changes.',
  'Make today count.',
  'Build strength. Build confidence.',
  'Start where you are. Keep moving forward.',
  'The hardest part is showing up.',
  'Your future self will thank you.',
  'Find your partner. Own your journey.',
];

// Same quote all day, changes tomorrow
export function quoteOfTheDay(offset = 0) {
  const day = Math.floor(new Date(`${todayISO()}T00:00:00Z`).getTime() / 86400000);
  return QUOTES[(day + offset) % QUOTES.length];
}
