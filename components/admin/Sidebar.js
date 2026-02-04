'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Drawer,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';

const SIDEBAR_WIDTH = 240;

const navItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Statistics', href: '/admin/statistics' },
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: '/login'
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* App Name */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography
          variant="h6"
          sx={{
            color: 'text.primary',
            fontWeight: 700,
            letterSpacing: '-0.5px',
          }}
        >
          CHZ Store Admin
        </Typography>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flex: 1, py: 2, px: 1.5 }}>
        <List disablePadding>
          {navItems.map((item) => (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isActive(item.href)}
                onClick={isMobile ? onMobileClose : undefined}
                sx={{
                  py: 1.25,
                  px: 2,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.lighter',
                    '&:hover': {
                      bgcolor: 'primary.lighter',
                    },
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive(item.href) ? 600 : 400,
                    color: isActive(item.href) ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ px: 2, py: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          size="small"
          onClick={handleLogout}
          sx={{ mb: 1 }}
        >
          Log Out
        </Button>
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          © 2026 CHZ Store
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          component="aside"
          sx={{
            width: SIDEBAR_WIDTH,
            minWidth: SIDEBAR_WIDTH,
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            borderRight: 1,
            borderColor: 'divider',
          }}
        >
          {sidebarContent}
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}
    </>
  );
}

export { SIDEBAR_WIDTH };
