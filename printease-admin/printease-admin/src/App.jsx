import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pricing from './pages/Pricing.jsx';
import Transactions from './pages/Transactions.jsx';
import Printers from './pages/Printers.jsx';
import Users from './pages/Users.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx'; // 1. Import Settings component
import AdminAuth from './pages/AdminAuth.jsx';

const pages = {
  dashboard: Dashboard,
  pricing: Pricing,
  transactions: Transactions,
  printers: Printers,
  users: Users,
  reports: Reports,
  settings: Settings, // 2. Add settings key here
};

export default function App() {
  const [admin, setAdmin] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Check if admin is logged in on app load
  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin_user');
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    setAdmin(null);
  };

  const handleNavigate = (pageKey) => {
    setSearchQuery('');
    setActivePage(pageKey);
  };

  // If not logged in, show Admin Login / Register Page
  if (!admin) {
    return <AdminAuth onLoginSuccess={(user) => setAdmin(user)} />;
  }

  const ActivePageComponent = pages[activePage] ?? Dashboard;

  return (
    <Layout 
      activePage={activePage} 
      onNavigate={handleNavigate} 
      admin={admin} 
      onLogout={handleLogout}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <ActivePageComponent searchQuery={searchQuery} />
    </Layout>
  );
}