import React from 'react';

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  limit: number;
  currency?: string;
  spent: number;
  startDate?: string;
}

interface BudgetSelectorProps {
  budgets: Budget[];
  selectedBudgetId: string | null;
  onChange: (budgetId: string | null) => void;
  placeholder?: string;
  required?: boolean;
  showDetails?: boolean;
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const BudgetSelector: React.FC<BudgetSelectorProps> = ({
  budgets,
  selectedBudgetId,
  onChange,
  placeholder = "Select a budget",
  required = false,
  showDetails = true
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange(value === '' ? null : value);
  };

  const getOptionText = (budget: Budget) => {
    const remaining = budget.limit - budget.spent;
    const percentage = budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
    
    if (showDetails) {
      return `${budget.name} - ${formatCurrency(remaining, budget.currency)} left (${percentage}% used)`;
    }
    return budget.name;
  };

  const getOptionClass = (budget: Budget) => {
    const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
    if (percentage >= 100) return 'over-budget';
    if (percentage >= 80) return 'near-budget';
    return 'normal-budget';
  };

  return (
    <div className="budget-selector">
      <select
        value={selectedBudgetId || ''}
        onChange={handleChange}
        required={required}
        className="budget-select"
      >
        <option value="" className="placeholder-option">
          {placeholder}
        </option>
        {budgets.map((budget) => (
          <option
            key={budget.id}
            value={budget.id}
            className={`budget-option ${getOptionClass(budget)}`}
          >
            {getOptionText(budget)}
          </option>
        ))}
      </select>

      <style jsx>{`
        .budget-selector {
          position: relative;
          width: 100%;
        }

        .budget-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          color: #1e293b;
          background-color: #ffffff;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1em 1em;
          padding-right: 2.5rem;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          transition: all 0.2s ease;
          cursor: pointer;
          font-weight: 500;
        }

        .budget-select:hover {
          border-color: #3b82f6;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
        }

        .budget-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .placeholder-option {
          color: #9ca3af;
          font-style: italic;
        }

        .budget-option {
          padding: 0.5rem 1rem;
          background-color: #ffffff;
          color: #1e293b;
          font-weight: 500;
        }

        .budget-option.normal-budget {
          color: #059669;
        }

        .budget-option.near-budget {
          color: #d97706;
        }

        .budget-option.over-budget {
          color: #dc2626;
        }

        /* Dark mode styles */
        :global(.dark-mode) .budget-select {
          background-color: #1e293b;
          color: #ffffff;
          border-color: #374151;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
        }

        :global(.dark-mode) .budget-select:hover {
          border-color: #60a5fa;
        }

        :global(.dark-mode) .budget-select:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }

        :global(.dark-mode) .placeholder-option {
          color: #6b7280;
        }

        :global(.dark-mode) .budget-option {
          background-color: #1e293b;
          color: #ffffff;
        }

        :global(.dark-mode) .budget-option.normal-budget {
          color: #34d399;
        }

        :global(.dark-mode) .budget-option.near-budget {
          color: #fbbf24;
        }

        :global(.dark-mode) .budget-option.over-budget {
          color: #fca5a5;
        }
      `}</style>
    </div>
  );
};

export default BudgetSelector;
