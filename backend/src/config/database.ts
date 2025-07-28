import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Budget } from '../entities/Budget';
import { Transaction } from '../entities/Transaction';
import { User } from '../entities/User';
import { Users } from '../entities/eventSchema';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false, // true for dev, false for prod
  logging: false,
  entities: [Budget, Transaction, User, Users],
  ssl: { rejectUnauthorized: false }, // Needed for Supabase
});