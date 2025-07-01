import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, TextField, Button, Grid, Box } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSweetAlert } from '../Template/SweetAlert';
import { useSnackbar } from '../Template/SnackbarAlert';
import AuthLayout from '../Template/AuthLayout';
import "./css/LoginPage.css";

const LoginPage = () => {
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setEmailError('');
        setPasswordError('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/delivery/authenticate/login`, {
                email,
                password
            });

            if (localStorage.getItem('delivery_token')) {
                localStorage.removeItem('delivery_token');
                localStorage.removeItem('delivery_person_id');
            }

            showSnackbar(response.data.message, { severity: 'success' });
            setTimeout(() => {
                localStorage.setItem('delivery_token', response.data.delivery_token);
                localStorage.setItem('delivery_person_id', response.data.delivery_person_id);
                navigate('/permission');
            }, 2000);

        } catch (error) {
            if (error.response?.data?.errors) {
                if (error.response.data.errors.email) {
                    setEmailError(error.response.data.errors.email[0]);
                }
                if (error.response.data.errors.password) {
                    setPasswordError(error.response.data.errors.password[0]);
                }
            } else {
                showAlert({
                    title: error.response?.data?.message || 'Error',
                    text: error.response?.data?.info || 'An error occurred during login',
                    icon: "warning",
                    timer: 6000,
                    showConfirmButton: true,
                    timerProgressBar: true,
                    confirmButtonText: "OK",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Grid container spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                <Grid item xs={12} md={6} order={isMobile ? 2 : 1}>
                    <Card elevation={20} sx={{
                        maxWidth: '400px',
                        width: '100%',
                        borderRadius: 3,
                        backgroundColor: 'background.paper'
                    }}>
                        <CardContent>
                            <div>
                                <Typography variant="h5" gutterBottom color="text.primary">
                                    Hello! Let's get started
                                </Typography>
                                <Typography variant="h6" gutterBottom color="text.primary">
                                    <span style={{ textAlign: 'right' }}>Sign in to continue.</span>
                                </Typography>
                            </div>
                            <form onSubmit={handleLogin}>
                                <TextField
                                    label="Email"
                                    placeholder="Enter Email"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={!!emailError}
                                    helperText={emailError}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />

                                <TextField
                                    label="Password"
                                    placeholder="Enter Password"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    error={!!passwordError}
                                    helperText={passwordError}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    sx={{ marginTop: 2 }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Loading...' : 'Login'}
                                </Button>
                                <Typography variant="body1" align="center" sx={{ marginTop: 2 }} color="text.primary">
                                    <Link to="/forgotPassword" style={{ color: 'inherit' }}>Forgot Password?</Link>
                                </Typography>
                                <Typography variant="body1" align="center" color="text.primary">
                                    Don't have an account? <Link to="/register" style={{ color: 'inherit' }}>Sign Up</Link>
                                </Typography>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} order={isMobile ? 1 : 2}>
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <div className="half-circle-login" />
                        <img
                            src="/image/delivery_login.webp"
                            alt="login"
                            style={{
                                maxWidth: '80%',
                                position: 'relative',
                                zIndex: 1
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </AuthLayout>
    );
};

export default LoginPage;
