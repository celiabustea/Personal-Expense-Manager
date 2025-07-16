import React, { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import '../styles/layouts/Layout.css';
import Icon from '../components/atoms/Icons/Icon';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="layout-container">
      <button className="mobile-menu-button" onClick={toggleMobileMenu}>
        <Icon name={isMobileMenuOpen ? 'close' : 'menu'} />
      </button>

      <aside className={`sidebar ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Expense Tracker</h1>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-link">
            <Icon name="dashboard" />
            <span>Dashboard</span>
          </Link>
          <Link href="/transactions" className="sidebar-link">
            <Icon name="money" />
            <span>Transactions</span>
          </Link>
          <Link href="/budgets" className="sidebar-link">
            <Icon name="budget" />
            <span>Budgets</span>
          </Link>
          <Link href="/reports" className="sidebar-link">
            <Icon name="chart" />
            <span>Reports</span>
          </Link>
          <button className="sidebar-link logout-button" onClick={handleLogout}>
            <Icon name="logout" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
