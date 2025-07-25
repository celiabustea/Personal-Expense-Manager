
import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import eventRoutes from '@routes/eventRoutes';
import { AppDataSource } from '@config/database';
import { supabase } from '@config/supabase';

const app = express();
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

  