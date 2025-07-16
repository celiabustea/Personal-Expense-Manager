import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import Button from '../src/components/atoms/Button/Button';
import Icon from '../src/components/atoms/Icons/Icon';
import { RootState } from '../src/store';
import { exportToCSV, exportToJSON, getExportSummary } from '../src/utils/exportUtils';

// Type definition for user data
interface User {
  name: string;
  email: string;
}

const PageLayout = dynamic(() => import('../src/components/templates/PageLayout'), {
  loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.1rem', color: '#1e293b' }}>Loading Settings...</div>
});

const Settings: React.FC = () => {
  // State for export feedback
  const [exportStatus, setExportStatus] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });
  
  // Get data from Redux store
  const transactions = useSelector((state: RootState) => state.transactions.items);
  const recurringTransactions = useSelector((state: RootState) => state.transactions.recurring);
  const budgets = useSelector((state: RootState) => state.budgets.items);
  
  // Combine all transactions
  const allTransactions = [...transactions, ...recurringTransactions];
  
  // Get export summary
  const exportSummary = getExportSummary(allTransactions, budgets);

  // Placeholder user data - TODO: Replace with actual user data from context/API
  const user: User = {
    name: 'John Doe',
    email: 'john.doe@example.com',
  };
  const { darkMode, toggleDarkMode } = useDarkMode();

  const handleExportCSV = () => {
    const result = exportToCSV(allTransactions, budgets);
    setExportStatus({ 
      message: result.message, 
      type: result.success ? 'success' : 'error' 
    });
    // Clear status after 3 seconds
    setTimeout(() => setExportStatus({ message: '', type: null }), 3000);
  };

  const handleExportJSON = () => {
    const result = exportToJSON(allTransactions, budgets);
    setExportStatus({ 
      message: result.message, 
      type: result.success ? 'success' : 'error' 
    });
    // Clear status after 3 seconds
    setTimeout(() => setExportStatus({ message: '', type: null }), 3000);
  };

  return (
    <PageLayout>
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
        </div>
        <div className="settings-content">
          <div className="user-info">
            <div className="info-row">
              <span className="label">Name:</span>
              <span className="value">{user.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{user.email}</span>
            </div>
          </div>
          <div className="dark-mode-toggle">
            <label htmlFor="darkModeSwitch" className="toggle-label">Dark Mode</label>
            <input
              id="darkModeSwitch"
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              className="toggle-switch"
            />
            <span className="toggle-desc">{darkMode ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="export-section">
            <div className="export-header">
              <h3>Export Data</h3>
            </div>
            <p className="export-description">
              Export your financial data for backup or analysis purposes. Choose between CSV or JSON format.
            </p>
            
            {/* Data Summary */}
            <div className="data-summary">
              <h4>Available Data:</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Transactions:</span>
                  <span className="summary-value">{exportSummary.transactionCount}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Budgets:</span>
                  <span className="summary-value">{exportSummary.budgetCount}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Net Balance:</span>
                  <span className={`summary-value ${exportSummary.netBalance >= 0 ? 'positive' : 'negative'}`}>
                    ${Math.abs(exportSummary.netBalance).toFixed(2)} {exportSummary.netBalance >= 0 ? '↗' : '↘'}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Status */}
            {exportStatus.type && (
              <div className={`export-status ${exportStatus.type}`}>
                <Icon name={exportStatus.type === 'success' ? 'add' : 'close'} size="1em" />
                {exportStatus.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <Button
                label="Export as CSV"
                icon={<Icon name="download" size="1em" />}
                onClick={handleExportCSV}
                variant="primary"
                size="small"
                className="export-btn-csv"
                disabled={exportSummary.transactionCount === 0 && exportSummary.budgetCount === 0}
              />
              <Button
                label="Export as JSON"
                icon={<Icon name="download" size="1em" />}
                onClick={handleExportJSON}
                variant="primary"
                size="small"
                className="export-btn-json"
                disabled={exportSummary.transactionCount === 0 && exportSummary.budgetCount === 0}
              />
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .settings-container {
          padding: 2rem;
          position: relative;
          min-height: 100vh;
          max-width: 1400px;
          margin: 0 auto;
        }
        .settings-header {
          margin-bottom: 2.5rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 1.5rem;
          text-align: left;
        }
        .settings-header h1 {
          font-size: 2.2rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
          text-align: left;
        }
        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .user-info {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(30,41,59,0.08);
          border: 1px solid #e5e7eb;
          padding: 2rem;
          text-align: left;
        }
        .info-row {
          display: flex;
          justify-content: flex-start;
          gap: 2rem;
          margin-bottom: 1.2rem;
        }
        .label {
          color: #64748b;
          font-weight: 500;
          min-width: 80px;
        }
        .value {
          color: #1e293b;
          font-weight: 600;
        }
        .dark-mode-toggle {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(30,41,59,0.08);
          border: 1px solid #e5e7eb;
          padding: 2rem;
          text-align: left;
        }
        .toggle-label {
          font-weight: 500;
          color: #1e293b;
        }
        .toggle-switch {
          width: 40px;
          height: 20px;
        }
        .toggle-desc {
          color: #64748b;
          font-size: 0.95rem;
        }
        .export-section {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(30,41,59,0.08);
          border: 1px solid #e5e7eb;
          padding: 2rem;
          text-align: left;
        }
        .export-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          color: #1e293b;
        }
        .export-header h3 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 600;
        }
        .export-description {
          color: #64748b;
          font-size: 1rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          margin-top: 0;
        }
        .data-summary {
          background: #f8fafc;
          border-radius: 6px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid #e2e8f0;
        }
        .data-summary h4 {
          margin: 0 0 1rem 0;
          color: #1e293b;
          font-size: 1.1rem;
          font-weight: 600;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        .summary-label {
          color: #64748b;
          font-weight: 500;
        }
        .summary-value {
          color: #1e293b;
          font-weight: 600;
        }
        .summary-value.positive {
          color: #059669;
        }
        .summary-value.negative {
          color: #dc2626;
        }
        .export-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-weight: 500;
        }
        .export-status.success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        .export-status.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        
        /* Dark mode styles */
        :global(.dark-mode) .export-section {
          background: #1e293b !important;
          border-color: #374151 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
        }
        :global(.dark-mode) .user-info {
          background: #1e293b !important;
          border-color: #374151 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
        }
        :global(.dark-mode) .dark-mode-toggle {
          background: #1e293b !important;
          border-color: #374151 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
        }
        :global(.dark-mode) .data-summary {
          background: #0f172a !important;
          border-color: #334155 !important;
        }
        :global(.dark-mode) .data-summary h4 {
          color: #f8fafc !important;
        }
        :global(.dark-mode) .summary-item {
          background: #1e293b !important;
          border-color: #475569 !important;
        }
        :global(.dark-mode) .summary-label {
          color: #cbd5e1 !important;
        }
        :global(.dark-mode) .summary-value {
          color: #f8fafc !important;
        }
        :global(.dark-mode) .export-header {
          color: #f8fafc !important;
        }
        :global(.dark-mode) .export-header h3 {
          color: #f8fafc !important;
        }
        :global(.dark-mode) .export-description {
          color: #cbd5e1 !important;
        }
        :global(.dark-mode) .export-status.success {
          background: #064e3b !important;
          color: #10b981 !important;
          border-color: #065f46 !important;
        }
        :global(.dark-mode) .export-status.error {
          background: #7f1d1d !important;
          color: #f87171 !important;
          border-color: #991b1b !important;
        }
        :global(.dark-mode) .settings-header h1 {
          color: #f8fafc !important;
        }
        :global(.dark-mode) .settings-header {
          border-color: #374151 !important;
        }
        :global(.dark-mode) .label {
          color: #cbd5e1 !important;
        }
        :global(.dark-mode) .value {
          color: #f8fafc !important;
        }
        :global(.dark-mode) .toggle-label {
          color: #f8fafc !important;
        }
        :global(.dark-mode) .toggle-desc {
          color: #94a3b8 !important;
        }
      `}</style>
    </PageLayout>
  );
};

export default Settings;
