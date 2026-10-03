import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { notFound, errorHandler } from './middleware/error.js';
import { requireCsrfHeader } from './middleware/csrf.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import workoutRoutes from './routes/workouts.js';
import planRoutes from './routes/plans.js';
import goalRoutes from './routes/goals.js';
import activityRoutes from './routes/activities.js';
import progressRoutes from './routes/progress.js';
import contactRoutes from './routes/contact.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.get('/api/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' } });
  });

  app.use('/api', requireCsrfHeader);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/workouts', workoutRoutes);
  app.use('/api/plans', planRoutes);
  app.use('/api/goals', goalRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/contact', contactRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
