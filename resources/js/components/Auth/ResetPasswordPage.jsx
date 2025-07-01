import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, TextField, Button, Grid, Box } from "@mui/material";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSweetAlert } from '../Template/SweetAlert';
import { useSnackbar } from '../Template/SnackbarAlert';
import AuthLayout from '../Template/AuthLayout';
import "./css/ResetPasswordPage.css";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordConfirmationError, setPasswordConfirmationError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const apiUrl = import.meta.env.VITE_API_URL;

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordConfirmationError("");
        setIsLoading(true);

        try {
            const token = new URLSearchParams(window.location.search).get("token");
            const response = await axios.post(
                `${apiUrl}/delivery/authenticate/reset_password?token=${token}`,
                {
                    password,
                    password_confirmation: passwordConfirmation,
                }
            );
            showSnackbar(response.data.message, { severity: 'success' });
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            if (error.response?.data?.errors) {
                if (error.response.data.errors.password) {
                    setPasswordError(error.response.data.errors.password[0]);
                }
                if (error.response.data.errors.password_confirmation) {
                    setPasswordConfirmationError(error.response.data.errors.password_confirmation[0]);
                }
            } else {
                showAlert({
                    icon: "warning",
                    title: error.response?.data?.message || "Error",
                    text: error.response?.data?.info || "An error occurred",
                    showConfirmButton: true,
                    timer: 20000,
                    timerProgressBar: true,
                    confirmButtonText: "OK",
                }).then(() => {
                    navigate('/forgotPassword');
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Grid container spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                <Grid item xs={12} md={6} order={isMobile ? 2 : 1} display="flex" justifyContent="center" alignItems="center">
                    <Card elevation={20} sx={{
                        maxWidth: "400px",
                        width: "100%",
                        borderRadius: 3,
                        backgroundColor: 'background.paper'
                    }}>
                        <CardContent>
                            <div>
                                <Typography variant="h5" gutterBottom color="text.primary">
                                    Hello! Just enter a new password
                                </Typography>
                                <Typography variant="h6" gutterBottom color="text.primary">
                                    <span style={{ textAlign: "right" }}>
                                        Update password to continue.
                                    </span>
                                </Typography>
                            </div>
                            <form onSubmit={handleResetPassword}>
                                <TextField
                                    label="Password"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    error={!!passwordError}
                                    helperText={passwordError}
                                />
                                <TextField
                                    label="Password Confirmation"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    error={!!passwordConfirmationError}
                                    helperText={passwordConfirmationError}
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
                                    {isLoading ? "Updating..." : "Update"}
                                </Button>
                                <Typography variant="body1" align="center" sx={{ marginTop: 2 }} color="text.primary">
                                    Sign in with old credentials? <Link to="/login" style={{ color: 'inherit' }}>Sign In</Link>
                                </Typography>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6} order={isMobile ? 1 : 2}>
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <div className="half-circle-reset" />
                        <img
                            src="/image/reset_password.webp"
                            alt="reset_password"
                            style={{
                                maxWidth: "100%",
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

export default ResetPasswordPage;
