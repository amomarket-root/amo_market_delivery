import React, { useState } from "react";
import { Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, InputAdornment, CircularProgress, Box, Grid } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useSweetAlert } from '../Template/SweetAlert';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MenuSection = ({ anchorEl, isMenuOpen, handleMenuClose, apiUrl }) => {
    const navigate = useNavigate();
    const showAlert = useSweetAlert();
    const [oldPasswordError, setOldPasswordError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [viewProfileOpen, setViewProfileOpen] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [passwordFormData, setPasswordFormData] = useState({
        old_password: "",
        password: "",
        password_confirmation: ""
    });
    const [showPassword, setShowPassword] = useState({
        old_password: false,
        password: false,
        password_confirmation: false
    });
    const [profileData, setProfileData] = useState(null);
    const [user, setUser] = useState(null);
    const [name, setName] = useState("");
    const [roleName, setRoleName] = useState("");
    const [email, setEmail] = useState("");

    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");

    const [loading, setLoading] = useState(false);

    const handleProfileUpdate = () => {
        setNameError('');
        setEmailError('');
        setLoading(true);

        const delivery_token = localStorage.getItem('delivery_token');
        const formData = new FormData();
        formData.append('user_id', user);
        formData.append('name', name);
        formData.append('role_id', roleName);
        formData.append('email', email);

        axios.post(`${apiUrl}/delivery/update_profile`, formData, {
            headers: {
                Authorization: `Bearer ${delivery_token}`,
            },
        })
            .then(response => {
                const userData = response.data;
                showAlert({
                    icon: "success",
                    title: "Success!",
                    text: userData.message,
                }).then(() => {
                    handleCloseViewProfileDialog();
                    navigate('/dashboard');
                });
            })
            .catch(error => {
                setLoading(false);
                if (error.response) {
                    if (error.response.data && error.response.data.errors) {
                        if (error.response.data.errors.name) {
                            setNameError(error.response.data.errors.name[0]);
                        }
                        if (error.response.data.errors.email) {
                            setEmailError(error.response.data.errors.email[0]);
                        }
                    } else if (error.response.data.message) {
                        showAlert({
                            title: "Error!",
                            text: error.response.data.message,
                            icon: "error",
                        });
                    }
                } else {
                    showAlert({
                        title: "Error!",
                        text: "Server error or network issue. Please try again later.",
                        icon: "error",
                    });
                }
            });
    };

    const handleViewProfile = async () => {
        setViewProfileOpen(true);
        handleMenuClose();
        setLoading(true);
        const delivery_token = localStorage.getItem("delivery_token");
        if (!delivery_token) return;

        try {
            const profileResponse = await axios.get(`${apiUrl}/delivery/view_profile`, {
                headers: {
                    Authorization: `Bearer ${delivery_token}`
                }
            });

            if (profileResponse.data.status) {
                const userData = profileResponse.data.user;
                setProfileData(userData);
                setUser(userData.id);
                setName(userData.name);
                setRoleName(userData.role_id);
                setEmail(userData.email);
            } else {
                showAlert({
                    title: "Error!",
                    text: "Failed to fetch profile details.",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseViewProfileDialog = () => {
        setViewProfileOpen(false);
        setProfileData(null);
    };

    const handleLogout = async () => {
        const delivery_token = localStorage.getItem('delivery_token');
        try {
            const response = await axios.post(
                `${apiUrl}/delivery/logout`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${delivery_token}`
                    }
                }
            );

            if (response.status === 200 && response.data.status === true) {
                showAlert({
                    title: "Success",
                    text: response.data.message || "Logout successful",
                    icon: "success",
                    showConfirmButton: true,
                    timer: 2000,
                    timerProgressBar: true,
                }).then(() => {
                    localStorage.clear();
                    navigate("/login");
                    window.location.reload();
                });
            } else {
                navigate("/login");
            }
        } catch (error) {
            console.error("Logout failed:", error);
            navigate("/login");
        }
        handleMenuClose();
    };

    const handleChangePassword = () => {
        setChangePasswordOpen(true);
        handleMenuClose();
    };

    const handleCloseChangePasswordDialog = () => {
        setChangePasswordOpen(false);
        setPasswordFormData({
            old_password: "",
            password: "",
            password_confirmation: ""
        });
    };

    const handlePasswordFormChange = (event) => {
        const { name, value } = event.target;
        setPasswordFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleToggleShowPassword = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordFormSubmit = () => {
        setOldPasswordError("");
        setPasswordError("");

        const delivery_token = localStorage.getItem("delivery_token");

        axios
            .post(`${apiUrl}/delivery/change_password`, passwordFormData, {
                headers: {
                    Authorization: `Bearer ${delivery_token}`
                }
            })
            .then((response) => {
                showAlert({
                    title: "Success!",
                    text: response.data.message,
                    icon: "success",
                });
                handleCloseChangePasswordDialog();
            })
            .catch((error) => {
                if (error.response && error.response.data.errors) {
                    const errors = error.response.data.errors;
                    if (errors.old_password) setOldPasswordError(errors.old_password[0]);
                    if (errors.password) setPasswordError(errors.password[0]);
                } else {
                    showAlert({
                        title: "Error!",
                        text: "Server error or network issue. Please try again later.",
                        icon: "error",
                    });
                }
            });
    };

    return (
        <>
            <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button"
                }}
            >
                <MenuItem
                    onClick={handleViewProfile}
                    sx={{
                        color: "#3f51b5",
                        "&:hover": { backgroundColor: "#e8eaf6" },
                        borderRadius: 8
                    }}
                >
                    <IconButton>
                        <PersonIcon sx={{ color: "#3f51b5" }} />
                    </IconButton>
                    View Profile
                </MenuItem>
                <MenuItem
                    onClick={handleChangePassword}
                    sx={{
                        color: "#F8B311",
                        "&:hover": { backgroundColor: "#F2FB9A" },
                        borderRadius: 8
                    }}
                >
                    <IconButton>
                        <LockIcon sx={{ color: "#F8B311" }} />
                    </IconButton>
                    Change Password
                </MenuItem>
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: "#f44336",
                        "&:hover": { backgroundColor: "#ffcdd2" },
                        borderRadius: 8
                    }}
                >
                    <IconButton>
                        <LogoutIcon sx={{ color: "#f44336" }} />
                    </IconButton>
                    Logout
                </MenuItem>
            </Menu>

            {/* View Profile Dialog */}
            <Dialog
                open={viewProfileOpen}
                onClose={handleCloseViewProfileDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>View Profile</DialogTitle>
                <DialogContent>
                    {loading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 1
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : profileData ? (
                        <div style={{ textAlign: "center" }}>
                            <TextField
                                margin="dense"
                                label="Email"
                                type="email"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={!!emailError}
                                helperText={emailError}
                                variant="outlined"
                                sx={{ mb: 1 }}
                            />

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        margin="dense"
                                        label="Name"
                                        type="text"
                                        fullWidth
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        error={!!nameError}
                                        helperText={nameError}
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </div>
                    ) : (
                        <p>No profile data available.</p>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={handleCloseViewProfileDialog}
                        variant="contained"
                        color="error"
                        sx={{ color: "white" }}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={handleProfileUpdate}
                        variant="contained"
                        color="success"
                        sx={{ color: "white" }}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog
                open={changePasswordOpen}
                onClose={handleCloseChangePasswordDialog}
            >
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        name="old_password"
                        label="Old Password"
                        type={showPassword.old_password ? "text" : "password"}
                        fullWidth
                        value={passwordFormData.old_password}
                        onChange={handlePasswordFormChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => handleToggleShowPassword("old_password")}
                                        edge="end"
                                    >
                                        {showPassword.old_password ? (
                                            <VisibilityOff />
                                        ) : (
                                            <Visibility />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        error={!!oldPasswordError}
                        helperText={oldPasswordError}
                    />
                    <TextField
                        margin="dense"
                        name="password"
                        label="New Password"
                        type={showPassword.password ? "text" : "password"}
                        fullWidth
                        value={passwordFormData.password}
                        onChange={handlePasswordFormChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => handleToggleShowPassword("password")}
                                        edge="end"
                                    >
                                        {showPassword.password ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        error={!!passwordError}
                        helperText={passwordError}
                    />
                    <TextField
                        margin="dense"
                        name="password_confirmation"
                        label="Confirm Password"
                        type={showPassword.password_confirmation ? "text" : "password"}
                        fullWidth
                        value={passwordFormData.password_confirmation}
                        onChange={handlePasswordFormChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            handleToggleShowPassword("password_confirmation")
                                        }
                                        edge="end"
                                    >
                                        {showPassword.password_confirmation ? (
                                            <VisibilityOff />
                                        ) : (
                                            <Visibility />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseChangePasswordDialog}
                        variant="contained"
                        color="error"
                        sx={{ color: "white" }}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={handlePasswordFormSubmit}
                        variant="contained"
                        color="success"
                        sx={{ color: "white" }}
                    >
                        Change
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default MenuSection;
