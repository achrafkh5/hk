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
} from 'recharts';

// Format price for display
function formatPrice(price) {
  return `$${parseFloat(price || 0).toFixed(2)}`;
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
