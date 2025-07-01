import React, { createContext, useContext, useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Zoom, Box, CircularProgress } from '@mui/material';
import { CheckCircle, Warning, Error as ErrorIcon, Help } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { useTheme as useCustomTheme } from './ThemeContext';

const SweetAlertContext = createContext();
export const useSweetAlert = () => useContext(SweetAlertContext);

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const SweetAlertProvider = ({ children }) => {
    const muiTheme = useTheme();
    const { darkMode } = useCustomTheme();
    const [alertState, setAlertState] = useState(null);
    const [timerCount, setTimerCount] = useState(null);
    const [timerProgress, setTimerProgress] = useState(100);

    const iconAnimations = {
        success: `${pulse} 0.5s ease-in-out`,
        warning: `${bounce} 0.6s ease-in-out`,
        error: `${pulse} 0.3s ease-in-out 2`,
        question: `${rotate} 1s ease-in-out`
    };

    const getIconColor = () => {
        const colors = {
            light: {
                success: '#10d915',
                warning: '#f7e506',
                error: '#f27474',
                question: '#0f85d9'
            },
            dark: {
                success: '#4caf50',
                warning: '#ffc107',
                error: '#f44336',
                question: '#2196f3'
            }
        };
        return darkMode ? colors.dark : colors.light;
    };

    const iconMap = {
        success: (
            <Box sx={{ animation: iconAnimations.success }}>
                <CheckCircle
                    sx={{
                        fontSize: 80,
                        color: getIconColor().success,
                        mb: 1,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}
                />
            </Box>
        ),
        warning: (
            <Box sx={{ animation: iconAnimations.warning }}>
                <Warning
                    sx={{
                        fontSize: 80,
                        color: getIconColor().warning,
                        mb: 1,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}
                />
            </Box>
        ),
        error: (
            <Box sx={{ animation: iconAnimations.error }}>
                <ErrorIcon
                    sx={{
                        fontSize: 80,
                        color: getIconColor().error,
                        mb: 1,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}
                />
            </Box>
        ),
        question: (
            <Box sx={{ animation: iconAnimations.question }}>
                <Help
                    sx={{
                        fontSize: 80,
                        color: getIconColor().question,
                        mb: 1,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}
                />
            </Box>
        ),
    };

    const showAlert = useCallback((options) => {
        return new Promise((resolve) => {
            setAlertState({ ...options, resolve });

            if (options.timer) {
                const seconds = Math.floor(options.timer / 1000);
                setTimerCount(seconds);
                setTimerProgress(100);

                const interval = 1000;
                const steps = options.timer / interval;
                const stepValue = 100 / steps;

                const countdown = setInterval(() => {
                    setTimerCount(prev => {
                        if (prev <= 1) {
                            clearInterval(countdown);
                            setAlertState(null);
                            resolve(false);
                            return null;
                        }
                        return prev - 1;
                    });

                    setTimerProgress(prev => Math.max(0, prev - stepValue));
                }, interval);
            }
        });
    }, []);

    const handleClose = (confirmed) => {
        if (alertState?.resolve) {
            alertState.resolve(confirmed);
        }
        setAlertState(null);
        setTimerCount(null);
        setTimerProgress(100);
    };

    return (
        <SweetAlertContext.Provider value={showAlert}>
            {children}

            {alertState && (
                <Dialog
                    open
                    onClose={() => handleClose(false)}
                    sx={{
                        '& .MuiDialog-paper': {
                            width: '450px',
                            maxWidth: 'calc(100% - 32px)',
                            borderRadius: '12px',
                            overflow: 'visible',
                            backgroundColor: muiTheme.palette.background.paper,
                            color: muiTheme.palette.text.primary,
                        }
                    }}
                >
                    {timerCount !== null && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -15,
                                left: -15,
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                backgroundColor: muiTheme.palette.background.default,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Box position="relative">
                                <CircularProgress
                                    variant="determinate"
                                    value={timerProgress}
                                    size={50}
                                    thickness={4}
                                    sx={{
                                        color: getIconColor().success,
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        fontWeight: 'bold',
                                        fontSize: '0.875rem',
                                        color: muiTheme.palette.text.primary
                                    }}
                                >
                                    {timerCount}
                                </Box>
                            </Box>
                        </Box>
                    )}

                    <DialogTitle>
                        <Box textAlign="center" sx={{ pt: timerCount !== null ? 2 : 0 }}>
                            <Zoom in>
                                {iconMap[alertState.icon]}
                            </Zoom>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {alertState.title}
                            </Typography>
                        </Box>
                    </DialogTitle>

                    <DialogContent>
                        <Typography
                            textAlign="center"
                            sx={{
                                color: muiTheme.palette.text.secondary,
                                fontSize: '1rem'
                            }}
                        >
                            {alertState.text}
                        </Typography>
                    </DialogContent>

                    <DialogActions sx={{
                        justifyContent: 'center',
                        pb: 3,
                        px: 3,
                        '& > *': {
                            mx: 1,
                            minWidth: '100px'
                        }
                    }}>
                        {alertState.showCancelButton && (
                            <Button
                                variant="outlined"
                                onClick={() => handleClose(false)}
                                sx={{
                                    color: muiTheme.palette.error.main,
                                    borderColor: muiTheme.palette.error.main,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                    '&:hover': {
                                        backgroundColor: 'rgba(244, 67, 54, 0.08)',
                                        borderColor: muiTheme.palette.error.main,
                                    }
                                }}
                            >
                                {alertState.cancelButtonText || 'Cancel'}
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            onClick={() => handleClose(true)}
                            sx={{
                                color: '#fff',
                                backgroundColor: muiTheme.palette.primary.main,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: muiTheme.palette.primary.dark,
                                    boxShadow: 'none',
                                }
                            }}
                        >
                            {alertState.confirmButtonText || 'OK'}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </SweetAlertContext.Provider>
    );
};

export const SweetAlert = {
    success: (title, text = '', confirmButtonText = 'OK', options = {}) => {
        const showAlert = useSweetAlert();
        return showAlert({
            title,
            text,
            icon: 'success',
            confirmButtonText,
            ...options
        });
    },
    warning: (title, text = '', confirmButtonText = 'OK', options = {}) => {
        const showAlert = useSweetAlert();
        return showAlert({
            title,
            text,
            icon: 'warning',
            confirmButtonText,
            ...options
        });
    },
    error: (title, text = '', confirmButtonText = 'OK', options = {}) => {
        const showAlert = useSweetAlert();
        return showAlert({
            title,
            text,
            icon: 'error',
            confirmButtonText,
            ...options
        });
    },
    confirm: (title, text = '', confirmButtonText = 'Yes', cancelButtonText = 'Cancel', options = {}) => {
        const showAlert = useSweetAlert();
        return showAlert({
            title,
            text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText,
            ...options
        });
    },
};
