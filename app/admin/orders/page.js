'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Get chip color based on status
function getStatusColor(status) {
  switch (status) {
    case 'paid':
      return 'primary';
    case 'shipped':
      return 'success';
    case 'cancelled':
      return 'default';
    default:
      return 'warning';
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format price
function formatPrice(price) {
  return `$${parseFloat(price).toFixed(2)}`;
}

// Shorten order ID for display
function shortenId(id) {
  if (!id) return '-';
  return id.slice(-8).toUpperCase();
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter
  const [filterStatus, setFilterStatus] = useState('');

  // Fetch orders on mount and when filter changes
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  async function fetchOrders() {
    try {
      setLoading(true);
      let url = '/api/orders';
      
      if (filterStatus) {
        url += `?status=${filterStatus}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDialog(order) {
    setSelectedOrder(order);
    setNewStatus(order.status || 'pending');
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setSelectedOrder(null);
    setNewStatus('');
  }

  async function handleUpdateStatus() {
    if (!selectedOrder || !newStatus) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        handleCloseDialog();
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Orders</Typography>
      </Box>

      {/* Filter */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">All Orders</MenuItem>
            {ORDER_STATUSES.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Orders Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                    >
                      #{shortenId(order._id)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.customer?.name || '-'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.customer?.email || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatPrice(order.total || 0)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status || 'pending'}
                      size="small"
                      color={getStatusColor(order.status)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => handleOpenDialog(order)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={{ xs: true, sm: false }}
      >
        <DialogTitle>
          Order #{shortenId(selectedOrder?._id)}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Customer Info */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Customer
                </Typography>
                <Typography variant="body1">
                  {selectedOrder.customer?.name || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOrder.customer?.email || '-'}
                </Typography>
              </Box>

              <Divider />

              {/* Order Items */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Items
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name || '-'}</TableCell>
                          <TableCell align="right">{item.qty}</TableCell>
                          <TableCell align="right">
                            {formatPrice(item.price * item.qty)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider />

              {/* Total */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">Total</Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formatPrice(selectedOrder.total || 0)}
                </Typography>
              </Box>

              <Divider />

              {/* Status Update */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Update Status
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Order Date */}
              <Typography variant="caption" color="text.secondary">
                Created: {formatDate(selectedOrder.createdAt)}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={saving || newStatus === selectedOrder?.status}
          >
            {saving ? 'Saving...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
