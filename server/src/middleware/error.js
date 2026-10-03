import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' });

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const errors = {};
    for (const issue of err.issues) errors[issue.path.join('.') || 'form'] ??= issue.message;
    return res.status(400).json({ success: false, message: 'Please fix the highlighted fields.', errors });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, message: err.message, errors: err.errors });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body is too large.' });
  }
  if (err.name === 'CastError' || err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Invalid data was submitted.' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'That record already exists.' });
  }
  console.error('Unhandled error:', err.message); // never log request bodies / secrets
  res.status(500).json({ success: false, message: 'Something went wrong on our side. Please try again.' });
}
