
import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import eventRoutes from '@routes/eventRoutes';
import aiRoutes from '@routes/aiRoutes';
import { AppDataSource } from '@config/database';
import { supabase } from '@config/supabase';

const app = express();

// Enable CORS for frontend requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

const port = process.env.PORT || 5000;

AppDataSource
  .initialize()
  .then(async () => {
    console.log('Database connection established');
    // Log Supabase connection
    if (supabase) {
      console.log('Supabase connection established');
    }
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err: unknown) => {
    console.error('Error during Data Source initialization:', err);
  });

app.use('/users', eventRoutes);
app.use('/ai', aiRoutes);

  