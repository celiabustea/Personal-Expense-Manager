import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useDarkMode } from '../../../contexts/DarkModeContext';

// Dynamic imports for heavy components
const Icon = dynamic(() => import('../../atoms/Icons'), {
  loading: () => <span style={{ width: '20px', height: '20px', display: 'inline-block' }} />
});

const Heading = dynamic(() => import('../../atoms/Headings'), {
  loading: () => <span />
});

// Only allow valid icon names
export type IconName = 'menu' | 'dashboard' | 'money' | 'budget' | 'chart' | 'delete' | 'add' | 'close' | 'logout' | 'settings' | 'ai';

interface SidebarLinkProps {
  to: string;
  icon: IconName;
  children: React.ReactNode;
  isActive: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, children, isActive }) => (
  <Link href={to} legacyBehavior>
    <a className={`sidebar-link ${isActive ? 'active' : ''}`}>
      <Icon name={icon} />
      <span>{children}</span>
    </a>
  </Link>
);

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { resetDarkMode } = useDarkMode();

  const menuItems: { path: string; label: string; icon: IconName }[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/transactions', label: 'Transactions', icon: 'money' },
    { path: '/budgets', label: 'Budgets', icon: 'budget' },
    { path: '/reports', label: 'Reports', icon: 'chart' },
  ];

  const handleLogout = () => {
    // Reset dark mode using context
    resetDarkMode();
    router.push('/');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 style={{
          color: '#FFFFFF',
          fontSize: '32px',
          fontWeight: '800',
          margin: '0 0 8px 0',
          textAlign: 'center',
          letterSpacing: '-0.5px',
          lineHeight: '1.2'
        }}>
          Personal Finance
        </h1>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          fontSize: '16px', 
          margin: '0',
          fontWeight: '500',
          textAlign: 'center',
          letterSpacing: '0.5px'
        }}>
          Expense Tracker
        </p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <SidebarLink
            key={item.path}
            to={item.path}
            icon={item.icon}
            isActive={router.pathname === item.path}
          >
            {item.label}
          </SidebarLink>
        ))}
        
        <div className="sidebar-divider" style={{ 
          height: '1px', 
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          margin: '16px 0' 
        }} />
        
        <div className="sidebar-bottom-section">
          <div className="sidebar-link" onClick={handleSettings} style={{ cursor: 'pointer' }}>
            <Icon name="settings" />
            <span>Settings</span>
          </div>
          
          <div className="sidebar-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <Icon name="logout" />
            <span>Logout</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
