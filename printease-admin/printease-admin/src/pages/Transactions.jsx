import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Stack,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import SectionCard from '../components/common/SectionCard.jsx';
import DataTable from '../components/common/DataTable.jsx';
import StatusChip from '../components/common/StatusChip.jsx';
import api from '../services/api';

const filters = ['Today', 'This Week', 'This Month', 'All Time'];

export default function Transactions({ searchQuery = '' }) {
  const [activeFilter, setActiveFilter] = useState('Today');
  const [transactionsData, setTransactionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');

      const formatted = (res.data || []).map((item) => ({
        id: item.id || item._id,
        student: item.student_name || item.student || 'Unknown Student',
        file: item.file_name || item.file || 'Document',
        pages: item.pages || 0,
        copies: item.copies || 1,
        rawAmount: item.amount || item.total_price || 0,
        amount: `₹${item.amount || item.total_price || 0}`,
        paymentStatus: item.payment_status || item.paymentStatus || 'Pending',
        printStatus: item.print_status || item.printStatus || 'Pending',
        time: item.created_at ? new Date(item.created_at).toLocaleString() : item.time || 'N/A',
        rawDate: item.created_at ? new Date(item.created_at) : new Date(),
      }));

      setTransactionsData(formatted);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      { key: 'student', label: 'Student' },
      { key: 'file', label: 'File' },
      { key: 'pages', label: 'Pages', align: 'right' },
      { key: 'copies', label: 'Copies', align: 'right' },
      { key: 'amount', label: 'Amount', align: 'right' },
      { key: 'paymentStatus', label: 'Payment Status', render: (row) => <StatusChip label={row.paymentStatus} /> },
      { key: 'printStatus', label: 'Print Status', render: (row) => <StatusChip label={row.printStatus} /> },
      { key: 'time', label: 'Time' },
      {
        key: 'actions',
        label: 'Actions',
        align: 'right',
        render: (row) => (
          <IconButton size="small" onClick={() => setSelectedTx(row)} sx={{ color: 'primary.main' }}>
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    []
  );

  // Filter transactions by Search Query & Date logic
  const filteredRows = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return transactionsData.filter((row) => {
      const matchesSearch =
        !query ||
        row.student.toLowerCase().includes(query) ||
        row.file.toLowerCase().includes(query) ||
        row.amount.toLowerCase().includes(query) ||
        row.paymentStatus.toLowerCase().includes(query) ||
        row.printStatus.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (activeFilter === 'All Time') return true;

      const now = new Date();
      const rowDate = new Date(row.rawDate);

      if (activeFilter === 'Today') {
        return rowDate.toDateString() === now.toDateString();
      }

      if (activeFilter === 'This Week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return rowDate >= sevenDaysAgo;
      }

      if (activeFilter === 'This Month') {
        return rowDate.getMonth() === now.getMonth() && rowDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  }, [transactionsData, searchQuery, activeFilter]);

  const exportCSV = () => {
    if (!filteredRows.length) return;

    const headers = 'ID,Student,File,Pages,Copies,Amount,Payment Status,Print Status,Time\n';
    const csvRows = filteredRows
      .map(
        (r) =>
          `"${r.id}","${r.student}","${r.file}",${r.pages},${r.copies},"${r.rawAmount}","${r.paymentStatus}","${r.printStatus}","${r.time}"`
      )
      .join('\n');

    const blob = new Blob([headers + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${activeFilter.toLowerCase().replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <SectionCard
        title="Transactions"
        subtitle="All student print payments and their status"
        action={
          <Button variant="outlined" startIcon={<FileDownloadRoundedIcon />} onClick={exportCSV}>
            Export CSV
          </Button>
        }
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
          {filters.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              onClick={() => setActiveFilter(filter)}
              sx={{
                fontWeight: 700,
                color: activeFilter === filter ? '#fff' : 'text.secondary',
                bgcolor: activeFilter === filter ? 'primary.main' : '#F5F7FB',
                '&:hover': {
                  bgcolor: activeFilter === filter ? 'primary.dark' : '#EDEFF5',
                },
              }}
            />
          ))}
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <DataTable columns={columns} rows={filteredRows} />
        )}
      </SectionCard>

      {/* Transaction Detail Dialog */}
      <Dialog open={Boolean(selectedTx)} onClose={() => setSelectedTx(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Transaction Details</DialogTitle>
        <DialogContent dividers>
          {selectedTx && (
            <Stack spacing={1.5}>
              <Typography variant="body2"><strong>Student:</strong> {selectedTx.student}</Typography>
              <Typography variant="body2"><strong>File:</strong> {selectedTx.file}</Typography>
              <Typography variant="body2"><strong>Pages / Copies:</strong> {selectedTx.pages} pages, {selectedTx.copies} copy(ies)</Typography>
              <Typography variant="body2"><strong>Amount Paid:</strong> {selectedTx.amount}</Typography>
              <Typography variant="body2"><strong>Payment Status:</strong> {selectedTx.paymentStatus}</Typography>
              <Typography variant="body2"><strong>Print Status:</strong> {selectedTx.printStatus}</Typography>
              <Typography variant="body2"><strong>Date & Time:</strong> {selectedTx.time}</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTx(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}