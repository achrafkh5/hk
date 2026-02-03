'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress, Typography, IconButton, AppBar, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import adminTheme from '@/lib/adminTheme';
import Sidebar, { SIDEBAR_WIDTH } from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (status === 'loading') return;

    // Redirect if not authenticated or not admin
    if (!session || session.user?.role !== 'admin') {
      router.push('/login');
    }
  }, [session, status, router]);

  // Show loading state
  if (status === 'loading') {
    return (
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      </ThemeProvider>
    );
  }

  // Show nothing while redirecting
  if (!session || session.user?.role !== 'admin') {
    return (
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            gap: 2,
          }}
        >
          <Typography color="text.secondary">
            Access denied. Redirecting...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', overflowX: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            marginLeft: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
            bgcolor: 'background.default',
            minHeight: '100vh',
            overflowX: 'hidden',
            width: { xs: '100vw', md: `calc(100vw - ${SIDEBAR_WIDTH}px)` },
          }}
        >
          {/* Mobile App Bar */}
          {isMobile && (
            <AppBar
              position="fixed"
              sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: 1,
              }}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div">
                  LUX Admin
                </Typography>
              </Toolbar>
            </AppBar>
          )}

          {/* Content with padding */}
          <Box sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 8, md: 0 } }}>
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
