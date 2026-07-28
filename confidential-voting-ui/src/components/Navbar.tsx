import React, { useState, useEffect } from 'react';
import { Box, Stack, Button, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Features', path: '/features' },
  { label: 'Architecture', path: '/architecture' },
  { label: 'Demo', path: '/demo' },
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1200,
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        sx={{
          alignItems: 'center',
          px: 1.5,
          py: 0.75,
          borderRadius: '100px',
          bgcolor: scrolled ? 'rgba(9, 9, 12, 0.92)' : 'rgba(9, 9, 12, 0.7)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          border: '1px solid',
          borderColor: scrolled ? '#27272a' : '#18181b',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.6)' : '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Logo */}
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: 'center', pr: 1.5, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <LockOutlinedIcon sx={{ fontSize: 16, color: '#ffffff' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
            MN Vote
          </Typography>
        </Stack>

        {/* Divider */}
        <Box sx={{ width: '1px', height: 20, bgcolor: '#27272a' }} />

        {/* Nav items */}
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                px: 1.75,
                py: 0.6,
                minWidth: 'auto',
                borderRadius: '100px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: isActive ? '#ffffff' : '#71717a',
                bgcolor: isActive ? '#ffffff12' : 'transparent',
                '&:hover': {
                  bgcolor: isActive ? '#ffffff18' : '#ffffff08',
                  color: '#ffffff',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </Button>
          );
        })}

        {/* CTA */}
        <Box sx={{ width: '1px', height: 20, bgcolor: '#27272a', ml: 0.5 }} />
        <Button
          onClick={() => navigate('/app')}
          sx={{
            px: 2,
            py: 0.6,
            ml: 0.5,
            borderRadius: '100px',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#000000',
            bgcolor: '#ffffff',
            '&:hover': { bgcolor: '#e4e4e7' },
          }}
        >
          Launch App
        </Button>
      </Stack>
    </Box>
  );
};
