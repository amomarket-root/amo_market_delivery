import React from 'react';
import { Box, Container } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useTheme } from './ThemeContext';
import createAppTheme from './Theme';
import FloatingThemeToggle from './FloatingThemeToggle';

const AuthLayout = ({ children }) => {
    const { darkMode } = useTheme();

    return (
        <MuiThemeProvider theme={createAppTheme(darkMode ? 'dark' : 'light')}>
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    color: 'text.primary',
                    p: 2,
                    position: 'fixed',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    {children}
                </Container>
                <FloatingThemeToggle />
            </Box>
        </MuiThemeProvider>
    );
};

export default AuthLayout;
