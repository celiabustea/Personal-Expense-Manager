import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAiDataUsageConsent } from '../src/utils/privacyUtils';
import { analyzeFinancialData, checkAIServiceHealth, prepareFinancialDataForAI } from '../src/utils/aiUtils';

const PageLayout = dynamic(() => import('../src/components/templates/PageLayout'), {
  loading: () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.1rem', color: '#1e293b' }}>Loading AI Assistant...</div>
});

const Heading = dynamic(() => import('../src/components/atoms/Headings/Heading'));
const Button = dynamic(() => import('../src/components/atoms/Button'));

const AI = () => {
  const [hasConsent, setHasConsent] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<{
    suggestions: string[];
    question: string;
    encouragement: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiServiceHealth, setAiServiceHealth] = useState({
    ollamaAvailable: false,
    mistralInstalled: false,
    error: null as string | null
  });

  // Get data from Redux store
  const transactions = useSelector((state: any) => state.transactions?.items || []);
  const budgets = useSelector((state: any) => state.budgets?.items || []);

  useEffect(() => {
    setHasConsent(getAiDataUsageConsent());
    checkAIHealth();
  }, []);

  const checkAIHealth = async () => {
    try {
      const health = await checkAIServiceHealth();
      setAiServiceHealth({
        ollamaAvailable: health.ollamaAvailable,
        mistralInstalled: health.mistralInstalled,
        error: health.error || null
      });
    } catch (err) {
      console.error('Failed to check AI service health:', err);
    }
  };

  const handleAnalyzeData = async (format: 'csv' | 'json') => {
    if (!hasConsent) {
      setError('Please enable AI Data Usage in Settings first.');
      return;
    }

    if (transactions.length === 0 && budgets.length === 0) {
      setError('No financial data available to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const exportData = prepareFinancialDataForAI(transactions, budgets, format);
      const result = await analyzeFinancialData(exportData, format);

      if (result.success && result.data) {
        setAiAnalysis(result.data);
      } else {
        setError(result.message || 'Failed to analyze data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="ai-page-root">
        <div className="ai-container">
          <div className="ai-header">
            <Heading level={1}>AI Financial Assistant</Heading>
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
                <Heading level={3} className="ai-card-title">Your Personal Financial Assistant</Heading>
                
                {/* AI Service Status */}
                {!aiServiceHealth.ollamaAvailable && (
                  <div className="service-warning">
                    <div className="warning-icon">⚠️</div>
                    <p>AI service is not available. Please ensure Ollama is running and Mistral model is installed.</p>
                    <Button 
                      label="Check Service Status" 
                      onClick={checkAIHealth}
                      variant="secondary"
                      size="small"
                    />
                  </div>
                )}

                {/* Analysis Controls */}
                {aiServiceHealth.ollamaAvailable && aiServiceHealth.mistralInstalled && (
                  <div className="analysis-controls">
                    <p>Analyze your financial data to get personalized insights:</p>
                    <div className="control-buttons">
                      <Button 
                        label={isLoading ? "Analyzing..." : "Analyze Data (JSON)"} 
                        onClick={() => handleAnalyzeData('json')}
                        variant="primary"
                        size="small"
                        disabled={isLoading || (transactions.length === 0 && budgets.length === 0)}
                      />
                      <Button 
                        label={isLoading ? "Analyzing..." : "Analyze Data (CSV)"} 
                        onClick={() => handleAnalyzeData('csv')}
                        variant="secondary"
                        size="small"
                        disabled={isLoading || (transactions.length === 0 && budgets.length === 0)}
                      />
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="error-message">
                    <div className="error-icon">❌</div>
                    <p>{error}</p>
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="loading-message">
                    <div className="loading-icon">🔄</div>
                    <p>Analyzing your financial data with AI...</p>
                  </div>
                )}

                {/* AI Analysis Results */}
                {aiAnalysis && (
                  <div className="ai-results">
                    <Heading level={2} className="ai-card-insight-title">Your Personalized Financial Insights</Heading>
                    <div className="ai-suggestion-list">
                      {aiAnalysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="ai-suggestion-card">
                          <span className="ai-card-emoji">💡</span> 
                          <b>Suggestion {index + 1}:</b> {suggestion}
                        </div>
                      ))}
                      
                      {aiAnalysis.question && (
                        <div className="ai-suggestion-card">
                          <span className="ai-card-emoji">❓</span> 
                          <b>Question:</b> {aiAnalysis.question}
                        </div>
                      )}
                      
                      {aiAnalysis.encouragement && (
                        <div className="ai-suggestion-card">
                          <span className="ai-card-emoji">🎉</span> 
                          <b>Encouragement:</b> {aiAnalysis.encouragement}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Default content when no analysis yet */}
                {!aiAnalysis && !isLoading && !error && aiServiceHealth.ollamaAvailable && (
                  <div className="default-content">
                    <Heading level={2} className="ai-card-insight-title">Get Started with AI Insights</Heading>
                    <p className="default-description">
                      Click "Analyze Data" above to get personalized financial insights based on your transactions and budgets.
                      Our AI will analyze your spending patterns, budget utilization, and provide actionable recommendations.
                    </p>
                  </div>
                )}

                {/* Service unavailable fallback */}
                {!aiServiceHealth.ollamaAvailable && !isLoading && (
                  <div className="fallback-tips">
                    <Heading level={2} className="ai-card-insight-title">General Financial Tips</Heading>
                    <div className="ai-suggestion-list">
                      <div className="ai-suggestion-card">
                        <span className="ai-card-emoji">💡</span> 
                        <b>Tip 1:</b> Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.
                      </div>
                      <div className="ai-suggestion-card">
                        <span className="ai-card-emoji">💡</span> 
                        <b>Tip 2:</b> Track your expenses regularly to identify spending patterns and areas for improvement.
                      </div>
                      <div className="ai-suggestion-card">
                        <span className="ai-card-emoji">📊</span> 
                        <b>Insight:</b> Start with small financial goals to build momentum and confidence in your budgeting journey.
                      </div>
                    </div>
                  </div>
                )}
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
          margin: 0 0 1rem 0;
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
        
        .analysis-controls {
          background: #f8fafc;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1rem 0 2rem 0;
          border: 1px solid #e5e7eb;
          text-align: center;
          max-width: 600px;
          width: 100%;
        }
        
        .analysis-controls p {
          margin: 0 0 1rem 0;
          color: #64748b;
          font-size: 1rem;
        }
        
        .control-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .service-warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 2rem;
          margin: 1rem 0;
          text-align: center;
          max-width: 600px;
          width: 100%;
        }
        
        .service-warning .warning-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        
        .service-warning p {
          color: #92400e;
          margin-bottom: 1rem;
        }
        
        .error-message {
          background: #fee2e2;
          border: 1px solid #ef4444;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1rem 0;
          text-align: center;
          max-width: 600px;
          width: 100%;
        }
        
        .error-message .error-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .error-message p {
          color: #dc2626;
          margin: 0;
        }
        
        .loading-message {
          background: #dbeafe;
          border: 1px solid #3b82f6;
          border-radius: 12px;
          padding: 2rem;
          margin: 1rem 0;
          text-align: center;
          max-width: 600px;
          width: 100%;
        }
        
        .loading-message .loading-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
          animation: spin 2s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .loading-message p {
          color: #1d4ed8;
          margin: 0;
        }
        
        .ai-suggestion-list {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          margin: 1.5rem 0 1.5rem 0;
          max-width: 800px;
          width: 100%;
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
          align-items: flex-start;
          gap: 0.7rem;
          line-height: 1.6;
        }
        
        .ai-suggestion-card .ai-card-emoji {
          font-size: 1.3em;
          margin-right: 0.5em;
          flex-shrink: 0;
        }
        
        .default-content {
          background: #f0fdf4;
          border-radius: 12px;
          padding: 2rem;
          margin: 1rem 0;
          text-align: center;
          max-width: 600px;
          width: 100%;
          border: 1px solid #bbf7d0;
        }
        
        .default-description {
          color: #166534;
          line-height: 1.6;
          margin: 0;
        }
        
        .fallback-tips {
          margin-top: 2rem;
          width: 100%;
          max-width: 800px;
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
        
        /* Dark mode styles */
        .dark-mode .ai-header {
          border-color: #374151;
        }
        
        .dark-mode .ai-header h1 {
          color: #ffffff !important;
        }
        
        .dark-mode .ai-card-title,
        .dark-mode .ai-card-insight-title {
          color: #ffffff !important;
        }
        
        .dark-mode .ai-card-title h3,
        .dark-mode .ai-card-insight-title h2,
        .dark-mode .ai-header h1,
        .dark-mode h1,
        .dark-mode h2,
        .dark-mode h3 {
          color: #ffffff !important;
        }
        
        .dark-mode .ai-suggestion-card {
          background: #1e293b !important;
          border-color: #374151 !important;
          color: #ffffff !important;
        }
        
        .dark-mode .analysis-controls {
          background: #1e293b;
          border-color: #374151;
        }
        
        .dark-mode .analysis-controls p,
        .dark-mode .analysis-controls * {
          color: #ffffff !important;
        }
        
        .dark-mode .default-content {
          background: #064e3b;
          border-color: #10b981;
        }
        
        .dark-mode .default-description,
        .dark-mode .default-content *,
        .dark-mode .default-content p {
          color: #ffffff !important;
        }
        
        .dark-mode .privacy-warning {
          background: #78350f;
          border-color: #fbbf24;
        }
        
        .dark-mode .privacy-warning h2,
        .dark-mode .privacy-warning * {
          color: #ffffff !important;
        }
        
        .dark-mode .privacy-warning p {
          color: #ffffff !important;
        }
        
        .dark-mode .error-message {
          background: #7f1d1d;
          border-color: #dc2626;
        }
        
        .dark-mode .error-message p,
        .dark-mode .error-message * {
          color: #ffffff !important;
        }
        
        .dark-mode .loading-message {
          background: #1e3a8a;
          border-color: #3b82f6;
        }
        
        .dark-mode .loading-message p,
        .dark-mode .loading-message * {
          color: #ffffff !important;
        }
        
        .dark-mode .service-warning {
          background: #78350f;
          border-color: #f59e0b;
        }
        
        .dark-mode .service-warning p,
        .dark-mode .service-warning * {
          color: #ffffff !important;
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

        .dark-mode .ai-container {
          color: #ffffff;
        }
        
        .dark-mode .ai-header h1 {
          color: #ffffff !important;
        }
        
        /* Force all text to be white in dark mode */
        .dark-mode * {
          color: #ffffff !important;
        }
        
        .dark-mode p,
        .dark-mode span,
        .dark-mode div,
        .dark-mode b,
        .dark-mode strong,
        .dark-mode em,
        .dark-mode i {
          color: #ffffff !important;
        }
        
        .dark-mode .ai-suggestion-card *,
        .dark-mode .ai-suggestion-card p,
        .dark-mode .ai-suggestion-card span,
        .dark-mode .ai-suggestion-card b {
          color: #ffffff !important;
        }
        
        .dark-mode .fallback-tips *,
        .dark-mode .fallback-tips p,
        .dark-mode .fallback-tips span,
        .dark-mode .fallback-tips b {
          color: #ffffff !important;
        }
        
        .dark-mode .analysis-controls *,
        .dark-mode .default-content *,
        .dark-mode .ai-results * {
          color: #ffffff !important;
        }
      `}</style>
    </PageLayout>
  );
};

export default AI;
