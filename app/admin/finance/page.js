'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

// Format price for display
function formatPrice(price) {
  return `${parseFloat(price || 0).toFixed(2)} DA`;
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function FinancePage() {
  const [finance, setFinance] = useState(null);
  const [spending, setSpending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [financeRes, spendingRes] = await Promise.all([
        fetch('/api/finance'),
        fetch('/api/spending'),
      ]);

      if (financeRes.ok) {
        const data = await financeRes.json();
        setFinance(data);
      }

      if (spendingRes.ok) {
        const data = await spendingRes.json();
        setSpending(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDialog() {
    setEditingId(null);
    setFormData({ description: '', amount: '', category: '' });
    setDialogOpen(true);
  }

  function handleEdit(item) {
    setEditingId(item._id);
    setFormData({
      description: item.description || '',
      amount: item.amount || '',
      category: item.category || '',
    });
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({ description: '', amount: '', category: '' });
  }

  async function handleSave() {
    if (!formData.description.trim() || !formData.amount) {
      return;
    }

    setSaving(true);
    try {
      const url = editingId 
        ? `/api/spending?id=${editingId}`
        : '/api/spending';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        handleCloseDialog();
        fetchData();
      }
    } catch (err) {
      console.error('Error saving spending:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this spending entry?')) {
      return;
    }

    try {
      const res = await fetch(`/api/spending?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting spending:', err);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Finance
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track revenue, costs, and profit (Confirmed, Paid, Shipped orders only - excludes delivery fees)
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderLeft: 4, borderLeftColor: 'success.main' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Revenue (Products Only)
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 500, color: 'success.main' }}>
              {formatPrice(finance?.totalRevenue)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              From Confirmed, Paid & Shipped orders
            </Typography>
          </Paper>
        </Grid>

        {/* Spent Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderLeft: 4, borderLeftColor: 'error.main' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Spent
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 500, color: 'error.main' }}>
              {formatPrice(finance?.totalSpent)}
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Product Cost: {formatPrice(finance?.totalProductCost)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                External Spending: {formatPrice(finance?.totalExternalSpending)}
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Gain Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, borderLeft: 4, borderLeftColor: 'primary.main' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Gain (Net Profit)
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 500, 
                color: (finance?.totalGain || 0) >= 0 ? 'success.main' : 'error.main' 
              }}
            >
              {formatPrice(finance?.totalGain)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Revenue - Total Spent
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Revenue by Status */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
          Revenue by Order Status (Confirmed, Paid, Shipped)
        </Typography>
        <Grid container spacing={2}>
          {finance?.revenueByStatus?.map((item) => (
            <Grid key={item.status} size={{ xs: 6, sm: 4, md: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {item.status || 'Unknown'}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.count} orders
                </Typography>
                <Typography variant="body2" color="primary">
                  {formatPrice(item.subtotal)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Spending by Category */}
      {finance?.spendingByCategory?.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
            Spending by Category
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            {finance?.spendingByCategory?.map((item) => (
              <Chip
                key={item.category}
                label={`${item.category}: ${formatPrice(item.total)} (${item.count})`}
                variant="outlined"
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* External Spending Table */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            External Spending
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            size="small"
          >
            Add Spending
          </Button>
        </Box>

        {spending.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {spending.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      <Chip label={item.category || 'Other'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">{formatPrice(item.amount)}</TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(item._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No external spending entries yet
          </Typography>
        )}
      </Paper>

      {/* Add/Edit Spending Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Spending' : 'Add External Spending'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              required
              slotProps={{
                htmlInput: { min: 0, step: 0.01 },
              }}
            />
            <TextField
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
              placeholder="e.g., Marketing, Supplies, etc."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !formData.description.trim() || !formData.amount}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
