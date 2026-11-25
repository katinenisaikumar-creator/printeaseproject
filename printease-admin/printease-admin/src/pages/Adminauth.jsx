import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PrintIcon from '@mui/icons-material/Print';
import api from '../services/api';

export default function AdminAuth({ onLoginSuccess }) {
  const [tabIndex, setTabIndex] = useState(0); // 0 = Sign In, 1 = Create Account
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (tabIndex === 1) {
        // Register Admin
        await api.post('/admin/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        setSuccessMsg('Account created successfully! Please sign in.');
        setTimeout(() => {
          setTabIndex(0);
          setSuccessMsg('');
        }, 1500);
      } else {
        // Login Admin
        const res = await api.post('/admin/login', {
          email: formData.email,
          password: formData.password,
        });

        const adminData = res.data.admin;
        localStorage.setItem('admin_user', JSON.stringify(adminData));
        onLoginSuccess(adminData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F4F6F8',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                p: 1.5,
                borderRadius: 3,
                mb: 1,
                display: 'flex',
              }}
            >
              <PrintIcon fontSize="large" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              PrintEase Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Management Portal
            </Typography>
          </Box>

          <Tabs
            value={tabIndex}
            onChange={(e, newIndex) => {
              setTabIndex(newIndex);
              setError('');
              setSuccessMsg('');
            }}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Sign In" />
            <Tab label="Create Account" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {successMsg && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {tabIndex === 1 && (
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                margin="normal"
                size="small"
              />
            )}

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              size="small"
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, py: 1.2, borderRadius: 2, fontWeight: 700 }}
            >
              {loading ? 'Processing...' : tabIndex === 0 ? 'Sign In' : 'Create Admin Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}