import React, { memo } from 'react';
import dynamic from 'next/dynamic';
import { Transaction } from '../../molecules/TransactionCard/TransactionCard';

// Dynamic imports for heavy components
const TransactionCard = dynamic(() => import('../../molecules/TransactionCard/TransactionCard'), {
  loading: () => <div style={{ height: '100px', backgroundColor: '#f8fafc', borderRadius: '8px' }} />
});

const Heading = dynamic(() => import('../../atoms/Headings/Heading'), {
  loading: () => <span />
});

interface RecurringTransactionsListProps {
  transactions?: Transaction[];
  onDelete?: (id: string) => void;
}

const RecurringTransactionsList: React.FC<RecurringTransactionsListProps> = memo(({ transactions = [], onDelete }) => {
  const handleDelete = (transactionId: string) => {
    if (onDelete) {
      onDelete(transactionId);
    }
  };

  if (!transactions.length) {
    return (
      <div className="empty-state">
        <p>No recurring transactions set up</p>
      </div>
    );
  }

  return (
    <div className="recurring-transactions">
      <Heading level={2}>Recurring Transactions</Heading>
      <div className="transactions-list">
        {(transactions as Transaction[]).map((transaction: Transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={{
              ...transaction,
              description: `${transaction.description} (${transaction.recurringFrequency})`,
            }}
            onDelete={() => handleDelete(transaction.id)}
          />
        ))}
      </div>
    </div>
  );
});

RecurringTransactionsList.displayName = 'RecurringTransactionsList';

export default RecurringTransactionsList;
