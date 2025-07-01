// src/components/Template/Layout.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import createAppTheme from './Theme';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider, useTheme } from './ThemeContext';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const LayoutContent = ({ children }) => {
    const { darkMode } = useTheme();
    const [showScroll, setShowScroll] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [children]);

    useEffect(() => {
        const handleScroll = () => {
            setShowScroll(window.scrollY > 200);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <MuiThemeProvider theme={createAppTheme(darkMode ? 'dark' : 'light')}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    color: 'text.primary',
                }}
            >
                <Header />
                <Box component="main" sx={{ flex: 1, pt: 4, pb: 2, px: 2 }}>
                    {children}
                </Box>
                <Footer />
                {showScroll && (
                    <Tooltip title="Scroll To Top" arrow>
                        <IconButton
                            onClick={scrollToTop}
                            sx={{
                                position: 'fixed',
                                bottom: 16,
                                right: 16,
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': { backgroundColor: 'primary.dark' },
                                width: 48,
                                height: 48,
                                boxShadow: 5,
                            }}
                        >
                            <ArrowUpwardIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        </MuiThemeProvider>
    );
};

const Layout = ({ children }) => (
    <ThemeProvider>
        <LayoutContent children={children} />
    </ThemeProvider>
);

export default Layout;
