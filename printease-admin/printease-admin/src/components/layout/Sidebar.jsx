import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';

export const DRAWER_WIDTH = 260;

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardRoundedIcon /> },
  { key: 'pricing', label: 'Pricing', icon: <SellRoundedIcon /> },
  { key: 'transactions', label: 'Transactions', icon: <ReceiptLongRoundedIcon /> },
  { key: 'printers', label: 'Printers', icon: <PrintRoundedIcon /> },
  { key: 'users', label: 'Users', icon: <PeopleAltRoundedIcon /> },
  { key: 'reports', label: 'Reports', icon: <BarChartRoundedIcon /> },
  { key: 'settings', label: 'Settings', icon: <SettingsRoundedIcon /> },
];

/**
 * Fixed left navigation sidebar.
 * `activePage` / `onNavigate` let the parent control which page is shown
 * without introducing any routing library (UI-only requirement).
 */
export default function Sidebar({ activePage, onNavigate, mobileOpen, onClose, variant = 'permanent', onLogout }) {
  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 3, py: 3 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0px 4px 10px rgba(40, 53, 147, 0.35)',
          }}
        >
          <LocalPrintshopRoundedIcon fontSize="small" />
        </Box>
        <Box sx={{ lineHeight: 1.1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
            PrintEase
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Admin Panel
          </Typography>
        </Box>
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const selected = activePage === item.key;
          return (
            <ListItemButton
              key={item.key}
              selected={selected}
              onClick={() => onNavigate(item.key)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1.1,
                color: selected ? 'primary.main' : 'text.secondary',
                bgcolor: selected ? 'rgba(40, 53, 147, 0.08)' : 'transparent',
                '&:hover': {
                  bgcolor: selected ? 'rgba(40, 53, 147, 0.12)' : 'rgba(20, 26, 62, 0.04)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(40, 53, 147, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: selected ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: selected ? 700 : 500, fontSize: 14 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={onLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.06)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: 'error.main' }}>
            <LogoutRoundedIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  if (variant === 'temporary') {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid #EDEFF5',
        },
      }}
    >
      {content}
    </Drawer>
  );
}