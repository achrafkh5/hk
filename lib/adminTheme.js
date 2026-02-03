'use client';

import { createTheme } from '@mui/material/styles';

const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5', // Indigo
      light: '#6366f1',
      dark: '#4338ca',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    body2: {
      color: '#6b7280',
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&.Mui-selected': {
            backgroundColor: '#eef2ff',
            borderLeft: '3px solid #4f46e5',
            '&:hover': {
              backgroundColor: '#e0e7ff',
            },
          },
        },
      },
    },
  },
});

export default adminTheme;
