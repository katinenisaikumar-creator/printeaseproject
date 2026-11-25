import { createTheme } from '@mui/material/styles';

// PrintEase Admin — Indigo SaaS theme
// Matches the color used in the PrintEase Flutter student app.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#283593',
      light: '#5f5cc4',
      dark: '#001064',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#5C6BC0',
    },
    background: {
      default: '#F5F7FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1F36',
      secondary: '#697386',
    },
    success: { main: '#2E7D32', light: '#E8F5E9' },
    warning: { main: '#ED6C02', light: '#FFF4E5' },
    error: { main: '#D32F2F', light: '#FDECEA' },
    info: { main: '#0288D1', light: '#E5F6FD' },
    divider: '#EDEFF5',
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(20, 26, 62, 0.06)',
    '0px 4px 12px rgba(20, 26, 62, 0.07)',
    '0px 6px 16px rgba(20, 26, 62, 0.08)',
    ...Array(21).fill('0px 8px 24px rgba(20, 26, 62, 0.08)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F5F7FB',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #EDEFF5',
          boxShadow: '0px 2px 8px rgba(20, 26, 62, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingLeft: 18,
          paddingRight: 18,
        },
        containedPrimary: {
          boxShadow: '0px 4px 10px rgba(40, 53, 147, 0.25)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#697386',
          backgroundColor: '#FAFBFE',
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        },
      },
    },
  },
});

export default theme;
