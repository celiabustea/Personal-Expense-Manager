import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteBudget, createBudgetInSupabase } from '../src/store/slices/budgetsSlice';
import { selectBudgetsWithCalculatedSpent, selectAllTransactions, AppDispatch } from '../src/store';
import { useAuth } from '../src/contexts/AuthContext';
import { CURRENCIES } from '../src/utils/currencyUtils';
import CurrencyDisplay from '../src/components/atoms/CurrencyDisplay/CurrencyDisplay';
import CurrencyBudgetSummary from '../src/components/molecules/CurrencyBudgetSummary/CurrencyBudgetSummary';
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
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth(); // Get current user for Supabase operations
  const budgets = useSelector(selectBudgetsWithCalculatedSpent);
  const allTransactions = useSelector(selectAllTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    currency: 'USD',
  });

  const currencies = CURRENCIES;

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

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      console.error('❌ User not authenticated');
      alert('Please log in to add budgets');
      return;
    }

    const budget = {
      name: newBudget.category,
      category: newBudget.category,
      amount: parseFloat(newBudget.amount),
      currency: newBudget.currency,
      limit: parseFloat(newBudget.amount),
    };
    
    try {
      await dispatch(createBudgetInSupabase({ budget, userId: user.id }));
      setNewBudget({ category: '', amount: '', currency: 'USD' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('❌ Failed to add budget:', error);
      alert('Failed to add budget: ' + error);
    }
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

        {/* Currency-aware budget summary */}
        <CurrencyBudgetSummary budgets={budgets} />

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
