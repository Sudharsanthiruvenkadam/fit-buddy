import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server forwards /api requests to the Express backend, so the browser sees ONE origin
// (no CORS problems, and the login cookie works).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
});
