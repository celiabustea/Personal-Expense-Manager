import React, { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for heavy components
const Sidebar = dynamic(() => import('../organisms/Sidebar/Sidebar'), {
  loading: () => <div style={{ width: '260px', backgroundColor: '#1e293b' }} />
});

const AIAssistant = dynamic(() => import('../molecules/AIAssistant'), {
  loading: () => null
});

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
}) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <div className="dashboard-content">
          {children}
        </div>
      </div>
      <AIAssistant />
    </div>
  );
};

export default PageLayout;
