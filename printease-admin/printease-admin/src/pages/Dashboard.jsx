import React, { useState, useEffect } from 'react'; 
import { Box, Grid, Typography, Stack, CircularProgress } from '@mui/material'; 
import { BarChart } from '@mui/x-charts/BarChart'; 
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded'; 

import StatCard from '../components/common/StatCard.jsx'; 
import SectionCard from '../components/common/SectionCard.jsx'; 
import DataTable from '../components/common/DataTable.jsx'; 
import StatusChip from '../components/common/StatusChip.jsx'; 
import api from "../services/api"; 
import { adminUser, quickPricingPreview } from '../data/mockData.js'; 

const jobColumns = [ 
  { key: 'student', label: 'Student' }, 
  { key: 'file', label: 'File' }, 
  { key: 'pages', label: 'Pages', align: 'right' }, 
  { key: 'amount', label: 'Amount', align: 'right' }, 
  { key: 'status', label: 'Status', render: (row) => <StatusChip label={row.status} /> }, 
  { key: 'time', label: 'Time', align: 'right' }, 
]; 

export default function Dashboard() { 
  const [dashboardData, setDashboardData] = useState(null); 
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [dashRes, printersRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/printers")
      ]);
      
      setDashboardData(dashRes.data);
      setPrinters(printersRes.data || []);
    } catch (err) {
      console.error("API ERROR =>", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchDashboard(); 
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []); 

  // Handle key fallbacks (snake_case vs camelCase)
  const todayRevenue = dashboardData?.todayRevenue ?? dashboardData?.today_revenue ?? 0;
  const todayJobs = dashboardData?.todayJobs ?? dashboardData?.today_jobs ?? 0;
  const successRate = dashboardData?.successRate ?? dashboardData?.success_rate ?? 0;
  const activePrintersCount = dashboardData?.activePrinters ?? dashboardData?.active_printers ?? printers.filter(p => p.status === 'Online').length;
  const revenueChart = dashboardData?.revenueLast7Days ?? dashboardData?.revenue_last_7_days ?? [];
  const recentJobsList = dashboardData?.recentJobs ?? dashboardData?.recent_jobs ?? [];

  if (loading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return ( 
    <Box> 
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}> 
        Welcome Admin  
      </Typography> 
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}> 
        Here's what's happening with {adminUser?.name?.split(' ')[0] || 'Admin'}'s print center today. 
      </Typography> 

      {/* Statistic cards */} 
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} lg={3}> 
          <StatCard 
            title="Today's Revenue" 
            value={`₹${todayRevenue}`} 
            icon="money" 
          /> 
        </Grid> 

        <Grid item xs={12} sm={6} lg={3}> 
          <StatCard 
            title="Today's Jobs" 
            value={todayJobs} 
            icon="print" 
          /> 
        </Grid> 

        <Grid item xs={12} sm={6} lg={3}> 
          <StatCard 
            title="Success Rate" 
            value={`${Math.round(successRate)}%`} 
            icon="check" 
          /> 
        </Grid> 

        <Grid item xs={12} sm={6} lg={3}> 
          <StatCard 
            title="Active Printers" 
            value={activePrintersCount} 
            icon="printer" 
          /> 
        </Grid> 
      </Grid> 

      {/* Charts & Printer status */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}> 
        <Grid item xs={12} lg={8}> 
          <SectionCard title="Revenue — Last 7 Days" subtitle="Total earnings collected per day" sx={{ height: '100%' }}> 
            <BarChart 
              height={300} 
              dataset={revenueChart} 
              xAxis={[{ scaleType: 'band', dataKey: 'day' }]} 
              series={[{ dataKey: 'revenue', label: 'Revenue (₹)', color: '#283593' }]} 
              borderRadius={8} 
              margin={{ left: 50, right: 20, top: 20, bottom: 30 }} 
            /> 
          </SectionCard> 
        </Grid> 

        <Grid item xs={12} lg={4}> 
          <SectionCard title="Printer Status" subtitle="Live status of connected printers" sx={{ height: '100%' }}> 
            <Stack spacing={1.5}> 
              {printers.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No active printers found.
                </Typography>
              ) : (
                printers.map((printer) => {
                  const isOnline = printer.status === 'Online';
                  return (
                    <Box 
                      key={printer.id} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        px: 2, 
                        py: 1.5, 
                        borderRadius: 3, 
                        bgcolor: '#FAFBFE', 
                        border: '1px solid #EDEFF5', 
                      }} 
                    > 
                      <Box> 
                        <Typography variant="body2" sx={{ fontWeight: 700 }}> 
                          {printer.name} 
                        </Typography> 
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}> 
                          {printer.location || 'Location Not Set'} 
                        </Typography> 
                      </Box> 
                      <Stack direction="row" alignItems="center" spacing={0.75}> 
                        <FiberManualRecordRoundedIcon 
                          sx={{ fontSize: 12, color: isOnline ? 'success.main' : 'error.main' }} 
                        /> 
                        <Typography 
                          variant="caption" 
                          sx={{ fontWeight: 700, color: isOnline ? 'success.main' : 'error.main' }} 
                        > 
                          {printer.status} 
                        </Typography> 
                      </Stack> 
                    </Box> 
                  );
                })
              )} 
            </Stack> 
          </SectionCard> 
        </Grid> 
      </Grid> 

      {/* Jobs table & Pricing */}
      <Grid container spacing={2.5}> 
        <Grid item xs={12} lg={8}> 
          <SectionCard title="Recent Jobs" subtitle="Latest print requests from students"> 
            <DataTable
              columns={jobColumns}
              rows={recentJobsList}
            /> 
          </SectionCard> 
        </Grid> 

        <Grid item xs={12} lg={4}> 
          <SectionCard title="Quick Pricing Preview" subtitle="Current per-page rates" sx={{ height: '100%' }}> 
            <Stack spacing={1.25}> 
              {quickPricingPreview.map((item) => ( 
                <Box 
                  key={item.label} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    px: 2, 
                    py: 1.4, 
                    borderRadius: 3, 
                    bgcolor: '#FAFBFE', 
                    border: '1px solid #EDEFF5', 
                  }} 
                > 
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}> 
                    {item.label} 
                  </Typography> 
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}> 
                    {item.price} 
                  </Typography> 
                </Box> 
              ))} 
            </Stack> 
          </SectionCard> 
        </Grid> 
      </Grid> 
    </Box> 
  ); 
}