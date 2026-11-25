import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Stack,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import SectionCard from '../components/common/SectionCard.jsx';
import api from '../services/api';

const DEFAULT_SETTINGS = {
  college_name: '',
  college_email: '',
  college_phone: '',
  default_printer: '',
  auto_print: false,
  pin_expiry: 60,
  pin_length: 4,
  notification_email: true,
  notification_browser: true,
  theme: 'light',
};

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [printers, setPrinters] = useState([]);
  
  // Data State
  const [initialForm, setInitialForm] = useState(DEFAULT_SETTINGS);
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [errors, setErrors] = useState({});

  // UI Control State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [settingsRes, printersRes] = await Promise.all([
        api.get('/settings').catch(() => ({ data: null })),
        api.get('/printers').catch(() => ({ data: [] })),
      ]);

      if (settingsRes.data) {
        const loadedData = { ...DEFAULT_SETTINGS, ...settingsRes.data };
        setForm(loadedData);
        setInitialForm(loadedData);
      }
      setPrinters(printersRes.data || []);
    } catch (err) {
      console.error('Failed to load settings data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Track if changes were made
  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.college_name.trim()) errs.college_name = 'College name is required';
    if (!form.college_email.trim() || !/\S+@\S+\.\S+/.test(form.college_email)) {
      errs.college_email = 'Valid email is required';
    }
    if (form.college_phone && !/^\d{10}$/.test(form.college_phone)) {
      errs.college_phone = 'Phone number must be exactly 10 digits';
    }
    if (![4, 6].includes(Number(form.pin_length))) {
      errs.pin_length = 'PIN length must be either 4 or 6';
    }
    if (form.pin_expiry < 1 || form.pin_expiry > 1440) {
      errs.pin_expiry = 'Expiry must be between 1 and 1440 minutes';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePreSave = (e) => {
    e.preventDefault();
    if (validate()) {
      setConfirmOpen(true);
    }
  };

  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      await api.put('/settings', form);
      setInitialForm(form);
      showToast('Settings saved successfully.', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast(err.response?.data?.message || 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
  };

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handlePreSave} sx={{ maxWidth: 800, mx: 'auto', pb: 4 }}>
      <Stack spacing={3}>
        {/* System Information Card */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #E0E0E0', bgcolor: '#FAF9F6' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
            System Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Backend Status</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Chip icon={<CheckCircleOutlineRoundedIcon />} label="Online" color="success" size="small" variant="outlined" />
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Database</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Chip icon={<CheckCircleOutlineRoundedIcon />} label="Connected" color="success" size="small" variant="outlined" />
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Printer Service</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Chip icon={<CheckCircleOutlineRoundedIcon />} label="Running" color="success" size="small" variant="outlined" />
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">App Version</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>v1.0.0</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* General Settings */}
        <SectionCard title="General" subtitle="Basic college identification and contact details">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="College Name"
                fullWidth
                size="small"
                value={form.college_name}
                onChange={(e) => handleChange('college_name', e.target.value)}
                error={Boolean(errors.college_name)}
                helperText={errors.college_name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="College Email"
                type="email"
                fullWidth
                size="small"
                value={form.college_email}
                onChange={(e) => handleChange('college_email', e.target.value)}
                error={Boolean(errors.college_email)}
                helperText={errors.college_email}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone (10 Digits)"
                fullWidth
                size="small"
                value={form.college_phone}
                onChange={(e) => handleChange('college_phone', e.target.value)}
                error={Boolean(errors.college_phone)}
                helperText={errors.college_phone}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Printer Configuration */}
        <SectionCard title="Printer" subtitle="Configure printing hardware defaults and automation">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth size="small">
                <InputLabel>Default Printer</InputLabel>
                <Select
                  value={form.default_printer || ''}
                  label="Default Printer"
                  onChange={(e) => handleChange('default_printer', e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {printers.map((printer) => (
                    <MenuItem key={printer.id} value={printer.id}>
                      {printer.name || `Printer #${printer.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(form.auto_print)}
                    onChange={(e) => handleChange('auto_print', e.target.checked)}
                    color="primary"
                  />
                }
                label="Auto Print"
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Security Settings */}
        <SectionCard title="Security" subtitle="Control passcodes and authorization timeouts">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="PIN Expiry (Minutes)"
                type="number"
                fullWidth
                size="small"
                value={form.pin_expiry}
                onChange={(e) => handleChange('pin_expiry', Number(e.target.value))}
                error={Boolean(errors.pin_expiry)}
                helperText={errors.pin_expiry || 'Between 1 and 1440 minutes'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="PIN Length"
                type="number"
                fullWidth
                size="small"
                value={form.pin_length}
                onChange={(e) => handleChange('pin_length', Number(e.target.value))}
                error={Boolean(errors.pin_length)}
                helperText={errors.pin_length || 'Allowed: 4 or 6 digits'}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Notification & Theme Settings */}
        <SectionCard title="Preferences" subtitle="Notification preferences and visual theme">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(form.notification_email)}
                      onChange={(e) => handleChange('notification_email', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(form.notification_browser)}
                      onChange={(e) => handleChange('notification_browser', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Browser Push Notifications"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Theme Mode</InputLabel>
                <Select
                  value={form.theme}
                  label="Theme Mode"
                  onChange={(e) => handleChange('theme', e.target.value)}
                >
                  <MenuItem value="light">Light Mode</MenuItem>
                  <MenuItem value="dark">Dark Mode</MenuItem>
                  <MenuItem value="system">System Default</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </SectionCard>

        {/* Form Action Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<RestartAltRoundedIcon />}
            onClick={handleReset}
            disabled={!isDirty || saving}
            sx={{ px: 3, borderRadius: 2.5 }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveRoundedIcon />}
            disabled={!isDirty || saving}
            sx={{ px: 4, py: 1.25, borderRadius: 2.5, fontWeight: 700 }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', pt: 3, borderTop: '1px dashed #E0E0E0' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            PrintEase Admin Panel — Version 1.0.0
          </Typography>
        </Box>
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Save Settings?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to save these settings? The updated configuration will take effect immediately.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmSave} variant="contained" autoFocus>
            Confirm & Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}