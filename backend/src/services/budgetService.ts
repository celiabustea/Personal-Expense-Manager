import { AppDataSource } from '@config/database';
import { Budget } from '@entities/Budget';
import { TransactionCategory } from '@entities/Transaction';
import { Repository } from 'typeorm';

export class BudgetService {
  private budgetRepository: Repository<Budget>;

  constructor() {
    this.budgetRepository = AppDataSource.getRepository(Budget);
  }

  async getAllBudgetsByUser(userId: number): Promise<Budget[]> {
    return await this.budgetRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async getBudgetById(id: number, userId: number): Promise<Budget | null> {
    return await this.budgetRepository.findOne({
      where: { id, userId }
    });
  }

  async createBudget(budgetData: {
    name: string;
    amount: number;
    category: TransactionCategory;
    startDate: Date;
    endDate: Date;
    userId: number;
  }): Promise<Budget> {
    const budget = this.budgetRepository.create({
      ...budgetData,
      spent: 0
    });
    return await this.budgetRepository.save(budget);
  }

  async updateBudget(id: number, userId: number, updateData: Partial<Budget>): Promise<Budget | null> {
    const budget = await this.getBudgetById(id, userId);
    if (!budget) {
      return null;
    }

    Object.assign(budget, updateData);
    return await this.budgetRepository.save(budget);
  }

  async deleteBudget(id: number, userId: number): Promise<boolean> {
    const budget = await this.getBudgetById(id, userId);
    if (!budget) {
      return false;
    }

    await this.budgetRepository.remove(budget);
    return true;
  }

  async updateSpentAmount(id: number, userId: number, additionalAmount: number): Promise<Budget | null> {
    const budget = await this.getBudgetById(id, userId);
    if (!budget) {
      return null;
    }

    budget.spent = (budget.spent || 0) + additionalAmount;
    return await this.budgetRepository.save(budget);
  }

  async checkBudgetExists(userId: number, category: TransactionCategory, startDate: Date, endDate: Date): Promise<boolean> {
    const existingBudget = await this.budgetRepository.findOne({
      where: {
        userId,
        category,
        startDate,
        endDate
      }
    });
    return !!existingBudget;
  }

  async getBudgetsByCategory(userId: number, category: TransactionCategory): Promise<Budget[]> {
    return await this.budgetRepository.find({
      where: { userId, category },
      order: { startDate: 'DESC' }
    });
  }

  async getActiveBudgets(userId: number): Promise<Budget[]> {
    const currentDate = new Date();
    return await this.budgetRepository
      .createQueryBuilder('budget')
      .where('budget.userId = :userId', { userId })
      .andWhere('budget.startDate <= :currentDate', { currentDate })
      .andWhere('budget.endDate >= :currentDate', { currentDate })
      .orderBy('budget.createdAt', 'DESC')
      .getMany();
  }

  async getBudgetUtilization(userId: number): Promise<any[]> {
    const budgets = await this.getAllBudgetsByUser(userId);
    return budgets.map(budget => ({
      id: budget.id,
      name: budget.name,
      category: budget.category,
      amount: budget.amount,
      spent: budget.spent || 0,
      remaining: budget.amount - (budget.spent || 0),
      utilization: ((budget.spent || 0) / budget.amount) * 100,
      status: (budget.spent || 0) > budget.amount ? 'exceeded' : 
              (budget.spent || 0) >= budget.amount * 0.8 ? 'warning' : 'safe'
    }));
  }
}
