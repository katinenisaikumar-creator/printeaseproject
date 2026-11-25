import React from 'react';
import { Chip } from '@mui/material';

// Central status -> color mapping so every table/page renders statuses consistently.
const STATUS_STYLES = {
  Pending: { color: '#ED6C02', bg: '#FFF4E5' },
  Printing: { color: '#0288D1', bg: '#E5F6FD' },
  Completed: { color: '#2E7D32', bg: '#E8F5E9' },
  Failed: { color: '#D32F2F', bg: '#FDECEA' },
  Paid: { color: '#2E7D32', bg: '#E8F5E9' },
  Refunded: { color: '#697386', bg: '#EEF0F5' },
  Active: { color: '#2E7D32', bg: '#E8F5E9' },
  Disabled: { color: '#D32F2F', bg: '#FDECEA' },
  Online: { color: '#2E7D32', bg: '#E8F5E9' },
  Offline: { color: '#D32F2F', bg: '#FDECEA' },
  Busy: { color: '#ED6C02', bg: '#FFF4E5' },
};

export default function StatusChip({ label, size = 'small' }) {
  const style = STATUS_STYLES[label] ?? { color: '#697386', bg: '#EEF0F5' };
  return (
    <Chip
      label={label}
      size={size}
      sx={{
        color: style.color,
        bgcolor: style.bg,
        fontWeight: 700,
        fontSize: 12,
      }}
    />
  );
}
