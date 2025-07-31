import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { selectAllTransactions, selectTransactions, selectRecurringTransactions, selectBudgets, AppDispatch } from '../src/store';
import dynamic from 'next/dynamic';
import { addTransaction, deleteTransaction, addRecurringTransaction, deleteRecurringTransaction, addTransactionToSupabase, deleteTransactionFromSupabaseThunk } from '../src/store/slices/transactionsSlice';
import { updateBudgetSpent } from '../src/store/slices/budgetsSlice';
import { wouldExceedBudget, getBudgetOverflowInfo } from '../src/utils/budgetUtils';
import { useAuth } from '../src/contexts/AuthContext';
import { CURRENCIES, createCurrencyConversion, formatCurrency, getCurrencySymbol } from '../src/utils/currencyUtils';
import CurrencyDisplay from '../src/components/atoms/CurrencyDisplay/CurrencyDisplay';
import CurrencySpendingSummary from '../src/components/molecules/CurrencySpendingSummary/CurrencySpendingSummary';
import type { CurrencyConversion } from '../src/utils/currencyUtils';

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
  
  // Currency conversion states
  const [isMultiCurrency, setIsMultiCurrency] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [currencyConversion, setCurrencyConversion] = useState<CurrencyConversion | null>(null);
  const [showConversionConfirmation, setShowConversionConfirmation] = useState(false);
  
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

  // Currency conversion functions
  const handleCurrencyToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsMultiCurrency(checked);
    if (!checked) {
      setCurrencyConversion(null);
      setShowConversionConfirmation(false);
      setSelectedCurrency('USD');
    }
  };

  const calculateCurrencyConversion = async () => {
    const amount = parseFloat(newTransaction.amount.replace(/[, ]+/g, ""));
    if (isNaN(amount) || amount === 0 || !newTransaction.budgetId) return;

    const selectedBudget = budgets.find(budget => budget.id === newTransaction.budgetId);
    if (!selectedBudget) return;

    const budgetCurrency = selectedBudget.currency || 'USD';
    
    if (selectedCurrency !== budgetCurrency) {
      try {
        // Use absolute amount for conversion calculation, but preserve the sign
        const conversion = await createCurrencyConversion(Math.abs(amount), selectedCurrency, budgetCurrency);
        
        // Preserve the original sign (expense vs income)
        const signedConversion = {
          ...conversion,
          originalAmount: amount, // Keep original sign
          convertedAmount: amount < 0 ? -conversion.convertedAmount : conversion.convertedAmount
        };
        
        setCurrencyConversion(signedConversion);
        // Don't auto-show confirmation here, let the form submission handle it
      } catch (error) {
        console.error('Error calculating currency conversion:', error);
        // Handle error gracefully - maybe show a notification to user
      }
    } else {
      // Clear conversion if currencies are the same
      setCurrencyConversion(null);
    }
  };

  const handleConversionConfirm = () => {
    setShowConversionConfirmation(false);
    // Proceed with submitting the transaction
    const form = document.querySelector('form');
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    }
  };

  const handleConversionCancel = () => {
    setShowConversionConfirmation(false);
    setCurrencyConversion(null);
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
    // Reset currency conversion states
    setIsMultiCurrency(false);
    setSelectedCurrency('USD');
    setCurrencyConversion(null);
    setShowConversionConfirmation(false);
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

    // Handle currency conversion confirmation
    if (isMultiCurrency && currencyConversion && !showConversionConfirmation) {
      // Show confirmation dialog for currency conversion
      setShowConversionConfirmation(true);
      return; // Wait for user confirmation
    }

    // Use converted amount if currency conversion was applied, but preserve the original sign
    const finalAmount = currencyConversion ? currencyConversion.convertedAmount : amount;
    const transactionCurrency = isMultiCurrency ? selectedCurrency : (selectedBudget?.currency || 'USD');

    const transaction = {
      id: Date.now().toString(),
      amount: finalAmount,
      description: newTransaction.description,
      date: newTransaction.date,
      budgetId: newTransaction.budgetId,
      category: selectedBudget ? (selectedBudget.name || selectedBudget.category || 'Budget') : 'No budget',
      isRecurring: isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      timestamp: new Date().toISOString(),
      currency: transactionCurrency,
      originalAmount: isMultiCurrency && currencyConversion ? currencyConversion.originalAmount : undefined,
      originalCurrency: isMultiCurrency && currencyConversion ? selectedCurrency : undefined,
      exchangeRate: currencyConversion?.exchangeRate
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
        // Note: Don't update budget locally when using Supabase - database triggers handle this
      } else {
        // Fallback to local storage only if user not available
        dispatch(addTransaction(transaction));
        // Update budget locally only when not using Supabase
        if (newTransaction.budgetId && amount !== 0) {
          const spentChange = amount < 0 ? Math.abs(amount) : -amount;
          dispatch(updateBudgetSpent({
            budgetId: newTransaction.budgetId,
            amount: spentChange
          }));
        }
      }
    }

    closeModal();
  };

  const handleDelete = (transactionId: string) => {
    // Find the transaction before deleting to reverse budget changes
    const transactionToDelete = allTransactions.find(t => t.id === transactionId);
    const isRecurring = recurringTransactions.some((t: any) => t.id === transactionId);
    
    if (isRecurring) {
      dispatch(deleteRecurringTransaction(transactionId));
    } else {
      // Use async thunk to delete from Supabase
      if (user) {
        dispatch(deleteTransactionFromSupabaseThunk(transactionId));
        // Note: Don't update budget locally when using Supabase - database triggers handle this
      } else {
        // Fallback to local storage only
        dispatch(deleteTransaction(transactionId));
        // Update budget locally only when not using Supabase
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
        
        {/* Currency-aware spending summary */}
        <CurrencySpendingSummary transactions={allTransactions} />

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
                    <CurrencyDisplay 
                      amount={transaction.amount} 
                      currency={transaction.currency || 'USD'}
                      showCurrencyTag={true}
                    />
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
                onChange={async (e) => {
                  setNewTransaction({...newTransaction, amount: e.target.value});
                  setBudgetError(null); // Clear error when amount changes
                  
                  // Auto-calculate conversion when amount changes
                  if (isMultiCurrency && e.target.value && newTransaction.budgetId) {
                    const amount = parseFloat(e.target.value.replace(/[, ]+/g, ""));
                    if (!isNaN(amount) && amount !== 0) {
                      const selectedBudget = budgets.find(budget => budget.id === newTransaction.budgetId);
                      const budgetCurrency = selectedBudget?.currency || 'USD';
                      
                      if (selectedCurrency !== budgetCurrency) {
                        try {
                          // Calculate conversion immediately
                          const conversion = await createCurrencyConversion(Math.abs(amount), selectedCurrency, budgetCurrency);
                          
                          // Preserve the original sign (expense vs income)
                          const signedConversion = {
                            ...conversion,
                            originalAmount: amount,
                            convertedAmount: amount < 0 ? -conversion.convertedAmount : conversion.convertedAmount
                          };
                          
                          setCurrencyConversion(signedConversion);
                        } catch (error) {
                          console.error('Error calculating currency conversion:', error);
                        }
                      }
                    }
                  }
                }}
                required={true}
                step="0.01"
              />
            </div>
            
            {/* Currency Selection Section */}
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isMultiCurrency}
                  onChange={handleCurrencyToggle}
                  style={{ accentColor: '#1e293b', width: '1.1em', height: '1.1em', marginRight: '0.5em' }}
                />
                <span style={{fontWeight: 500}}>Different Currency</span>
              </label>
            </div>

            {isMultiCurrency && (
              <div className="form-group">
                <label>Transaction Currency</label>
                <select
                  value={selectedCurrency}
                  onChange={async (e) => {
                    const newCurrency = e.target.value;
                    setSelectedCurrency(newCurrency);
                    
                    // Auto-calculate conversion when currency changes
                    if (newTransaction.amount && newTransaction.budgetId) {
                      const amount = parseFloat(newTransaction.amount.replace(/[, ]+/g, ""));
                      if (!isNaN(amount) && amount !== 0) {
                        const selectedBudget = budgets.find(budget => budget.id === newTransaction.budgetId);
                        const budgetCurrency = selectedBudget?.currency || 'USD';
                        
                        if (newCurrency !== budgetCurrency) {
                          try {
                            // Calculate conversion immediately
                            const conversion = await createCurrencyConversion(Math.abs(amount), newCurrency, budgetCurrency);
                            
                            // Preserve the original sign (expense vs income)
                            const signedConversion = {
                              ...conversion,
                              originalAmount: amount,
                              convertedAmount: amount < 0 ? -conversion.convertedAmount : conversion.convertedAmount
                            };
                            
                            setCurrencyConversion(signedConversion);
                            
                            // Auto-show confirmation dialog
                            setShowConversionConfirmation(true);
                          } catch (error) {
                            console.error('Error calculating currency conversion:', error);
                          }
                        } else {
                          // Clear conversion if currencies are the same
                          setCurrencyConversion(null);
                          setShowConversionConfirmation(false);
                        }
                      }
                    }
                  }}
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
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </option>
                  ))}
                </select>
                
                {currencyConversion && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: currencyConversion.originalAmount < 0 ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${currencyConversion.originalAmount < 0 ? '#fecaca' : '#bbf7d0'}`,
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: currencyConversion.originalAmount < 0 ? '#dc2626' : '#16a34a'
                  }}>
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>{currencyConversion.originalAmount < 0 ? '💸' : '💰'}</span>
                      {currencyConversion.originalAmount < 0 ? 'Expense' : 'Income'} Conversion Preview:
                    </div>
                    <div>
                      {currencyConversion.originalAmount.toFixed(2)} {currencyConversion.originalCurrency} → {currencyConversion.convertedAmount.toFixed(2)} {currencyConversion.convertedCurrency}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Exchange rate: 1 {currencyConversion.originalCurrency} = {currencyConversion.exchangeRate.toFixed(4)} {currencyConversion.convertedCurrency}
                    </div>
                  </div>
                )}
              </div>
            )}
            
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
                onChange={async (e) => {
                  setNewTransaction({...newTransaction, budgetId: e.target.value});
                  setBudgetError(null); // Clear error when budget changes
                  
                  // Auto-calculate conversion when budget changes
                  if (isMultiCurrency && newTransaction.amount && e.target.value) {
                    const amount = parseFloat(newTransaction.amount.replace(/[, ]+/g, ""));
                    if (!isNaN(amount) && amount !== 0) {
                      const selectedBudget = budgets.find(budget => budget.id === e.target.value);
                      const budgetCurrency = selectedBudget?.currency || 'USD';
                      
                      if (selectedCurrency !== budgetCurrency) {
                        try {
                          // Calculate conversion immediately
                          const conversion = await createCurrencyConversion(Math.abs(amount), selectedCurrency, budgetCurrency);
                          
                          // Preserve the original sign (expense vs income)
                          const signedConversion = {
                            ...conversion,
                            originalAmount: amount,
                            convertedAmount: amount < 0 ? -conversion.convertedAmount : conversion.convertedAmount
                          };
                          
                          setCurrencyConversion(signedConversion);
                          
                          // Auto-show confirmation dialog
                          setShowConversionConfirmation(true);
                        } catch (error) {
                          console.error('Error calculating currency conversion:', error);
                        }
                      } else {
                        // Clear conversion if currencies are the same
                        setCurrencyConversion(null);
                        setShowConversionConfirmation(false);
                      }
                    }
                  }
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

        {/* Currency Conversion Confirmation Dialog */}
        {showConversionConfirmation && currencyConversion && (
          <Modal
            isOpen={showConversionConfirmation}
            onClose={handleConversionCancel}
            title={`${currencyConversion.originalAmount < 0 ? 'Expense' : 'Income'} Currency Conversion`}
          >
            <div style={{ padding: '1rem' }}>
              <p style={{ marginBottom: '1rem', fontSize: '1rem', color: '#1e293b' }}>
                This {currencyConversion.originalAmount < 0 ? 'expense' : 'income'} will be converted to your budget currency:
              </p>
              
              <div style={{
                backgroundColor: currencyConversion.originalAmount < 0 ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${currencyConversion.originalAmount < 0 ? '#fecaca' : '#bbf7d0'}`,
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  color: currencyConversion.originalAmount < 0 ? '#dc2626' : '#16a34a', 
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>{currencyConversion.originalAmount < 0 ? '💸' : '💰'}</span>
                  {currencyConversion.originalAmount.toFixed(2)} {currencyConversion.originalCurrency} → {currencyConversion.convertedAmount.toFixed(2)} {currencyConversion.convertedCurrency}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Exchange rate: 1 {currencyConversion.originalCurrency} = {currencyConversion.exchangeRate.toFixed(4)} {currencyConversion.convertedCurrency}
                </div>
              </div>

              <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: '#4b5563' }}>
                {currencyConversion.originalAmount < 0 
                  ? `This will be deducted from your budget with the currency exchange being (${currencyConversion.originalAmount.toFixed(2)} ${currencyConversion.originalCurrency} → ${currencyConversion.convertedAmount.toFixed(2)} ${currencyConversion.convertedCurrency}). Do you want to proceed?`
                  : `This will be added to your budget with the currency exchange being (${currencyConversion.originalAmount.toFixed(2)} ${currencyConversion.originalCurrency} → ${currencyConversion.convertedAmount.toFixed(2)} ${currencyConversion.convertedCurrency}). Do you want to proceed?`
                }
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleConversionCancel}
                  label="Cancel"
                />
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConversionConfirm}
                  label={currencyConversion.originalAmount < 0 ? "Yes, Convert & Deduct" : "Yes, Convert & Add"}
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PageLayout>
  );
};

export default Transactions;
