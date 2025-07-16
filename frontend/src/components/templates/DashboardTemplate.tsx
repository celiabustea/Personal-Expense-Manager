import React, { ReactNode } from 'react';
import Navbar from '../organisms/NavBar/Navbar';
import Sidebar from '../organisms/Sidebar/Sidebar';
import TransactionsList from '../organisms/TransactionsList/TransactionsList';
import RecurringTransactionsList from '../organisms/ReccuringTransactions/RecurringTransactionsList';
import { Transaction } from '../molecules/TransactionCard/TransactionCard';

interface DashboardTemplateProps {
  children: ReactNode;
  transactions?: Transaction[];
  recurringTransactions?: Transaction[];
  onDeleteTransaction?: (id: string) => void;
  onDeleteRecurring?: (id: string) => void;
  username?: string;
}

const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  children,
  transactions = [],
  recurringTransactions = [],
  onDeleteTransaction,
  onDeleteRecurring,
  username,
}) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar username={username} />
        <div className="dashboard-content">
          {children}
          <div className="dashboard-widgets">
            <TransactionsList
              transactions={transactions}
              onDelete={onDeleteTransaction || (() => {})}
              onAdd={() => {}}
            />
            <RecurringTransactionsList
              transactions={recurringTransactions}
              onDelete={onDeleteRecurring}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTemplate;
