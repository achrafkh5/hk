'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import adminTheme from '@/lib/adminTheme';

export default function AdminSignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/login?registered=true');
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemeProvider theme={adminTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
          p: 2,
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Typography variant="h5" fontWeight={600} mb={1}>
            Admin Sign Up
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create an admin account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              type="text"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              size="small"
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              size="small"
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              size="small"
            />

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
              size="small"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account?{' '}
            <Link
              href="/admin/login"
              style={{ color: '#3f51b5', textDecoration: 'none' }}
            >
              Sign in
            </Link>
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
