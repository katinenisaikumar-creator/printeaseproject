import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, Typography, Stack, Button, CircularProgress } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

import SectionCard from '../components/common/SectionCard.jsx';
import api from '../services/api';

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Gracefully handle both camelCase and snake_case API responses
  const dailyRevenue = reportData?.dailyRevenue ?? reportData?.daily_revenue ?? 0;
  const weeklyRevenue = reportData?.weeklyRevenue ?? reportData?.weekly_revenue ?? 0;
  const monthlyRevenue = reportData?.monthlyRevenue ?? reportData?.monthly_revenue ?? 0;
  const totalJobs = reportData?.totalJobs ?? reportData?.total_jobs ?? 0;
  const completedJobs = reportData?.completedJobs ?? reportData?.completed_jobs ?? 0;
  const cancelledJobs = reportData?.cancelledJobs ?? reportData?.cancelled_jobs ?? 0;

  const reportStats = [
    { id: '1', title: 'Daily Revenue', value: `₹${Number(dailyRevenue).toLocaleString()}` },
    { id: '2', title: 'Weekly Revenue', value: `₹${Number(weeklyRevenue).toLocaleString()}` },
    { id: '3', title: 'Monthly Revenue', value: `₹${Number(monthlyRevenue).toLocaleString()}` },
    { id: '4', title: 'Total Jobs', value: Number(totalJobs).toLocaleString() },
    { id: '5', title: 'Completed Jobs', value: Number(completedJobs).toLocaleString() },
    { id: '6', title: 'Cancelled Jobs', value: Number(cancelledJobs).toLocaleString() },
  ];

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Daily Revenue,${dailyRevenue}\n` +
      `Weekly Revenue,${weeklyRevenue}\n` +
      `Monthly Revenue,${monthlyRevenue}\n` +
      `Total Jobs,${totalJobs}\n` +
      `Completed Jobs,${completedJobs}\n` +
      `Cancelled Jobs,${cancelledJobs}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `printease_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {reportStats.map((stat) => (
          <Grid item xs={12} sm={6} lg={4} key={stat.id}>
            <Card sx={{ p: 2.75, height: '100%' }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.75 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    bgcolor: '#E8EAF6',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpRoundedIcon fontSize="small" />
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <SectionCard
        title="Export Reports"
        subtitle="Download a summary of revenue and job activity for record-keeping"
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfRoundedIcon />}
            size="large"
            onClick={handleExportPDF}
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon />}
            size="large"
            onClick={handleExportCSV}
          >
            Download CSV
          </Button>
        </Stack>
      </SectionCard>
    </Box>
  );
}