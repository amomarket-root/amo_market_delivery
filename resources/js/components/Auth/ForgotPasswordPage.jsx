import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography, TextField, Button, Grid, Box } from "@mui/material";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSweetAlert } from '../Template/SweetAlert';
import { useSnackbar } from '../Template/SnackbarAlert';
import AuthLayout from '../Template/AuthLayout';
import "./css/ForgotPasswordPage.css";

const ForgotPasswordPage = () => {
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const apiUrl = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmailError("");
        setIsLoading(true);

        try {
            const response = await axios.post(
                `${apiUrl}/delivery/authenticate/forgot_password`,
                { email }
            );
            showSnackbar(response.data.message, { severity: 'success' }, 2000);
        } catch (error) {
            if (error.response?.data?.errors?.email) {
                setEmailError(error.response.data.errors.email[0]);
            } else {
                showAlert({
                    icon: "warning",
                    title: error.response?.data?.message || "An error occurred",
                    text: error.response?.data?.info || "Please try again later.",
                    showConfirmButton: true,
                    timer: 6000,
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
                <Grid item xs={12} md={6} order={1}>
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <div className="half-circle-forgot" />
                        <img
                            src="/image/forgot_password.webp"
                            alt="forgot_password"
                            style={{
                                maxWidth: "100%",
                                position: 'relative',
                                zIndex: 1
                            }}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={6} order={2} display="flex" justifyContent="center" alignItems="center">
                    <Card elevation={20} sx={{
                        maxWidth: "400px",
                        width: "100%",
                        borderRadius: 3,
                        marginLeft: !isMobile ? "100px" : "0",
                        backgroundColor: 'background.paper'
                    }}>
                        <CardContent>
                            <div>
                                <Typography variant="h5" gutterBottom color="text.primary">
                                    Hello! You forgot your credentials?
                                </Typography>
                                <Typography variant="h6" gutterBottom color="text.primary">
                                    <span style={{ textAlign: "right" }}>Enter your email to continue.</span>
                                </Typography>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    label="Email"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={!!emailError}
                                    helperText={emailError}
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
                                    {isLoading ? "Loading..." : "Submit"}
                                </Button>
                                <Typography variant="body1" align="center" sx={{ marginTop: 2 }} color="text.primary">
                                    Already have an account? <Link to="/login" style={{ color: 'inherit' }}>Sign In</Link>
                                </Typography>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
