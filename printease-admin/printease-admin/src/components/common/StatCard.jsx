import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';

const iconMap = {
  money: CurrencyRupeeRoundedIcon,
  print: PrintRoundedIcon,
  check: CheckCircleRoundedIcon,
  printer: LocalPrintshopRoundedIcon,
};

const colorMap = {
  money: { bg: '#E8EAF6', fg: '#283593' },
  print: { bg: '#E3F2FD', fg: '#0288D1' },
  check: { bg: '#E8F5E9', fg: '#2E7D32' },
  printer: { bg: '#FFF4E5', fg: '#ED6C02' },
};

/**
 * Reusable statistic card used across the dashboard's KPI row.
 */
export default function StatCard({ title, value, icon }) {
  const Icon = iconMap[icon] ?? CurrencyRupeeRoundedIcon;
  const colors = colorMap[icon] ?? colorMap.money;

  return (
    <Card sx={{ p: 2.75, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.75 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '14px',
            bgcolor: colors.bg,
            color: colors.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon fontSize="small" />
        </Box>
      </Box>
    </Card>
  );
}
