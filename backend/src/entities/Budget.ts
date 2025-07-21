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
import { TransactionCategory } from './Transaction';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  spent!: number;

  @Column({
    type: 'enum',
    enum: TransactionCategory,
  })
  category!: TransactionCategory;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.budgets)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
