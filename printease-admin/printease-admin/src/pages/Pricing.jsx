import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Grid,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Typography,
  Divider,
  Stack,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';

import SectionCard from '../components/common/SectionCard.jsx';
import DataTable from '../components/common/DataTable.jsx';
import api from "../services/api";

export default function Pricing() {
  const [pricingRows, setPricingRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingPrice, setEditingPrice] = useState("");
  const [pages, setPages] = useState(10);
  const [copies, setCopies] = useState(1);
  const [mode, setMode] = useState('B&W');
  const [paperSize, setPaperSize] = useState('A4');

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const res = await api.get("/pricing");

      const formattedData = (res.data || []).map((item) => ({
        id: item.id,
        paperSize: item.paper_size,
        colorMode: item.color_mode,
        printSide: item.print_side,
        price: `₹${item.price_per_page}`,
        price_per_page: Number(item.price_per_page),
      }));

      setPricingRows(formattedData);
    } catch (err) {
      console.error("Failed to fetch pricing data:", err);
    }
  };

  const editPrice = (row) => {
    setEditingId(row.id);
    setEditingPrice(row.price_per_page);
  };

  const savePrice = async () => {
    if (!editingId) return;
    try {
      await api.put(`/pricing/${editingId}`, {
        price_per_page: Number(editingPrice),
      });

      setEditingId(null);
      setEditingPrice("");
      loadPricing();
    } catch (err) {
      console.error(err);
      alert("Update Failed");
    }
  };

  // Re-memoize when pricingRows changes to ensure editPrice reference stays current
  const pricingColumns = useMemo(
    () => [
      { key: 'paperSize', label: 'Paper Size' },
      { key: 'colorMode', label: 'Color Mode' },
      { key: 'printSide', label: 'Print Side' },
      { key: 'price', label: 'Price / Page', align: 'right' },
      {
        key: 'action',
        label: 'Action',
        align: 'right',
        render: (row) => (
          <IconButton
            size="small"
            onClick={() => editPrice(row)}
            sx={{ color: 'primary.main' }}
          >
            <EditRoundedIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    [pricingRows]
  );

  // Replace your total useMemo block in Pricing.jsx with this:
const total = useMemo(() => {
  const normalize = (str) =>
    (str || '')
      .toUpperCase()
      .replace(/COLOUR/g, 'COLOR') // Handle UK vs US spelling
      .replace(/[^A-Z0-9]/g, '');  // Strip out spaces, &, -, etc.

  const matchedRate = pricingRows.find(
    (item) =>
      normalize(item.paperSize) === normalize(paperSize) &&
      normalize(item.colorMode) === normalize(mode)
  );

  const rate = matchedRate ? matchedRate.price_per_page : 0;
  const safePages = Number(pages) || 0;
  const safeCopies = Number(copies) || 0;
  return rate * safePages * safeCopies;
}, [pages, copies, mode, paperSize, pricingRows]);

  return (
    <Box>
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <SectionCard
            title="Pricing Table"
            subtitle="Manage per-page rates for every paper size and mode"
          >
            {editingId && (
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Price Per Page"
                  type="number"
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(e.target.value)}
                />
                <Button variant="contained" onClick={savePrice}>
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    setEditingId(null);
                    setEditingPrice("");
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            )}
            <DataTable columns={pricingColumns} rows={pricingRows} />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Bill Calculator Preview"
            subtitle="Live preview of the total a student would pay"
          >
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Pages"
                  type="number"
                  fullWidth
                  size="small"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  label="Copies"
                  type="number"
                  fullWidth
                  size="small"
                  value={copies}
                  onChange={(e) => setCopies(e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  select
                  label="Mode"
                  fullWidth
                  size="small"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <MenuItem value="B&W">B&W</MenuItem>
                  <MenuItem value="Colour">Colour</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  select
                  label="Paper Size"
                  fullWidth
                  size="small"
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                >
                  <MenuItem value="A4">A4</MenuItem>
                  <MenuItem value="A3">A3</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: '#E8EAF6',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalculateRoundedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Estimated Total
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    ₹{total.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <SectionCard
            title="Pricing Guidelines"
            subtitle="Keep in mind before publishing changes"
            sx={{ height: '100%' }}
          >
            <Stack spacing={1.5}>
              {[
                'Changes apply to new print jobs only.',
                'Double-sided prints are cheaper per page than single-sided.',
                'Colour rates are typically 2–2.5× the B&W rate.',
                'Review pricing every semester to match paper and toner costs.',
              ].map((tip) => (
                <Box
                  key={tip}
                  sx={{
                    px: 2,
                    py: 1.4,
                    borderRadius: 3,
                    bgcolor: '#FAFBFE',
                    border: '1px solid #EDEFF5',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {tip}
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