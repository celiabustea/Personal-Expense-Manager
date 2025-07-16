import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import eventRoutes from '@routes/eventRoutes';
import myDataSource from '@config/database';

const app = express();
app.use(express.json());

myDataSource
  .initialize()
  .then(async () => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });

const port = 3001;

app.use('/users', eventRoutes);
