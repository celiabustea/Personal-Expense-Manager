import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import eventRoutes from '@routes/eventRoutes';
import expensesRoutes from './routes/expenses';
import supabaseRoutes from './routes/supabase';
// Remove TypeORM database connection for now
// import myDataSource from '@config/database';

const app = express();
const port = 3001;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend server is running with Supabase',
    timestamp: new Date().toISOString(),
  });
});

// Route handlers
app.use('/users', eventRoutes);
app.use('/api', expensesRoutes);
app.use('/api', supabaseRoutes);

// Start server without TypeORM database connection
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`🗄️  Database: Using Supabase`);
});
