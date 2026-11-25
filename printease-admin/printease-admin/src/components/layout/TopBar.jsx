import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  InputBase,
  IconButton,
  Badge,
  Avatar,
  Typography,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { DRAWER_WIDTH } from './Sidebar.jsx';
import api from '../../services/api';

export default function TopBar({ admin, pageTitle, onMenuClick, searchQuery, setSearchQuery }) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Always generates exactly 2 initial letters from the full name
  const getInitials = () => {
    if (!admin?.name) return 'A';

    const words = admin.name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    // Takes 1st letter of 1st word + 1st letter of 2nd word
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  // Fetch notifications and filter out dismissed IDs
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      const dismissedIds = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
      
      // Filter out notifications that were deleted by the admin
      const activeNotifications = res.data.filter(
        (item) => !dismissedIds.includes(item.id)
      );
      
      setNotifications(activeNotifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleDeleteNotification = (e, id) => {
    e.stopPropagation();

    // 1. Save deleted notification ID to localStorage
    const dismissedIds = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    if (!dismissedIds.includes(id)) {
      dismissedIds.push(id);
      localStorage.setItem('dismissed_notifications', JSON.stringify(dismissedIds));
    }

    // 2. Remove immediately from UI state
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid #EDEFF5',
      }}
    >
      <Toolbar sx={{ gap: 2, py: 1 }}>
        {!isMdUp && (
          <IconButton edge="start" onClick={onMenuClick} sx={{ color: 'text.primary' }}>
            <MenuRoundedIcon />
          </IconButton>
        )}

        <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 140 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {pageTitle}
          </Typography>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#F5F7FB',
            borderRadius: 3,
            px: 2,
            py: 0.75,
            maxWidth: 420,
            ml: { xs: 0, sm: 'auto' },
            border: '1px solid #EDEFF5',
          }}
        >
          <SearchRoundedIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
          <InputBase
            placeholder="Search students, files, transactions…"
            fullWidth
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            sx={{ fontSize: 14 }}
          />
        </Box>

        {/* Notification Bell Icon */}
        <IconButton onClick={handleOpenMenu} sx={{ ml: { xs: 'auto', sm: 1 } }}>
          <Badge color="error" variant="dot" invisible={notifications.length === 0}>
            <NotificationsNoneRoundedIcon sx={{ color: 'text.secondary' }} />
          </Badge>
        </IconButton>

        {/* Notifications Dropdown Popover */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{
            elevation: 4,
            style: { width: 400, maxHeight: 420, borderRadius: 12, marginTop: 8 },
          }}
        >
          <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Notifications ({notifications.length})
            </Typography>
          </Box>
          <Divider />

          {notifications.length === 0 ? (
            <MenuItem onClick={handleCloseMenu} sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No new alerts or activity
              </Typography>
            </MenuItem>
          ) : (
            notifications.map((item) => (
              <MenuItem
                key={item.id}
                disableRipple
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1.25,
                  px: 2,
                  borderBottom: '1px solid #F5F7FB',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {item.type === 'alert' ? (
                      <WarningRoundedIcon color="error" fontSize="small" />
                    ) : (
                      <PrintRoundedIcon color="primary" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={`${item.message} • ${item.time}`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary',
                      noWrap: true,
                    }}
                  />
                </Box>

                <Tooltip title="Delete notification">
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteNotification(e, item.id)}
                    sx={{
                      color: 'text.secondary',
                      flexShrink: 0,
                      '&:hover': { color: 'error.main', bgcolor: '#FEE2E2' },
                    }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </MenuItem>
            ))
          )}
        </Menu>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, display: { xs: 'none', sm: 'block' } }} />

        {/* Dynamic Admin Profile Block */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38, fontSize: 14, fontWeight: 700 }}>
            {getInitials()}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {admin?.name || 'Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {admin?.role || 'Super Admin'}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}