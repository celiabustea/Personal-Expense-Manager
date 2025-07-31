
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import { useAuth } from '../src/contexts/AuthContext';
import Button from '../src/components/atoms/Button/Button';
import Icon from '../src/components/atoms/Icons/Icon';
import Modal from '../src/components/molecules/Modal';
import { RootState } from '../src/store';
import { exportToCSV, exportToJSON, getExportSummary } from '../src/utils/exportUtils';
import { BudgetAPI } from '@/utils/apiService';
import Budgets from './budgets';

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
  
  // State for AI privacy settings
  const [aiDataUsageConsent, setAiDataUsageConsent] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [hasSeenPrivacyNotice, setHasSeenPrivacyNotice] = useState<boolean>(false);
  
  // Get data from Redux store
  const transactions = useSelector((state: RootState) => state.transactions.items);
  const recurringTransactions = useSelector((state: RootState) => state.transactions.recurring);
  const budgets = useSelector((state: RootState) => state.budgets.items);
  const userProfile = useSelector((state: RootState) => state.user.profile);
  
  // Get authenticated user from context
  const { user: authUser } = useAuth();
  
  // Combine all transactions
  const allTransactions = [...transactions, ...recurringTransactions];
  
  // Get export summary - ensure currency is defined
  const exportSummary = getExportSummary(allTransactions, budgets.map(budget => ({
    ...budget,
    currency: budget.currency || 'USD' // Ensure currency is always a string
  })));

  // Get user data from profile or auth user as fallback
  const getUserDisplayData = () => {
    // If we have a user profile from Redux, use it
    if (userProfile) {
      return {
        name: userProfile.name || 'User',
        email: userProfile.email || 'user@example.com',
      };
    }
    
    // If we have an authenticated user but no profile yet, use auth data
    if (authUser) {
      const fallbackName = authUser.user_metadata?.name || 
                          authUser.user_metadata?.full_name || 
                          authUser.email?.split('@')[0] || 
                          'User';
      return {
        name: fallbackName,
        email: authUser.email || 'user@example.com',
      };
    }
    
    // Default fallback
    return {
      name: 'User',
      email: 'user@example.com',
    };
  };

  const user = getUserDisplayData();

  // Check if we're in a loading state (user is authenticated but profile not yet loaded)
  const isProfileLoading = authUser && !userProfile;
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Load AI privacy settings from localStorage on component mount
  React.useEffect(() => {
    const savedConsent = localStorage.getItem('aiDataUsageConsent');
    const savedNoticeStatus = localStorage.getItem('hasSeenPrivacyNotice');
    
    if (savedConsent !== null) {
      setAiDataUsageConsent(JSON.parse(savedConsent));
    }
    if (savedNoticeStatus !== null) {
      setHasSeenPrivacyNotice(JSON.parse(savedNoticeStatus));
    }
  }, []);

  // Handle AI privacy toggle
  const handleAiPrivacyToggle = () => {
    // Always show the privacy modal when enabling
    if (!aiDataUsageConsent) {
      setShowPrivacyModal(true);
    } else {
      // If disabling, just turn off consent
      setAiDataUsageConsent(false);
      localStorage.setItem('aiDataUsageConsent', JSON.stringify(false));
    }
  };

  // Handle privacy notice acceptance
  const handlePrivacyAccept = () => {
    setAiDataUsageConsent(true);
    setHasSeenPrivacyNotice(true);
    setShowPrivacyModal(false);
    localStorage.setItem('aiDataUsageConsent', JSON.stringify(true));
    localStorage.setItem('hasSeenPrivacyNotice', JSON.stringify(true));
  };

  // Handle privacy notice decline
  const handlePrivacyDecline = () => {
    setAiDataUsageConsent(false);
    setHasSeenPrivacyNotice(true);
    setShowPrivacyModal(false);
    localStorage.setItem('aiDataUsageConsent', JSON.stringify(false));
    localStorage.setItem('hasSeenPrivacyNotice', JSON.stringify(true));
  };

  const handleExportCSV = () => {
    const result = exportToCSV(allTransactions, budgets.map(budget => ({
      ...budget,
      currency: budget.currency || 'USD'
    })));
    setExportStatus({ 
      message: result.message, 
      type: result.success ? 'success' : 'error' 
    });
    // Clear status after 3 seconds
    setTimeout(() => setExportStatus({ message: '', type: null }), 3000);
  };

  const handleExportJSON = () => {
    const result = exportToJSON(allTransactions, budgets.map(budget => ({
      ...budget,
      currency: budget.currency || 'USD'
    })));
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
              <span className="value">
                {user.name}
                {isProfileLoading && (
                  <span className="loading-indicator" title="Loading profile data...">
                    <Icon name="chart" size="0.8em" />
                  </span>
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{user.email}</span>
            </div>
          </div>
          
          <div className="ai-privacy-toggle">
            <div className="toggle-row">
              <label htmlFor="aiPrivacySwitch" className="toggle-label">AI Data Usage</label>
              <input
                id="aiPrivacySwitch"
                type="checkbox"
                checked={aiDataUsageConsent}
                onChange={handleAiPrivacyToggle}
                className="toggle-switch"
              />
              <span className="toggle-desc">
                {aiDataUsageConsent ? 'Allowed' : 'Not Allowed'}
              </span>
            </div>
            <p className="toggle-help-text">
              Allow AI features to use your financial data for personalized insights and recommendations
            </p>
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
        </div>
      </div>

      {/* Privacy Notice Modal */}

      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="AI Data Usage Privacy Notice"
      >
        <div className="privacy-modal-outer">
          <div className="privacy-modal-scrollable">
            <p className="privacy-description">
              By enabling AI Data Usage, you consent to allowing our AI features to analyze your financial data to provide:
            </p>
            <ul className="privacy-features">
              <li>Personalized spending insights and trends</li>
              <li>Smart budget recommendations</li>
              <li>Customized financial advice and tips</li>
              <li>Automated categorization and analysis</li>
              <li>Predictive spending patterns</li>
            </ul>
            <div className="privacy-assurance">
              <h4>Your Privacy Protection:</h4>
              <ul>
                <li>Your data stays on your device and our secure servers</li>
                <li>We never share your personal financial information with third parties</li>
                <li>All AI processing is done with encrypted, anonymized data</li>
                <li>You can disable this feature at any time in settings</li>
              </ul>
            </div>
          </div>
          <div className="modal-actions sticky-actions">
            <button className="btn-accept" onClick={handlePrivacyAccept}>
              I Consent
            </button>
            <button className="btn-decline" onClick={handlePrivacyDecline}>
              I Don't Consent
            </button>
          </div>
        </div>
      </Modal>

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
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .loading-indicator {
          display: inline-flex;
          align-items: center;
          color: #6b7280;
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
        .ai-privacy-toggle {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(30,41,59,0.08);
          border: 1px solid #e5e7eb;
          padding: 2rem;
          text-align: left;
        }
        .ai-privacy-toggle .toggle-row {
          display: flex;
          align-items: center;
          gap: 1rem;
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
        .toggle-help-text {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
          line-height: 1.4;
          max-width: 400px;
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

        /* Privacy Modal Content Styles */
        .privacy-modal-outer {
          display: flex;
          flex-direction: column;
          height: 60vh;
          min-width: 320px;
          max-width: 100vw;
        }
        .privacy-modal-scrollable {
          flex: 1 1 auto;
          overflow-y: auto;
          padding-bottom: 1.5rem;
          text-align: center;
        }
        .privacy-description {
          color: #374151;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          text-align: center;
        }
        .privacy-features {
          list-style: none;
          padding: 0;
          margin: 0 0 1rem 0;
          background: #f8fafc;
          border-radius: 8px;
          padding: 1rem;
          text-align: left;
          flex-shrink: 0;
        }
        .privacy-features li {
          padding: 0.5rem 0;
          color: #1e293b;
          font-weight: 500;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.95rem;
        }
        .privacy-features li:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .privacy-assurance {
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
          border-radius: 8px;
          padding: 1.5rem;
          border: 2px solid #bbf7d0;
          margin-bottom: 1rem;
          flex-shrink: 0;
        }
        .privacy-assurance h4 {
          margin: 0 0 1rem 0;
          color: #059669;
          font-size: 1.1rem;
          font-weight: 700;
          text-align: center;
        }
        .privacy-assurance ul {
          list-style: none;
          padding: 0;
          margin: 0;
          text-align: left;
        }
        .privacy-assurance li {
          padding: 0.5rem 0;
          color: #065f46;
          font-size: 0.95rem;
          font-weight: 500;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          padding: 1.25rem 0 0 0;
          border-top: 1px solid #e5e7eb;
          background: #fff;
        }
        .sticky-actions {
          position: sticky;
          bottom: 0;
          left: 0;
          z-index: 2;
          background: #fff;
        }
        .btn-accept {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
          min-width: 150px;
        }
        .btn-accept:hover {
          background: linear-gradient(135deg, #047857 0%, #065f46 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(5, 150, 105, 0.4);
        }
        .btn-decline {
          background: white;
          color: #6b7280;
          border: 2px solid #d1d5db;
          padding: 1rem 2rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 150px;
        }
        .btn-decline:hover {
          background: #f9fafb;
          color: #374151;
          border-color: #9ca3af;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
        :global(.dark-mode) .loading-indicator {
          color: #94a3b8 !important;
        }
        :global(.dark-mode) .toggle-label {
          color: #f8fafc !important;
        }
        :global(.dark-mode) .toggle-desc {
          color: #94a3b8 !important;
        }
        
        /* Dark mode AI privacy toggle */
        :global(.dark-mode) .ai-privacy-toggle {
          background: #1e293b !important;
          border-color: #374151 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
        }
        :global(.dark-mode) .toggle-help-text {
          color: #94a3b8 !important;
        }
        
        /* Dark mode modal content styles */
        :global(.dark-mode) .modal-actions {
          border-color: #374151 !important;
          background: #1e293b !important;
        }
        :global(.dark-mode) .sticky-actions {
          background: #1e293b !important;
        }
        :global(.dark-mode) .btn-decline {
          background: #374151 !important;
          color: #cbd5e1 !important;
          border-color: #475569 !important;
        }
        :global(.dark-mode) .btn-decline:hover {
          background: #475569 !important;
          color: #f8fafc !important;
          border-color: #64748b !important;
        }
        :global(.dark-mode) .privacy-description {
          color: #cbd5e1 !important;
        }
        :global(.dark-mode) .privacy-features {
          background: #0f172a !important;
        }
        :global(.dark-mode) .privacy-features li {
          color: #f8fafc !important;
          border-color: #374151 !important;
        }
        :global(.dark-mode) .privacy-assurance {
          background: linear-gradient(135deg, #064e3b 0%, #065f46 100%) !important;
          border-color: #047857 !important;
        }
        :global(.dark-mode) .privacy-assurance h4 {
          color: #34d399 !important;
        }
        :global(.dark-mode) .privacy-assurance li {
          color: #a7f3d0 !important;
        }
      `}</style>
    </PageLayout>
  );
};

export default Settings;
