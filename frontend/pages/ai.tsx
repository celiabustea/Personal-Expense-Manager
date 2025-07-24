

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { getAiDataUsageConsent } from '../src/utils/privacyUtils';

const PageLayout = dynamic(() => import('../src/components/templates/PageLayout'), {
  loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.1rem', color: '#1e293b' }}>Loading Tips of the month...</div>
});

const Heading = dynamic(() => import('../src/components/atoms/Headings/Heading'));

const AI = () => {
  const [hasConsent, setHasConsent] = useState(true);

  useEffect(() => {
    setHasConsent(getAiDataUsageConsent());
  }, []);

  return (
    <PageLayout>
      <div className="ai-page-root">
        <div className="ai-container">
          <div className="ai-header">
            <Heading level={1}>Tips of the month</Heading>
          </div>
          <div className="ai-content">
            {!hasConsent ? (
              <div className="privacy-warning">
                <div className="warning-icon">⚠️</div>
                <Heading level={2}>AI Data Usage Not Enabled</Heading>
                <p>
                  To access AI-powered financial tips, please accept our privacy notice in the <b>Settings</b> page.<br />
                  Enable "AI Data Usage" to continue.
                </p>
              </div>
            ) : (
              <div className="ai-dashboard-content">
                <Heading level={3} className="ai-card-title">Your Financial Assistant</Heading>
                <Heading level={2} className="ai-card-insight-title">Your Personalized Financial Insights</Heading>
                <div className="ai-suggestion-list">
                  <div className="ai-suggestion-card">
                    <span className="ai-card-emoji">💡</span> <b>Suggestion 1:</b> Try setting aside 10% of your monthly income into a dedicated savings account. Even small, regular contributions can add up over time!
                  </div>
                  <div className="ai-suggestion-card">
                    <span className="ai-card-emoji">💡</span> <b>Suggestion 2:</b> Review your budget categories—see if you can trim a little from non-essential spending, like dining out or subscriptions, and redirect those funds toward your goals.
                  </div>
                  <div className="ai-suggestion-card">
                    <span className="ai-card-emoji">📉</span> <b>Insight:</b> This month, you’ve spent less on groceries compared to last month. Great job building a mindful shopping habit!
                  </div>
                  <div className="ai-suggestion-card">
                    <span className="ai-card-emoji">🎉</span> <b>Congrats!</b> You’ve reached your savings goal for the quarter! Keep up the fantastic work—your future self will thank you.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .ai-dashboard-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .ai-card-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e293b;
          text-align: center;
        }
        .ai-card-insight-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1.2rem;
          text-align: center;
        }
        .ai-suggestion-list {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          margin: 1.5rem 0 1.5rem 0;
        }
        .ai-suggestion-card {
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(30,41,59,0.07);
          padding: 1.2rem 1.5rem;
          font-size: 1.08rem;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }
        .ai-suggestion-card .ai-card-emoji {
          font-size: 1.3em;
          margin-right: 0.5em;
        }
        .ai-card-footer {
          color: #065f46;
          font-size: 1.08rem;
          margin-top: 1.5rem;
          text-align: center;
        }
        /* No .ai-card dark mode needed since .ai-card is removed */
        :global(.dark-mode) .ai-page-root .ai-header :global(.heading),
        :global(.dark-mode) .ai-page-root .ai-dashboard-content :global(.heading),
        :global(.dark-mode) .ai-page-root .ai-header h1,
        :global(.dark-mode) .ai-page-root .ai-dashboard-content h1,
        :global(.dark-mode) .ai-page-root .ai-dashboard-content h2,
        :global(.dark-mode) .ai-page-root .ai-dashboard-content h3,
        :global(.dark-mode) .ai-page-root .ai-card-title,
        :global(.dark-mode) .ai-page-root .ai-card-insight-title {
          color: #fff !important;
          text-shadow: none !important;
        }
        :global(.dark-mode) .ai-suggestion-card {
          background: #1e293b !important;
          border-color: #374151 !important;
          color: #fff !important;
        }
        :global(.dark-mode) .ai-suggestion-card b,
        :global(.dark-mode) .ai-suggestion-card .ai-card-emoji {
          color: #fff !important;
        }
        :global(.dark-mode) .ai-card-footer {
          color: #fff !important;
        }
        .privacy-warning {
          text-align: center;
          background: #fff7ed;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(251, 191, 36, 0.12);
          border: 1px solid #fbbf24;
          padding: 3rem 2rem;
          max-width: 600px;
          margin: 0 auto;
        }
        .warning-icon {
          font-size: 3rem;
          margin-bottom: 1.2rem;
        }
        .privacy-warning h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #b45309;
          margin-bottom: 1rem;
        }
        .privacy-warning p {
          font-size: 1.1rem;
          color: #92400e;
          line-height: 1.6;
          margin: 0;
        }
        :global(.dark-mode) .privacy-warning {
          background: #78350f;
          border-color: #fbbf24;
          box-shadow: 0 4px 16px rgba(251, 191, 36, 0.12);
        }
        :global(.dark-mode) .privacy-warning h2 {
          color: #fde68a;
        }
        :global(.dark-mode) .privacy-warning p {
          color: #fde68a;
        }
        .ai-container {
          padding: 2rem;
          position: relative;
          min-height: 100vh;
          max-width: 1400px;
          margin: 0 auto;
        }
        .ai-header {
          margin-bottom: 2.5rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 1.5rem;
          text-align: left;
        }
        .ai-header h1 {
          font-size: 2.2rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
          text-align: left;
        }
        .ai-content {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 60vh;
        }
        .development-message {
          text-align: center;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(30,41,59,0.12);
          border: 1px solid #e5e7eb;
          padding: 4rem 3rem;
          max-width: 600px;
        }
        .ai-suggestions-message {
          text-align: center;
          background: #f0fdf4;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.10);
          border: 1px solid #6ee7b7;
          padding: 3rem 2rem;
          max-width: 600px;
          margin: 0 auto;
        }
        .ai-suggestions-message .message-icon {
          font-size: 3rem;
          margin-bottom: 1.2rem;
        }
        .suggestion-list {
          text-align: left;
          margin: 2rem auto 1.5rem auto;
          padding: 0 0 0 1.2rem;
          max-width: 500px;
          color: #047857;
          font-size: 1.08rem;
        }
        .suggestion-list li {
          margin-bottom: 1.1rem;
          line-height: 1.6;
        }
        .ai-message-footer {
          color: #065f46;
          font-size: 1.08rem;
          margin-top: 1.5rem;
        }
        :global(.dark-mode) .ai-suggestions-message {
          background: #064e3b;
          border-color: #10b981;
        }
        :global(.dark-mode) .suggestion-list {
          color: #6ee7b7;
        }
        :global(.dark-mode) .ai-message-footer {
          color: #6ee7b7;
        }
        .message-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }
        .development-message h2 {
          font-size: 2rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
        }
        .development-message p {
          font-size: 1.1rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }
        
        /* Dark mode styles */
        :global(.dark-mode) .ai-header {
          border-color: #374151;
        }
        :global(.dark-mode) .ai-header h1 {
          color: #f8fafc;
        }
        :global(.dark-mode) .development-message {
          background: #1e293b;
          border-color: #374151;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }
        :global(.dark-mode) .development-message h2 {
          color: #f8fafc;
        }
        :global(.dark-mode) .development-message p {
          color: #cbd5e1;
        }
      `}</style>
    </PageLayout>
  );
};

export default AI;
