import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { selectAllTransactions, selectTransactions, selectRecurringTransactions, selectBudgets } from '../src/store';
import dynamic from 'next/dynamic';
import { addTransaction, deleteTransaction, addRecurringTransaction, deleteRecurringTransaction } from '../src/store/slices/transactionsSlice';
import { updateBudgetSpent } from '../src/store/slices/budgetsSlice';

// Dynamic imports for components
const Button = dynamic(() => import("../src/components/atoms/Button/Button"));
const Heading = dynamic(() => import("../src/components/atoms/Headings/Heading"));
const Input = dynamic(() => import("../src/components/atoms/Input/Input"));
const Icon = dynamic(() => import("../src/components/atoms/Icons/Icon"));
const Modal = dynamic(() => import("../src/components/molecules/Modal/Modal"));
const PageLayout = dynamic(() => import("../src/components/templates/PageLayout"), {
  loading: () => <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '1.1rem',
    color: '#1e293b'
  }}>Loading Transactions...</div>
});

const Transactions = () => {
  const dispatch = useDispatch();
  const allTransactions = useSelector(selectAllTransactions);
  const transactions = useSelector(selectTransactions);
  const recurringTransactions = useSelector(selectRecurringTransactions);
  const budgets = useSelector(selectBudgets);

  // Memoize expensive sorting operation
  const sortedTransactions = useMemo(() => {
    return [...allTransactions].sort((a, b) => {
      return new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime();
    });
  }, [allTransactions]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    description: "",
    category: "",
    budgetId: "",
    date: new Date().toISOString().slice(0, 16)
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedAmount = newTransaction.amount.replace(/[, ]+/g, "");
    const transaction = {
      id: Date.now().toString(),
      ...newTransaction,
      amount: parseFloat(sanitizedAmount),
      isRecurring: isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      timestamp: new Date().toISOString(),
      currency: 'USD'
    };

    if (isRecurring) {
      dispatch(addRecurringTransaction(transaction));
    } else {
      dispatch(addTransaction(transaction));
    }

    // Update budget spent amount if a budget is selected
    if (newTransaction.budgetId && parseFloat(sanitizedAmount) > 0) {
      dispatch(updateBudgetSpent({
        budgetId: newTransaction.budgetId,
        amount: parseFloat(sanitizedAmount)
      }));
    }

    setNewTransaction({
      amount: "",
      description: "",
      category: "",
      budgetId: "",
      date: new Date().toISOString().slice(0, 16)
    });
    setIsRecurring(false);
    setRecurringFrequency('monthly');
    setIsModalOpen(false);
  };

  const handleDelete = (transactionId: string) => {
    const isRecurring = recurringTransactions.some((t: any) => t.id === transactionId);
    
    if (isRecurring) {
      dispatch(deleteRecurringTransaction(transactionId));
    } else {
      dispatch(deleteTransaction(transactionId));
    }
  };

  return (
    <PageLayout>
      <div className="transactions-container">
        <div className="transactions-header">
          <h1>Transactions</h1>
          <p>Track your spending across different categories</p>
        </div>
        <div className="transactions-summary">
          <div className="summary-card">
            <h3>Total Transactions</h3>
            <p>{allTransactions.length}</p>
          </div>
          <div className="summary-card">
            <h3>Total Spent</h3>
            <p>
              {allTransactions.reduce((total: number, trans: any) => total + trans.amount, 0)
                .toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
            </p>
          </div>
        </div>

        <div className="transactions-list">
          {sortedTransactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions yet. Add your first transaction!</p>
            </div>
          ) : (
            sortedTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <div className="transaction-title">{transaction.description}</div>
                  <div className="transaction-category">{transaction.category}</div>
                  <div className="transaction-date">
                    {new Date(transaction.timestamp || transaction.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })} at {new Date(transaction.timestamp || transaction.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
                <div className="transaction-amount">
                  {transaction.amount.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </div>
                <button
                  className="delete-transaction-btn"
                  onClick={() => handleDelete(transaction.id)}
                  title="Delete transaction"
                >
                  <Icon name="delete" />
                </button>
              </div>
            ))
          )}
        </div>

        <Button
          className="add-budget-btn"
          onClick={() => setIsModalOpen(true)}
          label="Add Transaction"
          variant="primary"
          icon={<Icon name="add" />}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Transaction"
        >
          <form onSubmit={handleAddTransaction}>
            <div className="form-group">
              <label>Description</label>
              <Input
                type="text"
                name="description"
                placeholder="Enter description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                required={true}
              />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <Input
                type="number"
                name="amount"
                placeholder="Enter amount"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                required={true}
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <Input
                type="datetime-local"
                name="date"
                placeholder=""
                value={newTransaction.date}
                onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                required={true}
              />
            </div>
            <div className="form-group">
              <label>Budget</label>
              <select
                value={newTransaction.budgetId}
                onChange={(e) => setNewTransaction({...newTransaction, budgetId: e.target.value})}
                required={true}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  backgroundColor: 'var(--background-color)',
                  color: 'var(--text-color)'
                }}
              >
                <option value="">Select a budget</option>
                {budgets.map((budget: any) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group recurring-option" style={{marginBottom: isRecurring ? 0 : '1.5rem'}}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  style={{ accentColor: '#1e293b', width: '1.1em', height: '1.1em', marginRight: '0.5em' }}
                />
                <span style={{fontWeight: 500}}>Recurring Transaction</span>
              </label>
            </div>
            {isRecurring && (
              <div className="form-group frequency-group" style={{marginTop: '-0.5rem'}}>
                <label style={{marginBottom: '0.25rem', fontWeight: 500}}>Frequency</label>
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    border: '1.5px solid #1e293b',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    fontWeight: 500
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}
            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                label="Add Transaction"
                onClick={() => {}}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                label="Cancel"
              />
            </div>
          </form>
        </Modal>
      </div>
    </PageLayout>
  );
};

export default Transactions;
