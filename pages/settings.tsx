import React from 'react';
import dynamic from 'next/dynamic';
import { useDarkMode } from '../src/contexts/DarkModeContext';
import Button from '../src/components/atoms/Button/Button';
import Icon from '../src/components/atoms/Icons/Icon';

const PageLayout = dynamic(() => import('../src/components/templates/PageLayout'), {
  loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.1rem', color: '#1e293b' }}>Loading Settings...</div>
});

const Settings = () => {
  // Placeholder user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
  };
  const { darkMode, toggleDarkMode } = useDarkMode();

  const handleExportCSV = () => {
    console.log('Export CSV clicked');
    // TODO: Implement CSV export functionality
  };

  const handleExportJSON = () => {
    console.log('Export JSON clicked');
    // TODO: Implement JSON export functionality
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
              <Icon name="download" size="1.5rem" />
              <h3>Export Data</h3>
            </div>
            <p className="export-description">
              Export your financial data for backup or analysis purposes. Choose between CSV or JSON format.
            </p>
            <div className="export-buttons">
              <div className="export-button-wrapper">
                <Button
                  label="Export as CSV"
                  onClick={handleExportCSV}
                  variant="primary"
                  size="medium"
                  icon={<Icon name="download" size="1rem" />}
                  className="export-btn-csv"
                />
                <span className="button-description">Spreadsheet format for Excel</span>
              </div>
              <div className="export-button-wrapper">
                <Button
                  label="Export as JSON"
                  onClick={handleExportJSON}
                  variant="secondary"
                  size="medium"
                  icon={<Icon name="download" size="1rem" />}
                  className="export-btn-json"
                />
                <span className="button-description">Raw data format for developers</span>
              </div>
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
        .export-buttons {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }
        .export-button-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          min-width: 200px;
        }
        .button-description {
          color: #64748b;
          font-size: 0.85rem;
          text-align: center;
          font-style: italic;
        }
        .export-btn-csv {
          background: #1e293b !important;
          color: white !important;
          border: 2px solid #1e293b !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }
        .export-btn-csv:hover {
          background: #334155 !important;
          border-color: #334155 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3) !important;
        }
        .export-btn-json {
          background: #1e293b !important;
          color: white !important;
          border: 2px solid #1e293b !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }
        .export-btn-json:hover {
          background: #334155 !important;
          border-color: #334155 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3) !important;
        }
        
        /* Dark mode styles */
        :global(.dark-mode) .export-section {
          background: #1e293b !important;
          border-color: #374151 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
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
        :global(.dark-mode) .button-description {
          color: #94a3b8 !important;
        }
        :global(.dark-mode) .export-btn-csv {
          background: #f8fafc !important;
          color: #1e293b !important;
          border-color: #f8fafc !important;
        }
        :global(.dark-mode) .export-btn-csv:hover {
          background: #e2e8f0 !important;
          border-color: #e2e8f0 !important;
          color: #1e293b !important;
        }
        :global(.dark-mode) .export-btn-json {
          background: #f8fafc !important;
          color: #1e293b !important;
          border-color: #f8fafc !important;
        }
        :global(.dark-mode) .export-btn-json:hover {
          background: #e2e8f0 !important;
          color: #1e293b !important;
          border-color: #e2e8f0 !important;
        }
      `}</style>
    </PageLayout>
  );
};

export default Settings;
