import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { selectAllTransactions, selectTransactions, selectRecurringTransactions, selectBudgets, AppDispatch } from '../src/store';
import dynamic from 'next/dynamic';
import { addTransaction, deleteTransaction, addRecurringTransaction, deleteRecurringTransaction, addTransactionToSupabase, deleteTransactionFromSupabaseThunk } from '../src/store/slices/transactionsSlice';
import { updateBudgetSpent } from '../src/store/slices/budgetsSlice';
import { wouldExceedBudget, getBudgetOverflowInfo } from '../src/utils/budgetUtils';
import { useAuth } from '../src/contexts/AuthContext';

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
  const dispatch = useDispatch<AppDispatch>(); // Type the dispatch correctly
  const { user } = useAuth(); // Get current user for Supabase operations
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
  const [budgetError, setBudgetError] = useState<string | null>(null);
  
  // Receipt upload states
  const [selectedReceipt, setSelectedReceipt] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // Handle receipt upload and processing
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      setUploadStatus('Error: Please select a valid image file (JPG, PNG, or HEIC)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('Error: File size must be less than 10MB');
      return;
    }

    setSelectedReceipt(file);
    setUploadStatus('Processing receipt...');

    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append('receipt', file);

      // Call the receipt scanning API
      const response = await fetch('/api/scan-bon', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Auto-fill form fields with extracted data
        if (data.data.total) {
          // Convert to negative for expense
          const amount = data.data.total < 0 ? data.data.total : -Math.abs(data.data.total);
          setNewTransaction(prev => ({
            ...prev,
            amount: amount.toString()
          }));
        }
        
        if (data.data.store) {
          setNewTransaction(prev => ({
            ...prev,
            description: data.data.store
          }));
        }
        
        if (data.data.date) {
          // Convert date to datetime-local format
          const receiptDate = new Date(data.data.date);
          if (!isNaN(receiptDate.getTime())) {
            setNewTransaction(prev => ({
              ...prev,
              date: receiptDate.toISOString().slice(0, 16)
            }));
          }
        }

        setUploadStatus('✓ Receipt processed successfully! Form fields updated.');
      } else {
        setUploadStatus(`Error: ${data.message || 'Failed to process receipt'}`);
      }
    } catch (error) {
      console.error('Receipt upload error:', error);
      setUploadStatus('Error: Failed to process receipt. Please try again.');
    }
  };

  // Function to close modal and reset all states
  const closeModal = () => {
    setNewTransaction({
      amount: "",
      description: "",
      category: "",
      budgetId: "",
      date: new Date().toISOString().slice(0, 16)
    });
    setBudgetError(null);
    setIsRecurring(false);
    setRecurringFrequency('monthly');
    setSelectedReceipt(null);
    setUploadStatus('');
    setIsModalOpen(false);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetError(null); // Clear any previous errors
    
    const sanitizedAmount = newTransaction.amount.replace(/[, ]+/g, "");
    const amount = parseFloat(sanitizedAmount);
    
    // Find the selected budget to get its category
    const selectedBudget = budgets.find(budget => budget.id === newTransaction.budgetId);
    
    // Check for budget overflow if this is a spending transaction with a selected budget
    if (selectedBudget && amount < 0) {
      const tempTransaction = {
        id: 'temp',
        amount: amount,
        description: newTransaction.description,
        category: selectedBudget.name,
        date: newTransaction.date
      };
      
      // Convert budget API type to utils type
      const budgetForUtils = {
        id: selectedBudget.id,
        name: selectedBudget.name,
        category: selectedBudget.category,
        amount: selectedBudget.amount,
        limit: selectedBudget.limit,
        currency: selectedBudget.currency || 'USD',
        spent: selectedBudget.spent,
        startDate: selectedBudget.startDate,
        endDate: selectedBudget.endDate
      };
      
      if (wouldExceedBudget(tempTransaction, budgetForUtils)) {
        const overflowInfo = getBudgetOverflowInfo(tempTransaction, budgetForUtils);
        setBudgetError(
          `This transaction would exceed your budget by $${overflowInfo?.overflowAmount.toFixed(2)}. ` +
          `Budget limit: $${overflowInfo?.budgetLimit.toFixed(2)}, Current spent: $${overflowInfo?.currentSpent.toFixed(2)}, ` +
          `Transaction amount: $${overflowInfo?.transactionAmount.toFixed(2)}`
        );
        return; // Prevent transaction from being added
      }
    }

    const transaction = {
      id: Date.now().toString(),
      amount: amount,
      description: newTransaction.description,
      date: newTransaction.date,
      budgetId: newTransaction.budgetId,
      category: selectedBudget ? (selectedBudget.name || selectedBudget.category || 'Budget') : 'No budget',
      isRecurring: isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      timestamp: new Date().toISOString(),
      currency: 'USD'
    };

    // Add the transaction to Supabase AND local state
    if (isRecurring) {
      dispatch(addRecurringTransaction(transaction));
    } else {
      // Use async thunk to save to Supabase
      if (user) {
        dispatch(addTransactionToSupabase({ 
          transaction: {
            amount: transaction.amount,
            description: transaction.description,
            category: transaction.category,
            date: transaction.date,
            budgetId: transaction.budgetId,
            type: amount >= 0 ? 'income' : 'expense'
          }, 
          userId: user.id 
        }));
      } else {
        // Fallback to local storage only if user not available
        dispatch(addTransaction(transaction));
      }
    }

    // Update budget if one is selected
    if (newTransaction.budgetId && amount !== 0) {
      const spentChange = amount < 0 ? Math.abs(amount) : -amount;
      dispatch(updateBudgetSpent({
        budgetId: newTransaction.budgetId,
        amount: spentChange
      }));
    }

    closeModal();
  };

  const handleDelete = (transactionId: string) => {
    // Find the transaction before deleting to reverse budget changes
    const transactionToDelete = allTransactions.find(t => t.id === transactionId);
    const isRecurring = recurringTransactions.some((t: any) => t.id === transactionId);
    
    if (transactionToDelete && transactionToDelete.category) {
      // Find the budget that matches this transaction's category (budget name)
      const matchingBudget = budgets.find(budget => 
        budget.name && transactionToDelete.category &&
        budget.name.toLowerCase().trim() === transactionToDelete.category.toLowerCase().trim()
      );
      
      if (matchingBudget) {
        // Reverse the budget update
        const spentChange = transactionToDelete.amount < 0 ? -Math.abs(transactionToDelete.amount) : transactionToDelete.amount;
        dispatch(updateBudgetSpent({
          budgetId: matchingBudget.id,
          amount: spentChange
        }));
      }
    }
    
    if (isRecurring) {
      dispatch(deleteRecurringTransaction(transactionId));
    } else {
      // Use async thunk to delete from Supabase
      if (user) {
        dispatch(deleteTransactionFromSupabaseThunk(transactionId));
      } else {
        // Fallback to local storage only
        dispatch(deleteTransaction(transactionId));
      }
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
              {allTransactions
                .filter((trans: any) => trans.amount < 0) // Only include negative amounts (expenses)
                .reduce((total: number, trans: any) => total + Math.abs(trans.amount), 0)
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
            sortedTransactions.map((transaction) => {
              // Find the budget that matches this transaction's category (budget name)
              const relatedBudget = budgets.find(budget => 
                budget.name && transaction.category && 
                budget.name.toLowerCase().trim() === transaction.category.toLowerCase().trim()
              );
              
              return (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-title">{transaction.description}</div>
                    <div className="transaction-subtitle">
                      {transaction.category ? transaction.category : 'No budget assigned'}
                    </div>
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
                    {transaction.amount >= 0 ? '+' : ''}
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
              );
            })
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
          onClose={closeModal}
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
                placeholder="Enter amount (use negative for expenses)"
                value={newTransaction.amount}
                onChange={(e) => {
                  setNewTransaction({...newTransaction, amount: e.target.value});
                  setBudgetError(null); // Clear error when amount changes
                }}
                required={true}
                step="0.01"
              />
            </div>
            
            {/* Receipt Upload Section */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📸 Upload Receipt (optional)
              </label>
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '1rem',
                textAlign: 'center',
                marginTop: '0.5rem',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  style={{ display: 'none' }}
                  id="receipt-upload"
                />
                <label 
                  htmlFor="receipt-upload" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    color: '#475569',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e2e8f0';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  📁 Choose Receipt Image
                </label>
                {selectedReceipt && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#059669' }}>
                    ✓ {selectedReceipt.name}
                  </div>
                )}
                <div style={{ 
                  marginTop: '0.5rem', 
                  fontSize: '0.75rem', 
                  color: '#9ca3af' 
                }}>
                  Supported formats: JPG, PNG, HEIC
                </div>
              </div>
              {uploadStatus && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: uploadStatus.includes('Error') ? '#fef2f2' : '#f0f9ff',
                  color: uploadStatus.includes('Error') ? '#dc2626' : '#0369a1',
                  border: `1px solid ${uploadStatus.includes('Error') ? '#fecaca' : '#bae6fd'}`
                }}>
                  {uploadStatus}
                </div>
              )}
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
                onChange={(e) => {
                  setNewTransaction({...newTransaction, budgetId: e.target.value});
                  setBudgetError(null); // Clear error when budget changes
                }}
                required={false}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #1e293b',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="" style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  Select a budget
                </option>
                {budgets.map((budget: any) => {
                  const remaining = budget.amount - (budget.spent || 0);
                  const isOverBudget = remaining < 0;
                  return (
                    <option 
                      key={budget.id} 
                      value={budget.id}
                      style={{ 
                        color: '#1e293b', 
                        fontWeight: 500,
                        backgroundColor: '#ffffff',
                        padding: '0.5rem'
                      }}
                    >
                      💰 {budget.name} ({budget.category}) - Budget: ${budget.amount.toFixed(2)} | Spent: ${(budget.spent || 0).toFixed(2)} | {isOverBudget ? '⚠️ Over by' : 'Remaining'}: ${Math.abs(remaining).toFixed(2)}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-group recurring-option" style={{marginBottom: isRecurring ? 0 : '1rem'}}>
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
              <div className="form-group frequency-group" style={{marginTop: '-0.25rem', marginBottom: '1rem'}}>
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
            
            {/* Budget Error Message */}
            {budgetError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.375rem',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: '#dc2626',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                ⚠️ {budgetError}
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
                onClick={closeModal}
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
