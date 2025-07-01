import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Box,
    CircularProgress,
    Grid,
    Paper,
    CardContent,
    Avatar,
    Chip,
    IconButton,
    Divider
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Verified as VerifiedIcon,
    Warning as WarningIcon,
    AccountBalance as BankIcon,
    Payment as PaymentIcon,
    AccountBalanceWallet as WalletIcon
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSweetAlert } from "../Template/SweetAlert";
import { useSnackbar } from "../Template/SnackbarAlert";

const DeliveryPersonBankAccount = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [bankAccounts, setBankAccounts] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentAccount, setCurrentAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingBankDetails, setIsFetchingBankDetails] = useState(false);
    const navigate = useNavigate();
    const showAlert = useSweetAlert();
    const showSnackbar = useSnackbar();

    const accountTypes = [
        { value: "savings", label: "Savings" },
        { value: "current", label: "Current" },
    ];

    const initialFormData = {
        account_holder_name: "",
        account_number: "",
        bank_name: "",
        branch_name: "",
        ifsc_code: "",
        account_type: "savings",
        upi_id: "",
    };

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const fetchBankAccounts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${apiUrl}/delivery/get_delivery_person_bank-accounts`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("delivery_token")}`,
                    },
                }
            );

            if (response.data.status) {
                setBankAccounts(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching bank accounts:", error);
            showSnackbar("Failed to fetch bank accounts", { severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBankDetailsByIFSC = async (ifsc) => {
        if (!ifsc) return;

        setIsFetchingBankDetails(true);
        try {
            const response = await axios.get(
                `${apiUrl}/ifsc-lookup/${ifsc}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("delivery_token")}`,
                    },
                }
            );
            if (response.data) {
                setFormData(prev => ({
                    ...prev,
                    bank_name: response.data.BANK,
                    branch_name: response.data.BRANCH
                }));
            }
        } catch (error) {
            console.error("Error fetching bank details:", error);
            showSnackbar("Invalid IFSC code or failed to fetch bank details", { severity: 'error' });
        } finally {
            setIsFetchingBankDetails(false);
        }
    };

    const handleOpenDialog = (account = null) => {
        if (account) {
            setCurrentAccount(account);
            setFormData({
                account_holder_name: account.account_holder_name,
                account_number: account.account_number,
                bank_name: account.bank_name,
                branch_name: account.branch_name,
                ifsc_code: account.ifsc_code,
                account_type: account.account_type,
                upi_id: account.upi_id || "",
            });
        } else {
            setCurrentAccount(null);
            setFormData(initialFormData);
        }
        setOpenDialog(true);
        setErrors({});
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleIFSCBlur = async () => {
        if (formData.ifsc_code && formData.ifsc_code.length === 11) {
            await fetchBankDetailsByIFSC(formData.ifsc_code);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.account_holder_name.trim()) {
            newErrors.account_holder_name = "Account holder name is required";
        }
        if (!formData.account_number.trim()) {
            newErrors.account_number = "Account number is required";
        }
        if (!formData.bank_name.trim()) {
            newErrors.bank_name = "Bank name is required";
        }
        if (!formData.branch_name.trim()) {
            newErrors.branch_name = "Branch name is required";
        }
        if (!formData.ifsc_code.trim()) {
            newErrors.ifsc_code = "IFSC code is required";
        } else if (formData.ifsc_code.length !== 11) {
            newErrors.ifsc_code = "IFSC code must be 11 characters";
        }
        if (!formData.account_type) {
            newErrors.account_type = "Account type is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            if (currentAccount) {
                // Update existing account
                await axios.put(
                    `${apiUrl}/delivery/update_delivery_person_bank-accounts/${currentAccount.id}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("delivery_token")}`,
                        },
                    }
                );
                showSnackbar("Bank account updated successfully", { severity: 'success' });
            } else {
                // Create new account
                await axios.post(
                    `${apiUrl}/delivery/store_delivery_person_bank-accounts`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("delivery_token")}`,
                        },
                    }
                );
                showSnackbar("Bank account created successfully", { severity: 'success' });
            }
            fetchBankAccounts();
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving bank account:", error);
            const errorMessage = error.response?.data?.message || "Failed to save bank account";
            showAlert({
                title: "Error",
                text: errorMessage,
                icon: "error",
                timer: 6000,
                showConfirmButton: true,
                confirmButtonText: "OK",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await showAlert({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (!result) return;

        try {
            await axios.delete(
                `${apiUrl}/delivery/delete_delivery_person_bank-accounts/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("delivery_token")}`,
                    },
                }
            );
            showSnackbar("Bank account deleted successfully", { severity: 'success' });
            fetchBankAccounts();
        } catch (error) {
            console.error("Error deleting bank account:", error);
            showSnackbar("Failed to delete bank account", { severity: 'error' });
        }
    };

    const getBankAvatarColor = (bankName) => {
        // Simple hash function to generate consistent colors for bank names
        let hash = 0;
        for (let i = 0; i < bankName.length; i++) {
            hash = bankName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [
            '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
            '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
            '#8bc34a', '#cddc39', '#ffc107', '#ff9800', '#ff5722'
        ];
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <Container maxWidth="xl" sx={{ py: 1 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                    flexWrap: 'wrap',
                    gap: 2
                }}
            >
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Bank Accounts
                </Typography>
            </Box>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : bankAccounts.length === 0 ? (
                <Paper
                    sx={{
                        display: 'flex',
                        borderRadius: '10px',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px',
                        textAlign: 'center',
                        p: 4,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 3
                        }
                    }}
                    elevation={10}
                >
                    <WalletIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        No Bank Accounts Added
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Add your bank account to receive payments for your deliveries.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Your First Account
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {bankAccounts.map((account) => (
                        <Grid item xs={12} key={account.id}>
                            <Paper
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    borderRadius: '10px',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 3
                                    }
                                }}
                                elevation={10}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2,
                                        gap: 2
                                    }}>
                                        <Avatar
                                            sx={{
                                                bgcolor: getBankAvatarColor(account.bank_name),
                                                width: 48,
                                                height: 48
                                            }}
                                        >
                                            <BankIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" component="div">
                                                {account.bank_name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} Account
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Account Holder
                                        </Typography>
                                        <Typography variant="body1">
                                            {account.account_holder_name}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Account Number
                                        </Typography>
                                        <Typography variant="body1">
                                            ••••••••{account.account_number.slice(-4)}
                                        </Typography>
                                    </Box>

                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                IFSC Code
                                            </Typography>
                                            <Typography variant="body1">
                                                {account.ifsc_code}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Branch
                                            </Typography>
                                            <Typography variant="body1">
                                                {account.branch_name}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    {account.upi_id && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                UPI ID
                                            </Typography>
                                            <Typography variant="body1">
                                                {account.upi_id}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>

                                <Box
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        borderTop: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Chip
                                        icon={account.is_verified ? <VerifiedIcon /> : <WarningIcon />}
                                        label={account.is_verified ? "Verified" : "Pending"}
                                        color={account.is_verified ? "success" : "warning"}
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Box>
                                        <IconButton
                                            onClick={() => handleOpenDialog(account)}
                                            color="primary"
                                            size="small"
                                            sx={{
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                mr: 1
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(account.id)}
                                            color="error"
                                            size="small"
                                            sx={{
                                                backgroundColor: 'error.main',
                                                color: 'white',
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    {currentAccount ? "Edit Bank Account" : "Add New Bank Account"}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }}>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Account Holder Name"
                            name="account_holder_name"
                            value={formData.account_holder_name}
                            onChange={handleInputChange}
                            error={!!errors.account_holder_name}
                            helperText={errors.account_holder_name}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Account Number"
                            name="account_number"
                            value={formData.account_number}
                            onChange={handleInputChange}
                            error={!!errors.account_number}
                            helperText={errors.account_number}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="IFSC Code"
                            name="ifsc_code"
                            value={formData.ifsc_code}
                            onChange={handleInputChange}
                            onBlur={handleIFSCBlur}
                            error={!!errors.ifsc_code}
                            helperText={errors.ifsc_code || "Enter 11 character IFSC code to auto-fill bank details"}
                            InputProps={{
                                endAdornment: isFetchingBankDetails ? (
                                    <CircularProgress size={24} />
                                ) : null,
                            }}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Bank Name"
                            name="bank_name"
                            value={formData.bank_name}
                            onChange={handleInputChange}
                            error={!!errors.bank_name}
                            helperText={errors.bank_name}
                            disabled
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Branch Name"
                            name="branch_name"
                            value={formData.branch_name}
                            onChange={handleInputChange}
                            error={!!errors.branch_name}
                            helperText={errors.branch_name}
                            disabled
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            select
                            label="Account Type"
                            name="account_type"
                            value={formData.account_type}
                            onChange={handleInputChange}
                            error={!!errors.account_type}
                            helperText={errors.account_type}
                        >
                            {accountTypes.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="UPI ID (Optional)"
                            name="upi_id"
                            value={formData.upi_id}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <PaymentIcon color="action" sx={{ mr: 1 }} />,
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                   <Button
                        onClick={handleCloseDialog}
                        disabled={isSubmitting}
                        variant="contained"
                        color="error"
                        sx={{ color: "white" }}
                    >
                        Close
                    </Button>
                    <Button
                       onClick={handleSubmit}
                        variant="contained"
                        disabled={isSubmitting}
                        color="success"
                        sx={{ color: "white" }}
                    >
                        {isSubmitting ? (
                            <CircularProgress size={24} />
                        ) : currentAccount ? (
                            "Update"
                        ) : (
                            "Create"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DeliveryPersonBankAccount;
