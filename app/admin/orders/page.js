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
  Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import algerianWilayas from 'algeria-wilayas';

// Delivery prices by wilaya
const DELIVERY_PRICES = {
  Adrar: { domicile: 1400, stopdesk: 1100 },
  Chlef: { domicile: 850, stopdesk: 450 },
  Laghouat: { domicile: 1000, stopdesk: 700 },
  "Oum El Bouaghi": { domicile: 850, stopdesk: 500 },
  Batna: { domicile: 850, stopdesk: 500 },
  Béjaïa: { domicile: 850, stopdesk: 500 },
  Biskra: { domicile: 950, stopdesk: 600 },
  Béchar: { domicile: 1400, stopdesk: 1100 },
  Blida: { domicile: 700, stopdesk: 450 },
  Bouira: { domicile: 850, stopdesk: 450 },
  Tamanrasset: { domicile: 1800, stopdesk: 1400 },
  Tébessa: { domicile: 950, stopdesk: 600 },
  Tlemcen: { domicile: 850, stopdesk: 500 },
  "Tizi Ouzou": { domicile: 850, stopdesk: 450 },
  Alger: { domicile: 500, stopdesk: 400 },
  Djelfa: { domicile: 900, stopdesk: 600 },
  Jijel: { domicile: 850, stopdesk: 500 },
  Sétif: { domicile: 850, stopdesk: 450 },
  Saïda: { domicile: 900, stopdesk: 600 },
  Skikda: { domicile: 850, stopdesk: 500 },
  "Sidi Bel Abbès": { domicile: 850, stopdesk: 500 },
  Annaba: { domicile: 850, stopdesk: 500 },
  Guelma: { domicile: 900, stopdesk: 600 },
  Constantine: { domicile: 850, stopdesk: 450 },
  Médéa: { domicile: 850, stopdesk: 450 },
  Mostaganem: { domicile: 850, stopdesk: 500 },
  "M'Sila": { domicile: 850, stopdesk: 500 },
  Mascara: { domicile: 900, stopdesk: 600 },
  Ouargla: { domicile: 1100, stopdesk: 800 },
  Oran: { domicile: 850, stopdesk: 450 },
  "El Bayadh": { domicile: 1100, stopdesk: 800 },
  Illizi: { domicile: 2000, stopdesk: 1700 },
  "Bordj Bou Arreridj": { domicile: 850, stopdesk: 450 },
  Boumerdès: { domicile: 700, stopdesk: 450 },
  "El Tarf": { domicile: 950, stopdesk: 600 },
  Tindouf: { domicile: 1800, stopdesk: 1400 },
  "El Oued": { domicile: 1100, stopdesk: 800 },
  Khenchela: { domicile: 900, stopdesk: 600 },
  "Souk Ahras": { domicile: 900, stopdesk: 600 },
  Tipaza: { domicile: 700, stopdesk: 450 },
  Mila: { domicile: 850, stopdesk: 500 },
  "Aïn Defla": { domicile: 850, stopdesk: 450 },
  Naâma: { domicile: 1100, stopdesk: 800 },
  "Aïn Témouchent": { domicile: 900, stopdesk: 600 },
  Ghardaïa: { domicile: 1100, stopdesk: 800 },
  Relizane: { domicile: 850, stopdesk: 500 },
  Timimoun: { domicile: 1400, stopdesk: 1100 },
  "Ouled Djellal": { domicile: 1000, stopdesk: 700 },
  "Beni Abbes": { domicile: 1400, stopdesk: 1100 },
  "In Salah": { domicile: 1400, stopdesk: 1100 },
  "In Guezzam": { domicile: 2000, stopdesk: 1700 },
  Touggourt: { domicile: 1100, stopdesk: 800 },
  Djanet: { domicile: 2000, stopdesk: 1700 },
  "El M'Ghair": { domicile: 1100, stopdesk: 800 },
  "El Meniaa": { domicile: 1300, stopdesk: 1000 }
};
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import BugReportIcon from '@mui/icons-material/BugReport';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { playNotificationSound, notifyNewOrder, getNotificationPermission } from '@/lib/orderNotifications';
import { checkNotificationSupport } from '@/lib/deviceDetection';

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'retourned', label: 'Retourned' },
];

// Get chip color based on status
function getStatusColor(status) {
  switch (status) {
    case 'paid':
      return 'primary';
    case 'shipped':
      return 'secondary';
    case 'cancelled':
      return 'default';
    case 'confirmed':
      return 'success';
    case 'retourned':
      return 'error';
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
  const [products, setProducts] = useState([]);
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
  const [orderProducts, setOrderProducts] = useState({}); // Store product details by productId

  // Add Order Dialog
  const [addOrderDialogOpen, setAddOrderDialogOpen] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    customer: { name: '', phone: '', wilaya: '', commune: '', address: '' },
    deliveryType: 'stopdesk',
    deliveryPrice: 0,
    items: [{ productId: '', name: '', price: 0, qty: 1, size: '', color: '' }]
  });
  const [communes, setCommunes] = useState([]);

  // Filter
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1, hasMore: false });
  const [ordersPerPage, setOrdersPerPage] = useState(() => {
    // Load preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ordersPerPage');
      return saved ? parseInt(saved, 10) : 20;
    }
    return 20;
  });

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    // Load preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orderNotificationsEnabled');
      return saved === null ? true : saved === 'true'; // Default to enabled
    }
    return true;
  });

  // Check device support
  const [deviceSupport, setDeviceSupport] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  
  // Test result snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDeviceSupport(checkNotificationSupport());
      
      // Update debug info
      setDebugInfo({
        userAgent: navigator.userAgent,
        notificationAPI: 'Notification' in window,
        permission: getNotificationPermission(),
        platform: navigator.platform,
        language: navigator.language,
      });
    }
  }, []);

  // Use order notifications hook
  const { hasPermission, requestPermission, error: notificationError } = useOrderNotifications(
    notificationsEnabled,
    30000 // Check every 30 seconds
  );
  
  // Update debug info when permission changes
  useEffect(() => {
    if (typeof window !== 'undefined' && hasPermission !== undefined) {
      setDebugInfo(prev => ({
        ...prev,
        permission: getNotificationPermission(),
        hasPermission,
      }));
    }
  }, [hasPermission]);

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
    console.log('🔊 Testing sound...');
    try {
      playNotificationSound();
      setSnackbar({ 
        open: true, 
        message: '🔊 Sound test played!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('❌ Sound test failed:', error);
      setSnackbar({ 
        open: true, 
        message: '❌ Sound failed: ' + error.message, 
        severity: 'error' 
      });
    }
  }

  // Test full notification (sound + popup)
  function handleTestNotification() {
    console.log('🧪 Testing full notification...');
    console.log('🔍 Permission:', Notification?.permission);
    console.log('📱 Device:', navigator.userAgent);
    
    try {
      const testOrder = {
        _id: 'test-' + Date.now(),
        customer: { name: 'Test Customer' },
        total: 1500.00,
        items: [{ productId: 'test', name: 'Test Product', qty: 1, price: 1500 }],
      };
      
      const result = notifyNewOrder(testOrder);
      console.log('📊 Test result:', result);
      
      // Show visual feedback in UI
      if (result.notification && result.sound) {
        setSnackbar({ 
          open: true, 
          message: '✅ Test successful! Sound and notification sent.', 
          severity: 'success' 
        });
      } else if (result.sound && !result.notification) {
        setSnackbar({ 
          open: true, 
          message: '⚠️ Sound OK, but notification failed. Check console.', 
          severity: 'warning' 
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: `❌ Test failed: ${result.error || 'Unknown error'}`, 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('❌ Test exception:', error);
      setSnackbar({ 
        open: true, 
        message: '❌ Test crashed: ' + error.message, 
        severity: 'error' 
      });
    }
  }

  // Fetch colors and products on mount
  useEffect(() => {
    fetchColors();
    fetchProducts();
  }, []);

  // Fetch orders on mount and when filter, page, or ordersPerPage changes
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, currentPage, ordersPerPage]);

  // Reset to page 1 when filter or ordersPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, ordersPerPage]);

  // Handle orders per page change
  function handleOrdersPerPageChange(event) {
    const value = event.target.value;
    setOrdersPerPage(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ordersPerPage', value.toString());
    }
  }

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

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products?active=true');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
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
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', ordersPerPage.toString());
      
      if (filterStatus) {
        params.set('status', filterStatus);
      }

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setPagination(data.pagination);
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
    setOrderProducts({});
  }

  async function fetchOrderProducts(items) {
    const productsMap = {};
    for (const item of items) {
      if (item.productId && !productsMap[item.productId]) {
        try {
          const res = await fetch(`/api/products/${item.productId}`);
          if (res.ok) {
            const product = await res.json();
            productsMap[item.productId] = product;
          }
        } catch (err) {
          console.error('Error fetching product:', err);
        }
      }
    }
    setOrderProducts(productsMap);
  }

  async function handleEditModeToggle() {
    if (!editMode && editedOrder?.items) {
      // Entering edit mode - fetch product details
      await fetchOrderProducts(editedOrder.items);
    }
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

  // Add Order Dialog Handlers
  function handleOpenAddOrderDialog() {
    setNewOrderData({
      customer: { name: '', phone: '', wilaya: '', commune: '', address: '' },
      deliveryType: 'stopdesk',
      deliveryPrice: 0,
      items: [{ productId: '', name: '', price: 0, qty: 1, size: '', color: '' }]
    });
    setCommunes([]);
    setError('');
    setAddOrderDialogOpen(true);
  }

  function handleCloseAddOrderDialog() {
    setAddOrderDialogOpen(false);
    setNewOrderData({
      customer: { name: '', phone: '', wilaya: '', commune: '', address: '' },
      deliveryType: 'stopdesk',
      deliveryPrice: 0,
      items: [{ productId: '', name: '', price: 0, qty: 1, size: '', color: '' }]
    });
    setCommunes([]);
    setError('');
  }

  function handleNewOrderCustomerChange(field, value) {
    const updatedCustomer = { ...newOrderData.customer, [field]: value };
    
    // Handle wilaya change - update communes and delivery price
    if (field === 'wilaya') {
      if (value) {
        // Load ALL communes from all dairas of that wilaya (same as checkout page)
        const wilayaDairas = algerianWilayas.getDairasByWilaya(value);
        const allCommunes = [];
        wilayaDairas.forEach(daira => {
          const dairaCommunes = algerianWilayas.getCommunesByDaira(daira.id);
          allCommunes.push(...dairaCommunes);
        });
        // Sort communes alphabetically
        allCommunes.sort((a, b) => (a.commune_name_ascii || '').localeCompare(b.commune_name_ascii || ''));
        setCommunes(allCommunes);
        updatedCustomer.commune = '';
        
        // Update delivery price
        const wilayaName = algerianWilayas.getWilayaName(value, 'ascii');
        const prices = DELIVERY_PRICES[wilayaName];
        if (prices) {
          const deliveryPrice = prices[newOrderData.deliveryType] || 0;
          setNewOrderData(prev => ({
            ...prev,
            customer: updatedCustomer,
            deliveryPrice
          }));
          return;
        }
      } else {
        setCommunes([]);
        updatedCustomer.commune = '';
      }
    }
    
    setNewOrderData(prev => ({
      ...prev,
      customer: updatedCustomer
    }));
  }

  function handleNewOrderDeliveryTypeChange(value) {
    let deliveryPrice = 0;
    if (newOrderData.customer.wilaya) {
      const wilayaName = algerianWilayas.getWilayaName(newOrderData.customer.wilaya, 'ascii');
      const prices = DELIVERY_PRICES[wilayaName];
      if (prices) {
        deliveryPrice = prices[value] || 0;
      }
    }
    setNewOrderData(prev => ({
      ...prev,
      deliveryType: value,
      deliveryPrice
    }));
  }

  function handleNewOrderItemChange(index, field, value) {
    const newItems = [...newOrderData.items];
    
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: value,
          name: product.name,
          price: product.salePrice || product.price,
          size: '',
          color: ''
        };
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: field === 'qty' || field === 'price' ? parseFloat(value) || 0 : value
      };
    }
    
    setNewOrderData(prev => ({
      ...prev,
      items: newItems
    }));
  }

  function handleAddNewOrderItem() {
    setNewOrderData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', name: '', price: 0, qty: 1, size: '', color: '' }]
    }));
  }

  function handleRemoveNewOrderItem(index) {
    if (newOrderData.items.length === 1) {
      setError('Order must have at least one item');
      return;
    }
    setNewOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }

  function calculateNewOrderTotal() {
    const subtotal = newOrderData.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    return subtotal + (newOrderData.deliveryPrice || 0);
  }

  async function handleCreateOrder() {
    // Validation
    if (!newOrderData.customer.name) {
      setError('Customer name is required');
      return;
    }
    if (!newOrderData.customer.phone) {
      setError('Customer phone is required');
      return;
    }
    if (!newOrderData.customer.wilaya || !newOrderData.customer.commune) {
      setError('Customer location (wilaya, commune) is required');
      return;
    }
    if (newOrderData.items.length === 0 || !newOrderData.items[0].productId) {
      setError('At least one product is required');
      return;
    }

    setSaving(true);
    setError('');

    const subtotal = newOrderData.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = subtotal + (newOrderData.deliveryPrice || 0);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: newOrderData.items,
          subtotal,
          deliveryPrice: newOrderData.deliveryPrice,
          deliveryType: newOrderData.deliveryType,
          total,
          customer: newOrderData.customer,
          isAdminOrder: true  // Mark as admin order - won't count for Meta pixel
        }),
      });

      if (res.ok) {
        handleCloseAddOrderDialog();
        fetchOrders();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5">Orders</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddOrderDialog}
            size="small"
          >
            Add Order
          </Button>
        </Box>
        
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

      {/* Debug Panel */}
      {deviceSupport && (
        <Paper variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
          <Button
            fullWidth
            onClick={() => setShowDebug(!showDebug)}
            endIcon={<ExpandMoreIcon sx={{ transform: showDebug ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s' }} />}
            sx={{ justifyContent: 'space-between', p: 1.5, textTransform: 'none' }}
          >
            <Typography variant="body2" color="text.secondary">
              🔍 Notification Debug Info
            </Typography>
          </Button>
          
          {showDebug && (
            <Box sx={{ p: 2, pt: 0, bgcolor: 'grey.50' }}>
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Device Type:</Typography>
                  <Typography variant="body2" fontWeight="bold">{deviceSupport.deviceType}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Browser Support:</Typography>
                  <Typography variant="body2">
                    {debugInfo.notificationAPI ? '✅ Supported' : '❌ Not Supported'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Permission Status:</Typography>
                  <Typography variant="body2">
                    {debugInfo.permission === 'granted' && '✅ Granted'}
                    {debugInfo.permission === 'denied' && '❌ Denied'}
                    {debugInfo.permission === 'default' && '⏸️ Not requested'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Platform:</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{debugInfo.platform}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">User Agent:</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>
                    {debugInfo.userAgent?.substring(0, 100)}...
                  </Typography>
                </Box>
                <Divider />
                <Alert severity={deviceSupport.supported ? 'success' : 'error'} sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    <strong>Status:</strong> {deviceSupport.reason}
                  </Typography>
                  {deviceSupport.recommendation && (
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      <strong>Tip:</strong> {deviceSupport.recommendation}
                    </Typography>
                  )}
                </Alert>
              </Stack>
            </Box>
          )}
        </Paper>
      )}

      {/* Mobile Device Warning - iOS */}
      {deviceSupport && deviceSupport.deviceType === 'iOS' && notificationsEnabled && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          icon={<PhoneAndroidIcon />}
        >
          <strong>Mobile Limitation:</strong> iOS devices (iPhone/iPad) do not support web notifications. 
          Please use a desktop browser (Chrome, Firefox, Edge) to receive order alerts.
        </Alert>
      )}

      {/* Mobile Device Warning - Android */}
      {deviceSupport && deviceSupport.deviceType === 'Android' && notificationsEnabled && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          icon={<PhoneAndroidIcon />}
        >
          <strong>Mobile Device Detected:</strong> Android Chrome supports notifications, but desktop browsers provide a better experience. 
          Make sure notifications are enabled in your Android settings.
        </Alert>
      )}

      {/* Permission Warning */}
      {notificationsEnabled && !hasPermission && deviceSupport?.supported && (
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
      {notificationsEnabled && hasPermission && !notificationError && deviceSupport?.deviceType === 'Desktop' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ Notifications active! You&apos;ll receive alerts with sound when new orders arrive (checking every 30 seconds)
        </Alert>
      )}
      
      {/* Active Notifications Info - Android */}
      {notificationsEnabled && hasPermission && !notificationError && deviceSupport?.deviceType === 'Android' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          🔔 Notifications enabled on Android. Keep this browser tab open to receive order alerts.
        </Alert>
      )}

      {/* Filter */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
            <InputLabel>Per Page</InputLabel>
            <Select
              value={ordersPerPage}
              label="Per Page"
              onChange={handleOrdersPerPageChange}
            >
              <MenuItem value={20}>20 per page</MenuItem>
              <MenuItem value={30}>30 per page</MenuItem>
              <MenuItem value={40}>40 per page</MenuItem>
              <MenuItem value={50}>50 per page</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Pagination Controls */}
      {!loading && pagination.totalCount > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {((currentPage - 1) * ordersPerPage) + 1} - {Math.min(currentPage * ordersPerPage, pagination.totalCount)} of {pagination.totalCount} orders
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant="outlined"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ px: 2 }}>
              Page {currentPage} of {pagination.totalPages}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!pagination.hasMore}
            >
              Next
            </Button>
          </Stack>
        </Box>
      )}

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
                              (() => {
                                const product = orderProducts[item.productId];
                                const availableColors = product?.colors || [];
                                return availableColors.length > 0 ? (
                                  <FormControl size="small" fullWidth>
                                    <Select
                                      value={item.color || ''}
                                      onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                                      displayEmpty
                                    >
                                      <MenuItem value="">
                                        <em>No Color</em>
                                      </MenuItem>
                                      {availableColors.map((colorId) => {
                                        const colorObj = colors.find(c => c._id === colorId);
                                        return (
                                          <MenuItem key={colorId} value={colorId}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <Box
                                                sx={{
                                                  width: 16,
                                                  height: 16,
                                                  borderRadius: '50%',
                                                  bgcolor: colorObj?.hex || '#000',
                                                  border: '1px solid',
                                                  borderColor: colorObj?.hex === '#FFFFFF' ? 'grey.300' : 'transparent',
                                                }}
                                              />
                                              <span>{colorObj?.name?.en || colorId}</span>
                                            </Stack>
                                          </MenuItem>
                                        );
                                      })}
                                    </Select>
                                  </FormControl>
                                ) : (
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
                                    <Typography variant="body2">{getColorName(item.color) || 'No colors available'}</Typography>
                                  </Stack>
                                );
                              })()
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

      {/* Test Result Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%', fontSize: '1rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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

      {/* Add Order Dialog */}
      <Dialog
        open={addOrderDialogOpen}
        onClose={handleCloseAddOrderDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Order (Admin)</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
            This order will be marked as admin-created and won&apos;t count for Meta pixel tracking.
          </Typography>

          <Divider sx={{ my: 2 }} />
          
          {/* Customer Information */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Customer Information
          </Typography>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Customer Name"
                value={newOrderData.customer.name}
                onChange={(e) => handleNewOrderCustomerChange('name', e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={newOrderData.customer.phone}
                onChange={(e) => handleNewOrderCustomerChange('phone', e.target.value)}
                required
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Wilaya</InputLabel>
                <Select
                  value={newOrderData.customer.wilaya}
                  label="Wilaya"
                  onChange={(e) => handleNewOrderCustomerChange('wilaya', e.target.value)}
                >
                  {algerianWilayas.getAllWilayas().map((wilaya) => (
                    <MenuItem key={wilaya.code} value={wilaya.code}>
                      {wilaya.code} - {wilaya.name.ascii}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required disabled={!newOrderData.customer.wilaya}>
                <InputLabel>Commune</InputLabel>
                <Select
                  value={newOrderData.customer.commune}
                  label="Commune"
                  onChange={(e) => handleNewOrderCustomerChange('commune', e.target.value)}
                >
                  {communes.map((commune) => (
                    <MenuItem key={commune.id} value={commune.id}>
                      {commune.commune_name_ascii}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <TextField
              fullWidth
              label="Address (optional)"
              value={newOrderData.customer.address}
              onChange={(e) => handleNewOrderCustomerChange('address', e.target.value)}
              multiline
              rows={2}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />
          
          {/* Delivery */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            Delivery
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Delivery Type</InputLabel>
              <Select
                value={newOrderData.deliveryType}
                label="Delivery Type"
                onChange={(e) => handleNewOrderDeliveryTypeChange(e.target.value)}
              >
                <MenuItem value="domicile">Domicile (Home)</MenuItem>
                <MenuItem value="stopdesk">Stop Desk</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Delivery Price (DA)"
              type="number"
              value={newOrderData.deliveryPrice}
              onChange={(e) => setNewOrderData(prev => ({ ...prev, deliveryPrice: parseFloat(e.target.value) || 0 }))}
              InputProps={{ readOnly: true }}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />
          
          {/* Order Items */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Order Items
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddNewOrderItem}
            >
              Add Item
            </Button>
          </Box>
          
          {newOrderData.items.map((item, index) => {
            const selectedProduct = products.find(p => p._id === item.productId);
            return (
              <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <FormControl fullWidth required>
                      <InputLabel>Product</InputLabel>
                      <Select
                        value={item.productId}
                        label="Product"
                        onChange={(e) => handleNewOrderItemChange(index, 'productId', e.target.value)}
                      >
                        {products.map((product) => (
                          <MenuItem key={product._id} value={product._id}>
                            {getProductName(product.name)} - {formatPrice(product.salePrice || product.price)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveNewOrderItem(index)}
                      disabled={newOrderData.items.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleNewOrderItemChange(index, 'qty', e.target.value)}
                      InputProps={{ inputProps: { min: 1 } }}
                      sx={{ width: { xs: '100%', sm: 120 } }}
                    />
                    <TextField
                      label="Price (DA)"
                      type="number"
                      value={item.price}
                      onChange={(e) => handleNewOrderItemChange(index, 'price', e.target.value)}
                      sx={{ width: { xs: '100%', sm: 150 } }}
                    />
                    {selectedProduct?.hasSize && selectedProduct?.sizes?.length > 0 && (
                      <FormControl sx={{ width: { xs: '100%', sm: 120 } }}>
                        <InputLabel>Size</InputLabel>
                        <Select
                          value={item.size || ''}
                          label="Size"
                          onChange={(e) => handleNewOrderItemChange(index, 'size', e.target.value)}
                        >
                          {selectedProduct.sizes.map((size, sizeIndex) => {
                            const sizeValue = typeof size === 'object' ? size.value || size.name || JSON.stringify(size) : size;
                            return (
                              <MenuItem key={`size-${sizeIndex}-${sizeValue}`} value={sizeValue}>{sizeValue}</MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    )}
                    {selectedProduct?.colors?.length > 0 && (
                      <FormControl sx={{ width: { xs: '100%', sm: 150 } }}>
                        <InputLabel>Color</InputLabel>
                        <Select
                          value={item.color || ''}
                          label="Color"
                          onChange={(e) => handleNewOrderItemChange(index, 'color', e.target.value)}
                        >
                          {selectedProduct.colors.map((colorId) => (
                            <MenuItem key={colorId} value={colorId}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    bgcolor: getColorById(colorId)?.hex || '#ccc',
                                    border: '1px solid #ccc'
                                  }}
                                />
                                {getColorName(colorId)}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}

          <Divider sx={{ my: 2 }} />
          
          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="h6">
              Total: {formatPrice(calculateNewOrderTotal())}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddOrderDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateOrder}
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
