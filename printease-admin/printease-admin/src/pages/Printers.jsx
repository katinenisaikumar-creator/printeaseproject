import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, Typography, Stack, Button, Divider, CircularProgress } from '@mui/material';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import api from '../services/api';

const statusColors = {
  Online: { fg: '#2E7D32', bg: '#E8F5E9' },
  Busy: { fg: '#ED6C02', bg: '#FFF4E5' },
  Paused: { fg: '#ED6C02', bg: '#FFF4E5' },
  Offline: { fg: '#D32F2F', bg: '#FDECEA' },
};

export default function Printers() {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch live printers from PostgreSQL API (fixed endpoint)
  const fetchPrinters = async () => {
    try {
      const res = await api.get('/printers');
      setPrinters(res.data);
    } catch (err) {
      console.error('Failed to fetch printer status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
    const interval = setInterval(fetchPrinters, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (printerId, action) => {
    try {
      await api.post(`/printers/${printerId}/action`, { action });
      fetchPrinters();
    } catch (err) {
      console.error(`Failed to ${action} printer:`, err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Box>
      {printers.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">No Active Printers Registered</Typography>
          <Typography variant="body2" color="text.secondary">
            Open the printer kiosk app to automatically register printers.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {printers.map((printer) => {
            const colors = statusColors[printer.status] ?? statusColors.Offline;
            return (
              <Grid item xs={12} sm={6} lg={4} key={printer.id}>
                <Card sx={{ p: 2.75, height: '100%', borderRadius: 3 }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: '14px',
                          bgcolor: '#E8EAF6',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <LocalPrintshopRoundedIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {printer.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {printer.location || 'Location Not Set'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.6}
                      sx={{ px: 1.25, py: 0.5, borderRadius: 2, bgcolor: colors.bg }}
                    >
                      <FiberManualRecordRoundedIcon sx={{ fontSize: 10, color: colors.fg }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: colors.fg }}>
                        {printer.status}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ my: 2.25 }} />

                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Jobs in queue
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {printer.queue_count ?? 0}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.25 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Paper Level
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: printer.paper_level < 20 ? 'error.main' : 'text.primary',
                      }}
                    >
                      {printer.paper_level ?? 100}%
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<PauseRoundedIcon fontSize="small" />}
                      onClick={() => handleAction(printer.id, 'pause')}
                    >
                      Pause
                    </Button>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<PlayArrowRoundedIcon fontSize="small" />}
                      onClick={() => handleAction(printer.id, 'resume')}
                    >
                      Resume
                    </Button>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<RestartAltRoundedIcon fontSize="small" />}
                      onClick={() => handleAction(printer.id, 'restart')}
                    >
                      Restart
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}