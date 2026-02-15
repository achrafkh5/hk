'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Stack,
} from '@mui/material';

// Status colors (matching orders page)
const STATUS_COLORS = {
  pending: '#ed6c02',
  paid: '#1976d2',
  shipped: '#9c27b0',
  cancelled: '#9e9e9e',
  confirmed: '#2e7d32',
  retourned: '#d32f2f',
};

const STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
  confirmed: 'Confirmed',
  retourned: 'Retourned',
};

// Format price for display
function formatPrice(price) {
  return `${parseFloat(price || 0).toFixed(2)} DA`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  async function fetchStatistics() {
    try {
      setLoading(true);
      const res = await fetch('/api/statistics');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome to the admin dashboard
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 500 }}>
                  {stats?.totalOrders || 0}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 500 }}>
                  {formatPrice(stats?.totalRevenue)}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Orders Today
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 500 }}>
                  {stats?.todayOrders || 0}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Orders by Status */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
            Orders by Status
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {Object.entries(stats?.ordersByStatus || {}).map(([status, data]) => (
              <Grid key={status} size={{ xs: 6, sm: 4, md: 2 }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderLeft: 4, 
                    borderLeftColor: STATUS_COLORS[status] || '#9ca3af',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {STATUS_LABELS[status] || status}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    {data?.count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPrice(data?.subtotal || 0)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Quick Links */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
              Quick Actions
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                component={Link}
                href="/admin/products"
                fullWidth={{ xs: true, sm: false }}
              >
                Manage Products
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/admin/orders"
                fullWidth={{ xs: true, sm: false }}
              >
                View Orders
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/admin/statistics"
                fullWidth={{ xs: true, sm: false }}
              >
                Full Statistics
              </Button>
            </Stack>
          </Paper>
        </>
      )}
    </Box>
  );
}
