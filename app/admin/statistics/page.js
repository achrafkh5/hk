'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Status colors for pie chart (matching orders page)
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

// Format date for chart
function formatChartDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function StatisticsPage() {
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

  // Prepare chart data with formatted dates
  const chartData = stats?.ordersPerDay?.map(item => ({
    date: formatChartDate(item.date),
    orders: item.count,
  })) || [];

  // Prepare pie chart data for order statuses
  const statusChartData = stats?.ordersByStatus
    ? Object.entries(stats.ordersByStatus)
        .filter(([, data]) => data.count > 0)
        .map(([status, data]) => ({
          name: STATUS_LABELS[status] || status,
          value: data.count,
          color: STATUS_COLORS[status] || '#9ca3af',
        }))
    : [];

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
          Statistics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of your store activity
        </Typography>
      </Box>

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
              Total Revenue (with delivery)
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 500 }}>
              {formatPrice(stats?.totalRevenue)}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Products Revenue (no delivery)
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 500 }}>
              {formatPrice(stats?.totalProductsRevenue)}
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

      {/* Status Cards */}
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

      {/* Order Status Pie Chart */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 500 }}>
          Orders by Status
        </Typography>
        
        {statusChartData.length > 0 ? (
          <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 4,
                    fontSize: 13,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span style={{ color: '#374151', fontSize: 13 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No orders yet
          </Typography>
        )}
      </Paper>

      {/* Orders Chart */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 500 }}>
          Orders (Last 14 Days)
        </Typography>
        
        {chartData.length > 0 ? (
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 4,
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ fill: '#4f46e5', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#4f46e5' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No order data available
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
