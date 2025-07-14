import React, { memo } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for heavy components
const Icon = dynamic(() => import('../../atoms/Icons/Icon'), {
  loading: () => <span style={{ width: '20px', height: '20px', display: 'inline-block' }} />
});

const Heading = dynamic(() => import('../../atoms/Headings/Heading'), {
  loading: () => <span />
});

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = memo(({ transaction, onDelete }) => {
  const {
    id,
    description,
    amount,
    category,
    date,
    isRecurring,
    recurringFrequency,
  } = transaction;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id); // Pass just the ID
    }
  };

  return (
    <div className="transaction-card">
      <div className="transaction-header">
        <Heading level={3}>{description}</Heading>
        <div className="transaction-actions">
          <span className="transaction-category">{category}</span>
          {isRecurring && (
            <span className="transaction-frequency">
              ({recurringFrequency})
            </span>
          )}
        </div>
      </div>
      <p className="transaction-amount">
        {amount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
      </p>
      <p className="transaction-date">
        {new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })} at {new Date(date).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}
      </p>
    </div>
  );
});

TransactionCard.displayName = 'TransactionCard';

export default TransactionCard;
