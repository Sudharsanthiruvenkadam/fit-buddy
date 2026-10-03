const BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || {};
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fitbuddy' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the backend is running.', 0);
  }
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) throw new ApiError(json?.message || 'Something went wrong. Please try again.', res.status, json?.errors);
  return json?.data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  put: (p, body) => request(p, { method: 'PUT', body }),
  del: (p) => request(p, { method: 'DELETE' }),
};
