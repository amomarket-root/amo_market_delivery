import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, TextField, Button, Grid, Box } from "@mui/material";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSweetAlert } from '../Template/SweetAlert';
import { useSnackbar } from '../Template/SnackbarAlert';
import AuthLayout from '../Template/AuthLayout';
import "./css/RegisterPage.css";

const RegisterPage = () => {
    const navigate = useNavigate();
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password_confirmation, setPassword_confirmation] = useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");
    const apiUrl = import.meta.env.VITE_API_URL;

    const handleRegister = async (e) => {
        e.preventDefault();
        setNameError("");
        setEmailError("");
        setPasswordError("");
        setIsLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/delivery/authenticate/register`, {
                name,
                email,
                password,
                password_confirmation,
            });
            showAlert({
                icon: "success",
                title: response.data.message,
                text: response.data.info,
                showConfirmButton: true,
                timer: 6000,
                timerProgressBar: true,
                confirmButtonText: "OK",
            }).then(() => {
                navigate('/login');
            });
        } catch (error) {
            if (error.response?.data?.errors) {
                if (error.response.data.errors.name) {
                    setNameError(error.response.data.errors.name[0]);
                }
                if (error.response.data.errors.email) {
                    setEmailError(error.response.data.errors.email[0]);
                }
                if (error.response.data.errors.password) {
                    setPasswordError(error.response.data.errors.password[0]);
                }
            } else {
                showSnackbar(error.response?.data?.message || "Error occurred", { severity: 'error' }, 2000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Grid container spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                <Grid item xs={12} md={6} order={1}>
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%" position="relative">
                        <div className="half-circle-register" />
                        <img
                            src="/image/delivery_register.webp"
                            alt="register"
                            style={{
                                maxWidth: "80%",
                                position: 'relative',
                                zIndex: 1
                            }}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={6} order={2}>
                    <Card
                        elevation={20}
                        sx={{
                            maxWidth: "400px",
                            borderRadius: 3,
                            width: "100%",
                            height: "fit-content",
                            marginLeft: !isMobile ? "100px" : "0",
                            backgroundColor: 'background.paper'
                        }}
                    >
                        <CardContent sx={{ py: 0.6 }}>
                            <div>
                                <Typography variant="h5" gutterBottom color="text.primary">
                                    New here?
                                </Typography>
                                <Typography variant="h6" gutterBottom color="text.primary">
                                    <span style={{ textAlign: "right" }}>
                                        Signing up is easy. It only takes a few steps
                                    </span>
                                </Typography>
                            </div>
                            <form onSubmit={handleRegister}>
                                <TextField
                                    label="Name"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    error={!!nameError}
                                    helperText={nameError}
                                />
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
                                    label="Confirm Password"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={password_confirmation}
                                    onChange={(e) => setPassword_confirmation(e.target.value)}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    sx={{ marginTop: 1 }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Loading..." : "Sign Up"}
                                </Button>
                                <Typography variant="body1" align="center" sx={{ marginTop: 1 }} color="text.primary">
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

export default RegisterPage;
