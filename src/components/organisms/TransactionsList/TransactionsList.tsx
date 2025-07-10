import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Transaction } from '../../molecules/TransactionCard/TransactionCard';

// Dynamic imports for heavy components
const TransactionCard = dynamic(() => import('../../molecules/TransactionCard/TransactionCard'), {
  loading: () => <div style={{ height: '100px', backgroundColor: '#f8fafc', borderRadius: '8px' }} />
});

const Heading = dynamic(() => import('../../atoms/Headings'), {
  loading: () => <span />
});

const Button = dynamic(() => import('../../atoms/Button'), {
  loading: () => <span style={{ width: '80px', height: '32px', display: 'inline-block' }} />
});

interface TransactionsListProps {
  transactions?: Transaction[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  title?: string;
  emptyMessage?: string;
  showViewAll?: boolean;
}

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions = [],
  onDelete,
  onAdd,
  title = 'Recent Transactions',
  emptyMessage = 'No transactions found',
  showViewAll = true,
}) => {
  // Memoize the transaction list to prevent unnecessary re-renders
  const memoizedTransactions = useMemo(() => {
    return transactions.map((transaction: Transaction) => (
      <TransactionCard
        key={transaction.id}
        transaction={transaction}
        onDelete={() => onDelete(transaction.id)}
      />
    ));
  }, [transactions, onDelete]);

  return (
    <div className="transactions-widget">
      <div className="widget-header">
        <Heading level={2}>{title}</Heading>
        {showViewAll && transactions.length > 0 && (
          <Button
            variant="ghost"
            label="View All"
            onClick={onAdd}
            size="small"
          />
        )}
      </div>

      <div className="transactions-list">
        {transactions.length === 0 ? (
          <p className="empty-state">{emptyMessage}</p>
        ) : (
          memoizedTransactions
        )}
      </div>
    </div>
  );
};

export default TransactionsList;
