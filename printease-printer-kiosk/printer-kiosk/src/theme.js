import { createTheme } from "@mui/material/styles";

// PrintEase kiosk theme — a deep, confident blue rather than MUI's stock
// #1976d2, tuned for a screen viewed at arm's length across a room.
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1E4FD8", // ink blue
      dark: "#122F94",
      light: "#5B7BFF",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#00B37E", // used sparingly for success states
    },
    error: {
      main: "#E0342F",
    },
    background: {
      default: "#0B1230",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#101534",
      secondary: "#5B6178",
    },
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
    h1: { fontFamily: "'Outfit', 'Inter', sans-serif" },
    h2: { fontFamily: "'Outfit', 'Inter', sans-serif" },
    h3: { fontFamily: "'Outfit', 'Inter', sans-serif" },
    h4: { fontFamily: "'Outfit', 'Inter', sans-serif" },
    h5: { fontFamily: "'Outfit', 'Inter', sans-serif" },
    button: {
      fontFamily: "'Outfit', 'Inter', sans-serif",
      fontWeight: 600,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default theme;
