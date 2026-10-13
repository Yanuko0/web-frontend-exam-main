import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#EE8D2B', dark: '#C9731A', contrastText: '#FFFFFF' },
    error: { main: '#D95B48' },
    grey: {
      100: '#F0F0F0', 300: '#CCCCCC', 500: '#999999', 700: '#666666', 800: '#4D4D4D', 900: '#222222',
    },
    text: { primary: '#222222', secondary: '#666666' },
  },
  typography: {
    fontFamily: '"Noto Sans TC", "Noto Sans", "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Respect the OS "reduce motion" setting everywhere.
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
  },
});

export default theme;
