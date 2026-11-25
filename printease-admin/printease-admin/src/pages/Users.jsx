import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import SectionCard from '../components/common/SectionCard.jsx';
import DataTable from '../components/common/DataTable.jsx';
import StatusChip from '../components/common/StatusChip.jsx';
import api from '../services/api';

export default function Users({ searchQuery = '' }) {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');

      const formatted = (res.data || []).map((user) => ({
        id: user.id || user._id,
        name: user.name || 'N/A',
        email: user.email || 'N/A',
        admissionNo: user.collegeid || user.college_id || 'N/A',
        department: user.department || 'N/A',
        phone: user.phone || 'N/A',
        status: user.status || (user.is_active === false ? 'Disabled' : 'Active'),
      }));

      setUsersData(formatted);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (user) => {
    if (window.confirm(`Reset password for ${user.name}?`)) {
      try {
        await api.post(`/users/${user.id}/reset-password`);
        alert(`Password reset link/temporary key sent to ${user.name}`);
      } catch (err) {
        console.error(err);
        alert('Failed to reset password');
      }
    }
  };

  const handleToggleUserStatus = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Disabled' : 'Active';
    if (window.confirm(`Are you sure you want to change ${user.name}'s status to ${nextStatus}?`)) {
      try {
        await api.put(`/users/${user.id}/status`, { status: nextStatus });
        setUsersData((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
      } catch (err) {
        console.error(err);
        alert('Failed to update user status');
      }
    }
  };

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Student Name' },
      { key: 'admissionNo', label: 'Admission Number' },
      { key: 'department', label: 'Department' },
      { key: 'phone', label: 'Phone' },
      { key: 'status', label: 'Status', render: (row) => <StatusChip label={row.status} /> },
      {
        key: 'actions',
        label: 'Actions',
        align: 'right',
        render: (row) => (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title="View Details">
              <IconButton size="small" onClick={() => setSelectedUser(row)} sx={{ color: 'text.secondary' }}>
                <VisibilityRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset Password">
              <IconButton size="small" onClick={() => handleResetPassword(row)} sx={{ color: 'info.main' }}>
                <LockResetRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={row.status === 'Active' ? 'Disable Account' : 'Enable Account'}>
              <IconButton
                size="small"
                onClick={() => handleToggleUserStatus(row)}
                sx={{ color: row.status === 'Active' ? 'error.main' : 'success.main' }}
              >
                {row.status === 'Active' ? (
                  <BlockRoundedIcon fontSize="small" />
                ) : (
                  <CheckCircleOutlineRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [usersData]
  );

  const filteredUsers = useMemo(() => {
    const rawQuery = searchQuery.toLowerCase().trim();
    if (!rawQuery) return usersData;

    const query = rawQuery.replace(/\s+/g, '');

    return usersData.filter((user) => {
      const name = user.name.toLowerCase().replace(/\s+/g, '');
      const admissionNo = user.admissionNo.toLowerCase().replace(/\s+/g, '');
      const department = user.department.toLowerCase().replace(/\s+/g, '');
      const phone = user.phone.toLowerCase().replace(/\s+/g, '');

      return (
        name.includes(query) ||
        admissionNo.includes(query) ||
        department.includes(query) ||
        phone.includes(query)
      );
    });
  }, [usersData, searchQuery]);

  return (
    <Box>
      <SectionCard
        title="Users"
        subtitle="Students registered on the self-service print system"
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <DataTable columns={columns} rows={filteredUsers} />
        )}
      </SectionCard>

      {/* View User Modal */}
      <Dialog open={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Student Profile</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Stack spacing={1.5}>
              <Typography variant="body2"><strong>Name:</strong> {selectedUser.name}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography variant="body2"><strong>Admission No:</strong> {selectedUser.admissionNo}</Typography>
              <Typography variant="body2"><strong>Department:</strong> {selectedUser.department}</Typography>
              <Typography variant="body2"><strong>Phone:</strong> {selectedUser.phone}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {selectedUser.status}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}