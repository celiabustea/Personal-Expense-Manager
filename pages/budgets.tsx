import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addBudget, deleteBudget } from '../src/store/slices/budgetsSlice';
import { selectBudgets } from '../src/store';
import dynamic from 'next/dynamic';

// Dynamic imports for components
const Button = dynamic(() => import('../src/components/atoms/Button/Button'));
const Input = dynamic(() => import('../src/components/atoms/Input/Input'));
const Heading = dynamic(() => import('../src/components/atoms/Headings/Heading'));
const Icon = dynamic(() => import('../src/components/atoms/Icons/Icon'));
const Modal = dynamic(() => import('../src/components/molecules/Modal/Modal'));
const BudgetCard = dynamic(() => import('../src/components/molecules/BudgetCard/BudgetCard'));
const PageLayout = dynamic(() => import('../src/components/templates/PageLayout'), {
  loading: () => <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '1.1rem',
    color: '#1e293b'
  }}>Loading Budgets...</div>
});

const Budgets = () => {
  const dispatch = useDispatch();
  const budgets = useSelector(selectBudgets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    currency: 'USD',
  });

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  ];

  const handleDelete = (id: any) => {
    dispatch(deleteBudget(id));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, '');
    setNewBudget({
      ...newBudget,
      amount: value,
    });
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const budget = {
      id: String(Date.now()),
      category: newBudget.category,
      amount: parseFloat(newBudget.amount),
      currency: newBudget.currency,
      spent: 0,
    };
    dispatch(addBudget(budget));
    setNewBudget({ category: '', amount: '', currency: 'USD' });
    setIsModalOpen(false);
  };

  return (
    <PageLayout>
      <div className="budgets-container">
        <div className="budgets-header">
          <h1>Budgets</h1>
          <p className="budgets-subtitle">
            Manage and track your budget categories
          </p>
        </div>

        <div className="budgets-summary">
          <div className="summary-card">
            <Heading level={3}>Total Budgeted</Heading>
            <p>
              {budgets
                .reduce((total: number, budget: any) => total + budget.amount, 0)
                .toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
            </p>
          </div>
          <div className="summary-card">
            <Heading level={3}>Total Categories</Heading>
            <p>{budgets.length}</p>
          </div>
          <div className="summary-card">
            <Heading level={3}>Total Spent</Heading>
            <p>
              {budgets
                .reduce(
                  (total: number, budget: any) => total + (budget.spent || 0),
                  0
                )
                .toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
            </p>
          </div>
        </div>

        <div className="budget-list">
          {budgets.length === 0 ? (
            <div className="empty-state">
              <p>No budget categories yet. Click the button below to add one!</p>
            </div>
          ) : (
            budgets.map((budget: any) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        <Button
          className="add-budget-btn"
          onClick={() => setIsModalOpen(true)}
          label="Add Budget"
          variant="primary"
          icon={<Icon name="add" />}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Budget Category"
        >
          <form onSubmit={handleAddBudget}>
            <Input
              type="text"
              name="category"
              placeholder="Category Name"
              value={newBudget.category}
              onChange={e =>
                setNewBudget({
                  ...newBudget,
                  category: e.target.value,
                })
              }
              required
            />
            <div className="amount-group">
              <Input
                type="number"
                name="amount"
                step="0.01"
                min="0"
                placeholder="Amount"
                value={newBudget.amount}
                onChange={handleAmountChange}
                required
              />
              <select
                value={newBudget.currency}
                onChange={e =>
                  setNewBudget({
                    ...newBudget,
                    currency: e.target.value,
                  })
                }
                className="currency-dropdown"
                required
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <Button 
                type="submit" 
                label="Add Budget" 
                variant="primary" 
                onClick={() => {}}
              />
              <Button
                type="button"
                label="Cancel"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              />
            </div>
          </form>
        </Modal>
      </div>
    </PageLayout>
  );
};

export default Budgets;
