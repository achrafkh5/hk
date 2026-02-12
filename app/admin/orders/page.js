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
  TextField,
  IconButton,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { playNotificationSound, notifyNewOrder } from '@/lib/orderNotifications';

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
  return `${parseFloat(price).toFixed(2)} DA`;
}

// Shorten order ID for display
function shortenId(id) {
  if (!id) return '-';
  return id.slice(-8).toUpperCase();
}

// Get product name - handle both string and object (multilingual)
function getProductName(name) {
  if (!name) return '-';
  if (typeof name === 'string') return name;
  return name.en || name.fr || name.ar || '-';
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedOrder, setEditedOrder] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [error, setError] = useState('');

  // Filter
  const [filterStatus, setFilterStatus] = useState('');

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    // Load preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orderNotificationsEnabled');
      return saved === null ? true : saved === 'true'; // Default to enabled
    }
    return true;
  });

  // Use order notifications hook
  const { hasPermission, requestPermission, error: notificationError } = useOrderNotifications(
    notificationsEnabled,
    30000 // Check every 30 seconds
  );

  // Handle notification toggle
  function handleNotificationToggle(event) {
    const enabled = event.target.checked;
    setNotificationsEnabled(enabled);
    
    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('orderNotificationsEnabled', enabled.toString());
    }

    // Request permission if enabling
    if (enabled && !hasPermission) {
      requestPermission();
    }
  }

  // Test notification sound
  function handleTestSound() {
    playNotificationSound();
  }

  // Test full notification (sound + popup)
  function handleTestNotification() {
    const testOrder = {
      _id: 'test-' + Date.now(),
      customer: { name: 'Test Customer' },
      total: 1500.00,
      items: [{ productId: 'test', name: 'Test Product', qty: 1, price: 1500 }],
    };
    
    console.log('🧪 Testing full notification with test order');
    notifyNewOrder(testOrder);
  }

  // Fetch colors on mount
  useEffect(() => {
    fetchColors();
  }, []);

  // Fetch orders on mount and when filter changes
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  async function fetchColors() {
    try {
      const res = await fetch('/api/colors');
      if (res.ok) {
        const data = await res.json();
        setColors(data);
      }
    } catch (err) {
      console.error('Error fetching colors:', err);
    }
  }

  function getColorById(colorId) {
    return colors.find(c => c._id === colorId);
  }

  function getColorName(colorId) {
    const color = getColorById(colorId);
    return color?.name?.en || colorId || '-';
  }

  function getColorHex(colorId) {
    const color = getColorById(colorId);
    return color?.hex || '#000000';
  }

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
    setEditedOrder({
      customer: { ...order.customer },
      deliveryPrice: order.deliveryPrice || 0,
      deliveryType: order.deliveryType || 'domicile',
      items: [...order.items],
    });
    setEditMode(false);
    setError('');
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setSelectedOrder(null);
    setNewStatus('');
    setEditMode(false);
    setEditedOrder(null);
    setError('');
  }

  function handleEditModeToggle() {
    setEditMode(!editMode);
    setError('');
  }

  function handleCustomerChange(field, value) {
    setEditedOrder({
      ...editedOrder,
      customer: {
        ...editedOrder.customer,
        [field]: value,
      },
    });
  }

  function handleItemChange(index, field, value) {
    const newItems = [...editedOrder.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'qty' || field === 'price' ? parseFloat(value) || 0 : value,
    };
    setEditedOrder({
      ...editedOrder,
      items: newItems,
    });
  }

  function handleDeleteItem(index) {
    const newItems = editedOrder.items.filter((_, i) => i !== index);
    if (newItems.length === 0) {
      setError('Order must have at least one item');
      return;
    }
    setEditedOrder({
      ...editedOrder,
      items: newItems,
    });
  }

  function calculateTotal() {
    const subtotal = editedOrder.items.reduce((sum, item) => {
      return sum + (item.price * item.qty);
    }, 0);
    return subtotal + (editedOrder.deliveryPrice || 0);
  }

  async function handleUpdateOrder() {
    if (!selectedOrder || !editedOrder) return;

    if (editedOrder.items.length === 0) {
      setError('Order must have at least one item');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const subtotal = editedOrder.items.reduce((sum, item) => {
        return sum + (item.price * item.qty);
      }, 0);
      const total = subtotal + (editedOrder.deliveryPrice || 0);

      const res = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          customer: editedOrder.customer,
          items: editedOrder.items,
          subtotal,
          deliveryPrice: editedOrder.deliveryPrice,
          deliveryType: editedOrder.deliveryType,
          total,
        }),
      });

      if (res.ok) {
        handleCloseDialog();
        fetchOrders();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update order');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStatus() {
    if (!selectedOrder || !newStatus) return;

    setSaving(true);
    setError('');
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
        setError(data.error || 'Failed to update order');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order');
    } finally {
      setSaving(false);
    }
  }

  function handleOpenDeleteDialog(order) {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  }

  function handleCloseDeleteDialog() {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  }

  async function handleDeleteOrder() {
    if (!orderToDelete) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderToDelete._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        handleCloseDeleteDialog();
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete order');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5">Orders</Typography>
        
        {/* Notification Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* Test Sound Button */}
          <Tooltip title="Test notification sound">
            <IconButton 
              onClick={handleTestSound}
              size="small"
              color="primary"
            >
              <VolumeUpIcon />
            </IconButton>
          </Tooltip>
          
          {/* Test Full Notification Button */}
          <Tooltip title="Test sound + popup notification">
            <IconButton 
              onClick={handleTestNotification}
              size="small"
              color="secondary"
            >
              <BugReportIcon />
            </IconButton>
          </Tooltip>
          
          {/* Notification Toggle */}
          <Tooltip title={hasPermission ? 'Notifications enabled' : 'Click to enable notifications'}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationsEnabled}
                  onChange={handleNotificationToggle}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {notificationsEnabled && hasPermission ? (
                    <NotificationsActiveIcon fontSize="small" color="primary" />
                  ) : (
                    <NotificationsOffIcon fontSize="small" color="disabled" />
                  )}
                  <Typography variant="body2">
                    Order Alerts
                  </Typography>
                </Box>
              }
            />
          </Tooltip>
        </Box>
      </Box>

      {/* Permission Warning */}
      {notificationsEnabled && !hasPermission && (
        <Alert severity="warning" sx={{ mb: 2 }} action={
          <Button color="inherit" size="small" onClick={requestPermission}>
            Allow
          </Button>
        }>
          Please allow notifications in your browser to receive new order alerts with sound.
        </Alert>
      )}

      {/* Notification Error */}
      {notificationsEnabled && notificationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {notificationError}
        </Alert>
      )}

      {/* Active Notifications Info */}
      {notificationsEnabled && hasPermission && !notificationError && (
        <Alert severity="info" sx={{ mb: 2 }}>
          🔔 You&apos;ll receive a notification with sound when new orders arrive (checking every 30 seconds)
        </Alert>
      )}

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
              <TableCell>Delivery Type</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
                  <TableCell>
                    <Chip
                      label={order.deliveryType === 'domicile' ? 'Domicile' : 'Stop Desk'}
                      size="small"
                      variant="outlined"
                      color={order.deliveryType === 'domicile' ? 'primary' : 'default'}
                    />
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
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        onClick={() => handleOpenDialog(order)}
                        startIcon={<EditIcon />}
                      >
                        Edit
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(order)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order #{shortenId(selectedOrder?._id)}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && editedOrder && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {error && (
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {/* Customer Info */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Customer
                </Typography>
                {editMode ? (
                  <Stack spacing={2}>
                    <TextField
                      label="Name"
                      value={editedOrder.customer?.name || ''}
                      onChange={(e) => handleCustomerChange('name', e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Phone"
                      value={editedOrder.customer?.phone || ''}
                      onChange={(e) => handleCustomerChange('phone', e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Wilaya"
                      value={editedOrder.customer?.wilaya || ''}
                      onChange={(e) => handleCustomerChange('wilaya', e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Commune"
                      value={editedOrder.customer?.commune || ''}
                      onChange={(e) => handleCustomerChange('commune', e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Address"
                      value={editedOrder.customer?.address || ''}
                      onChange={(e) => handleCustomerChange('address', e.target.value)}
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                    />
                  </Stack>
                ) : (
                  <>
                    <Typography variant="body1">
                      {selectedOrder.customer?.name || '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedOrder.customer?.phone || '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {selectedOrder.customer?.wilaya && (
                        <>
                          {selectedOrder.customer.wilaya}
                          {selectedOrder.customer?.commune && `, ${selectedOrder.customer.commune}`}
                        </>
                      )}
                    </Typography>
                    {selectedOrder.customer?.address && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {selectedOrder.customer.address}
                      </Typography>
                    )}
                  </>
                )}
              </Box>

              <Divider />

              {/* Delivery Info */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Delivery
                </Typography>
                {editMode ? (
                  <Stack direction="row" spacing={2}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Delivery Type</InputLabel>
                      <Select
                        value={editedOrder.deliveryType}
                        label="Delivery Type"
                        onChange={(e) => setEditedOrder({
                          ...editedOrder,
                          deliveryType: e.target.value
                        })}
                      >
                        <MenuItem value="domicile">Domicile</MenuItem>
                        <MenuItem value="stopdesk">Stop Desk</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Delivery Price"
                      type="number"
                      value={editedOrder.deliveryPrice}
                      onChange={(e) => setEditedOrder({
                        ...editedOrder,
                        deliveryPrice: parseFloat(e.target.value) || 0
                      })}
                      fullWidth
                      size="small"
                      InputProps={{
                        endAdornment: 'DA'
                      }}
                    />
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      label={selectedOrder.deliveryType === 'domicile' ? 'Domicile' : 'Stop Desk'}
                      size="small"
                      color={selectedOrder.deliveryType === 'domicile' ? 'primary' : 'default'}
                    />
                    <Typography variant="body2">
                      {formatPrice(selectedOrder.deliveryPrice || 0)}
                    </Typography>
                  </Stack>
                )}
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
                        <TableCell>Color</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                        {editMode && <TableCell align="right">Actions</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(editMode ? editedOrder.items : selectedOrder.items)?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {editMode ? (
                              <TextField
                                value={getProductName(item.name)}
                                size="small"
                                disabled
                                fullWidth
                              />
                            ) : (
                              getProductName(item.name)
                            )}
                          </TableCell>
                          <TableCell>
                            {editMode ? (
                              <TextField
                                value={item.color || ''}
                                onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                                size="small"
                                fullWidth
                                disabled
                                helperText="Color cannot be edited"
                              />
                            ) : item.color ? (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    bgcolor: getColorHex(item.color),
                                    border: '1px solid',
                                    borderColor: getColorHex(item.color) === '#FFFFFF' ? 'grey.300' : 'transparent',
                                  }}
                                />
                                <Typography variant="body2">{getColorName(item.color)}</Typography>
                              </Stack>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {editMode ? (
                              <TextField
                                value={item.size || ''}
                                onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                                size="small"
                                fullWidth
                              />
                            ) : item.size ? (
                              <Chip 
                                label={item.size} 
                                size="small" 
                                variant="outlined"
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {editMode ? (
                              <TextField
                                type="number"
                                value={item.qty}
                                onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                size="small"
                                inputProps={{ min: 1 }}
                                sx={{ width: 80 }}
                              />
                            ) : (
                              item.qty
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {editMode ? (
                              <TextField
                                type="number"
                                value={item.price}
                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                size="small"
                                inputProps={{ min: 0, step: 0.01 }}
                                sx={{ width: 100 }}
                              />
                            ) : (
                              formatPrice(item.price * item.qty)
                            )}
                          </TableCell>
                          {editMode && (
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteItem(index)}
                                disabled={editedOrder.items.length === 1}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          )}
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
                  {editMode ? formatPrice(calculateTotal()) : formatPrice(selectedOrder.total || 0)}
                </Typography>
              </Box>

              <Divider />

              {/* Status Update */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={editMode}
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
          {!editMode ? (
            <>
              <Button
                variant="outlined"
                onClick={handleEditModeToggle}
                disabled={saving}
              >
                Edit Order
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateStatus}
                disabled={saving || newStatus === selectedOrder?.status}
              >
                {saving ? 'Saving...' : 'Update Status'}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleEditModeToggle}
                disabled={saving}
              >
                Cancel Edit
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateOrder}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete order #{shortenId(orderToDelete?._id)}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteOrder}
            disabled={saving}
          >
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
