import React, { memo } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for heavy components
const Button = dynamic(() => import('../../atoms/Button'), {
  loading: () => <span style={{ width: '32px', height: '32px', display: 'inline-block' }} />
});

const Icon = dynamic(() => import('../../atoms/Icons/Icon'), {
  loading: () => <span style={{ width: '20px', height: '20px', display: 'inline-block' }} />
});

const Heading = dynamic(() => import('../../atoms/Headings/Heading'), {
  loading: () => <span />
});

interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  currency: string;
}

interface BudgetCardProps {
  budget: Budget;
  onDelete?: (id: string) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = memo(({ budget, onDelete }) => {
  const { category, amount, spent, currency } = budget;

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <Heading level={3}>{category}</Heading>
      </div>
      <div className="budget-info">
        <p className="budget-amount">
          Budget:{' '}
          {amount.toLocaleString('en-US', {
            style: 'currency',
            currency: currency,
          })}
        </p>
        <p className="remaining-amount">
          Remaining:{' '}
          {(amount - (spent || 0)).toLocaleString('en-US', {
            style: 'currency',
            currency: currency,
          })}
        </p>
      </div>
      <div className="progress-container">
        <div
          className={`progress-fill ${
            spent / amount > 0.9
              ? 'danger'
              : spent / amount > 0.7
                ? 'warning'
                : ''
          }`}
          style={{
            width: `${Math.min((spent / amount) * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  );
});

BudgetCard.displayName = 'BudgetCard';

export default BudgetCard;
