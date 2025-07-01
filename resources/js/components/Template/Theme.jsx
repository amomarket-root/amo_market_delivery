// src/components/Template/Theme.jsx
import { createTheme } from "@mui/material/styles";
import "./css/theme.css";

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: "#9F63FF",
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
          text: {
            primary: '#333333',
            secondary: '#666666',
          },
        }
      : {
          primary: {
            main: "#9F63FF",
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: '#bbbbbb',
          },
        }),
    success: {
      main: "#10d915",
    },
    error: {
      main: "#f27474",
    },
    warning: {
      main: "#f7e119",
    },
    secondary: {
      main: "#0f85d9",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

export default (mode) => createTheme(getDesignTokens(mode));
