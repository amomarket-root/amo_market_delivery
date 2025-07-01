// src/App.jsx
import React, { useEffect, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { SweetAlertProvider } from './components/Template/SweetAlert';
import { ThemeProvider, useTheme } from './components/Template/ThemeContext';
import createAppTheme from './components/Template/Theme';
import ReactGA from 'react-ga4';
import '../css/app.css';
import './bootstrap';

const queryClient = new QueryClient();
const DeliveryRoutes = lazy(() => import('./components/Route/DeliveryRoutes'));
const loaderGif = '/image/loader.gif';

const ThemeWrapper = ({ children }) => {
    const { darkMode } = useTheme();
    return (
        <MuiThemeProvider theme={createAppTheme(darkMode ? 'dark' : 'light')}>
            {children}
        </MuiThemeProvider>
    );
};

const App = () => {
    useEffect(() => {
        ReactGA.initialize('G-ERV17HSB66');
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <ThemeWrapper>
                    <SweetAlertProvider>
                        <Suspense fallback={
                            <div className="loader-container">
                                <img src={loaderGif} alt="Loading..." className="loader" />
                            </div>
                        }>
                            <Routes>
                                <Route path="/*" element={<DeliveryRoutes />} />
                            </Routes>
                        </Suspense>
                    </SweetAlertProvider>
                </ThemeWrapper>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;

const root = createRoot(document.getElementById('app'));
root.render(
    <Router>
        <App />
    </Router>
);
