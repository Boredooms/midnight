import { createTheme } from '@mui/material';

export const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Outfit", system-ui, -apple-system, sans-serif',
    allVariants: {
      color: '#ffffff',
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
      light: '#ffffff',
      dark: '#e4e4e7',
    },
    secondary: {
      main: '#a1a1aa',
    },
    background: {
      default: '#030304',
      paper: '#09090c',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#030304',
          color: '#ffffff',
          overflowX: 'hidden',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#09090c',
          backgroundImage: 'none',
          borderColor: '#18181b',
          borderRadius: 16,
          transition:
            'transform 0.25s ease-out, border-color 0.25s ease-out, box-shadow 0.25s ease-out',
          '&:hover': {
            borderColor: '#3f3f46',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.8)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          backgroundColor: '#ffffff',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#e4e4e7',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: '#27272a',
          color: '#ffffff',
          '&:hover': {
            borderColor: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
  },
});
