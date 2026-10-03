export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isRealDate(s) {
  if (!ISO_DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function serverToday() {
  return new Date().toISOString().slice(0, 10);
}

// The browser knows the user's local calendar day, so it may send ?today=YYYY-MM-DD.
export function resolveToday(q) {
  return typeof q === 'string' && isRealDate(q) ? q : serverToday();
}

// Monday-based week containing `iso`
export function weekStart(iso) {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(iso, -((day + 6) % 7));
}
