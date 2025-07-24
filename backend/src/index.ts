import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/database';
import expensesRoutes from './routes/expenses';
import supabaseRoutes from './routes/supabase';

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/expenses', expensesRoutes);
app.use('/api/supabase', supabaseRoutes);


// Global error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connected to Supabase!');
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((error) => console.error('Database connection error:', error));

  