import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionCategory {
  FOOD = 'food',
  TRANSPORT = 'transport',
  ENTERTAINMENT = 'entertainment',
  UTILITIES = 'utilities',
  HEALTHCARE = 'healthcare',
  SHOPPING = 'shopping',
  SALARY = 'salary',
  FREELANCE = 'freelance',
  OTHER = 'other',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionCategory,
  })
  category!: TransactionCategory;

  @Column()
  description!: string;

  @Column({ type: 'date' })
  date!: Date;

  // Multi-currency support
  @Column({ default: 'USD' })
  transactionCurrency!: string;

  @Column({ nullable: true })
  budgetCurrency?: string;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  exchangeRate?: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  budgetAmount?: number;

  @Column({ default: false })
  isCurrencyExchange!: boolean;

  @Column({ nullable: true })
  exchangeProvider?: string;

  @Column({ type: 'timestamp', nullable: true })
  exchangeTimestamp?: Date;

  // Original currency information for historical tracking
  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  originalAmount?: number;

  @Column({ nullable: true })
  originalCurrency?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
