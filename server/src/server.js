
import { validateEnv } from './config/env.js';

validateEnv();

const { connectDB } = await import('./config/db.js');
const { createApp } = await import('./app.js');

try {
  await connectDB();
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message);
  process.exit(1);
}

const port = process.env.PORT || 5000;

createApp().listen(port, () => {
  console.log(`Fit Buddy API running on http://localhost:${port}`);
});