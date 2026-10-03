import { HttpError } from './error.js';

// Cookie auth + JSON API: every state-changing request must carry a custom header.
// Browsers will not send this header cross-site without a CORS preflight, which our
// restricted CORS policy rejects. Together with SameSite=Lax cookies this blocks CSRF.
export function requireCsrfHeader(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('x-requested-with') !== 'fitbuddy') {
    throw new HttpError(403, 'Missing required request header.');
  }
  next();
}
