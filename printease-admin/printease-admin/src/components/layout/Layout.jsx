import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import Settings from '../../pages/Settings.jsx';

const pageTitles = {
  dashboard: 'Dashboard',
  pricing: 'Pricing',
  transactions: 'Transactions',
  printers: 'Printer Management',
  users: 'Users',
  reports: 'Reports',
  settings: 'Settings',
};

/**
 * Shared shell for every page: fixed sidebar + top app bar + scrollable content area.
 */
export default function Layout({ 
  activePage, 
  onNavigate, 
  admin, 
  onLogout, 
  searchQuery, 
  setSearchQuery, 
  children 
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar
        activePage={activePage}
        onNavigate={(key) => {
          onNavigate(key);
          setMobileOpen(false);
        }}
        variant="permanent"
        onLogout={onLogout}
      />
      <Sidebar
        activePage={activePage}
        onNavigate={(key) => {
          onNavigate(key);
          setMobileOpen(false);
        }}
        variant="temporary"
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={onLogout}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
        }}
      >
        <TopBar
          admin={admin}
          pageTitle={pageTitles[activePage] ?? ''}
          onMenuClick={() => setMobileOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>{children}</Box>
      </Box>
    </Box>
  );
}