import React from 'react';
import { useTheme } from './ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Animations (via keyframes as objects)
const fadeIn = {
  animation: 'fadeIn 1s ease-in-out',
  '@keyframes fadeIn': {
    '0%': { opacity: 0, transform: 'translateY(30px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
};

const float = {
  animation: 'float 3s ease-in-out infinite',
  '@keyframes float': {
    '0%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' },
    '100%': { transform: 'translateY(0)' },
  },
};

const NotFoundPage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const isTablet = useMediaQuery('(max-width:768px)');
  const isMobile = useMediaQuery('(max-width:480px)');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: darkMode ? '#121212' : '#f8f8f8',
        ...fadeIn,
      }}
    >
      <Box sx={{ maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
        <Box
          component="img"
          src="/image/page_not_found.webp"
          alt="404 Page Not Found"
          sx={{
            width: '95%',
            maxWidth: 400,
            filter: darkMode ? 'brightness(0.8)' : 'none',
            ...float,
          }}
        />
      </Box>

      <Box sx={{ maxWidth: 500 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: isMobile ? '2rem' : isTablet ? '2.5rem' : '3rem',
            color: darkMode ? '#ffffff' : '#333333',
            textShadow: '2px 4px 6px rgba(0, 0, 0, 0.3)',
            fontWeight: 'bold',
          }}
        >
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: isMobile ? '0.9rem' : isTablet ? '1rem' : '1.2rem',
            color: darkMode ? '#bbbbbb' : '#777777',
            mb: 1,
            mt: 1,
          }}
        >
          Oops! The page you are looking for does not exist.
        </Typography>

        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{
            backgroundColor: darkMode ? '#7d4acc' : '#9F63FF',
            color: 'white',
            padding: isMobile
              ? '7px 16px'
              : isTablet
              ? '8px 20px'
              : '10px 24px',
            borderRadius: '8px',
            fontSize: isMobile ? '0.9rem' : isTablet ? '1rem' : '1.2rem',
            textTransform: 'none',
            transition: 'all 0.3s ease',
            boxShadow: darkMode
              ? '0 4px 6px rgba(0, 0, 0, 0.3)'
              : '0 4px 6px rgba(159, 99, 255, 0.3)',
            '&:hover': {
              backgroundColor: darkMode ? '#6a3cb3' : '#8d27da',
              transform: 'translateY(-2px)',
              boxShadow: darkMode
                ? '0 6px 8px rgba(0, 0, 0, 0.4)'
                : '0 6px 8px rgba(159, 99, 255, 0.4)',
            },
          }}
        >
          Back to Previous Page
        </Button>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
