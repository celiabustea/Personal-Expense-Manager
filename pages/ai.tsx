import React from 'react';
import dynamic from 'next/dynamic';

const PageLayout = dynamic(() => import('../src/components/templates/PageLayout'), {
  loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.1rem', color: '#1e293b' }}>Loading Tips of the month...</div>
});

const Heading = dynamic(() => import('../src/components/atoms/Headings/Heading'));

const AI = () => {
  return (
    <PageLayout>
      <div className="ai-container">
        <div className="ai-header">
          <Heading level={1}>Tips of the month</Heading>
        </div>
        <div className="ai-content">
          <div className="development-message">
            <div className="message-icon">💡</div>
            <Heading level={2}>Tips of the month in Development</Heading>
            <p>Our monthly financial tips and insights feature is currently under development. Stay tuned for helpful advice!</p>
          </div>
        </div>
      </div>
      <style jsx>{`
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
          align-items: center;
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
