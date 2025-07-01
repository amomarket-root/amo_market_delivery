import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField,
    InputAdornment, IconButton, styled, CircularProgress, Alert, Snackbar,
    FormControl, InputLabel, Select, MenuItem, FormHelperText, Box, Typography, Avatar
} from '@mui/material';
import MyLocationTwoToneIcon from '@mui/icons-material/MyLocationTwoTone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useSweetAlert } from '../Template/SweetAlert';

// Styled hidden file input
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const FilePreview = ({ file, onRemove }) => {
    const isImage = file?.type?.startsWith('image/');
    const isPDF = file?.type === 'application/pdf';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {isImage ? (
                <Avatar src={URL.createObjectURL(file)} variant="rounded" sx={{ width: 56, height: 56 }} />
            ) : isPDF ? (
                <PictureAsPdfIcon color="error" sx={{ fontSize: 40 }} />
            ) : (
                <InsertDriveFileIcon color="action" sx={{ fontSize: 40 }} />
            )}
            <Box sx={{ ml: 1 }}>
                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                    {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(2)} KB
                </Typography>
            </Box>
            <IconButton size="small" onClick={onRemove} sx={{ ml: 1 }}>
                ×
            </IconButton>
        </Box>
    );
};

const PermissionPage = () => {
    const navigate = useNavigate();
    const showAlert = useSweetAlert();
    const [loading, setLoading] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;
    const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // State for delivery person details
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [drivingLicense, setDrivingLicense] = useState('');
    const [licenseDocument, setLicenseDocument] = useState(null);
    const [panNumber, setPanNumber] = useState('');
    const [panPhoto, setPanPhoto] = useState(null);
    const [deliveryMode, setDeliveryMode] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    // Upload status states
    const [licenseUploaded, setLicenseUploaded] = useState(false);
    const [panPhotoUploaded, setPanPhotoUploaded] = useState(false);

    // Error states for validation
    const [nameError, setNameError] = useState('');
    const [numberError, setNumberError] = useState('');
    const [drivingLicenseError, setDrivingLicenseError] = useState('');
    const [licenseDocumentError, setLicenseDocumentError] = useState('');
    const [panNumberError, setPanNumberError] = useState('');
    const [panPhotoError, setPanPhotoError] = useState('');
    const [deliveryModeError, setDeliveryModeError] = useState('');
    const [vehicleNumberError, setVehicleNumberError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [latitudeError, setLatitudeError] = useState('');
    const [longitudeError, setLongitudeError] = useState('');

    const checkDeliveryPersonDocument = useCallback(async () => {
        try {
            const delivery_token = localStorage.getItem('delivery_token');
            const response = await fetch(`${apiUrl}/delivery/check_delivery_person_document`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${delivery_token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data.status === true) {
                navigate('/dashboard');
            } else {
                setErrorMessage(data.message);
                setIsDialogOpen(true);
            }
        } catch (error) {
            console.error('Error checking delivery person document:', error);
            setErrorMessage('An error occurred while checking delivery person details.');
            setIsDialogOpen(true);
        }
    }, [apiUrl, navigate]);

    useEffect(() => {
        const delivery_token = localStorage.getItem('delivery_token');
        if (delivery_token) {
            checkDeliveryPersonDocument();
        } else {
            navigate('/login');
        }
    }, [navigate, checkDeliveryPersonDocument]);

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    const fetchGeocodeLocation = async () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLoading(true);
                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
                    );
                    if (!response.ok) {
                        throw new Error("Failed to fetch address");
                    }
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        setLocation(data.results[0].formatted_address || "Unable to fetch address");
                        setLatitude(latitude.toString());
                        setLongitude(longitude.toString());
                    } else {
                        setLocation("Unable to fetch address");
                    }
                } catch (error) {
                    console.error("Error fetching address:", error);
                    setLocation("Unable to fetch address");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Error getting current location:", error);
                setLoading(false);
                setLocation("Unable to get current location");
            }
        );
    };

    const handleIconClick = () => {
        if (navigator.geolocation) {
            fetchGeocodeLocation();
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    };

    const handleFileUpload = (file, setFile, setUploaded, maxSizeMB = 5) => {
        if (!file) {
            return false;
        }

        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File size should be less than ${maxSizeMB}MB`;
        }

        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            return 'Only JPEG, PNG, JPG, or PDF files are allowed';
        }

        setFile(file);
        setUploaded(true);
        return null;
    };

    const handleLicenseDocumentChange = (e) => {
        const file = e.target.files[0];
        const error = handleFileUpload(file, setLicenseDocument, setLicenseUploaded);
        if (error) {
            setLicenseDocumentError(error);
        } else {
            setLicenseDocumentError('');
        }
    };

    const handlePanPhotoChange = (e) => {
        const file = e.target.files[0];
        const error = handleFileUpload(file, setPanPhoto, setPanPhotoUploaded);
        if (error) {
            setPanPhotoError(error);
        } else {
            setPanPhotoError('');
        }
    };

    const removeFile = (setFile, setUploaded) => {
        setFile(null);
        setUploaded(false);
    };

    const validateForm = () => {
        let isValid = true;

        // Reset all errors
        setNameError('');
        setNumberError('');
        setDrivingLicenseError('');
        setLicenseDocumentError('');
        setPanNumberError('');
        setPanPhotoError('');
        setDeliveryModeError('');
        setVehicleNumberError('');
        setLocationError('');
        setLatitudeError('');
        setLongitudeError('');

        // Validate each field
        if (!name.trim()) {
            setNameError('Name is required');
            isValid = false;
        }

        if (!number.trim()) {
            setNumberError('Contact number is required');
            isValid = false;
        } else if (!/^\d{10}$/.test(number)) {
            setNumberError('Please enter a valid 10-digit phone number');
            isValid = false;
        }

        if (!drivingLicense.trim()) {
            setDrivingLicenseError('Driving license number is required');
            isValid = false;
        }

        if (!licenseDocument) {
            setLicenseDocumentError('License document is required');
            isValid = false;
        }

        if (!panNumber.trim()) {
            setPanNumberError('PAN Number is required');
            isValid = false;
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
            setPanNumberError('Please enter a valid PAN number (e.g., ABCDE1234F)');
            isValid = false;
        }

        if (!panPhoto) {
            setPanPhotoError('PAN Photo is required');
            isValid = false;
        }

        if (!deliveryMode) {
            setDeliveryModeError('Delivery mode is required');
            isValid = false;
        }

        if (!vehicleNumber.trim()) {
            setVehicleNumberError('Vehicle number is required');
            isValid = false;
        }

        if (!location.trim()) {
            setLocationError('Location is required');
            isValid = false;
        }

        if (!latitude.trim()) {
            setLatitudeError('Latitude is required');
            isValid = false;
        } else if (isNaN(latitude)) {
            setLatitudeError('Latitude must be a number');
            isValid = false;
        }

        if (!longitude.trim()) {
            setLongitudeError('Longitude is required');
            isValid = false;
        } else if (isNaN(longitude)) {
            setLongitudeError('Longitude must be a number');
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        const formData = new FormData();
        formData.append('name', name);
        formData.append('number', number);
        formData.append('driving_license', drivingLicense);
        if (licenseDocument) formData.append('license_document', licenseDocument);
        formData.append('PAN_Number', panNumber);
        if (panPhoto) formData.append('PAN_Photo', panPhoto);
        formData.append('delivery_mode', deliveryMode);
        formData.append('vehicle_number', vehicleNumber);
        formData.append('location', location);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        formData.append('online_status', '0');
        formData.append('status', '0');

        try {
            setLoading(true);
            const delivery_token = localStorage.getItem('delivery_token');
            const response = await fetch(`${apiUrl}/delivery/save_delivery_person_details`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${delivery_token}`,
                },
                body: formData,
            });

            const data = await response.json();
            if (data.data.status) {
                closeDialog();
                if (data.data.status === '1') {
                    navigate('/dashboard');
                } else if (data.data.status === '0') {

                    showAlert({
                        icon: 'warning',
                        title: 'Account Not Approved',
                        text: 'Your account details have been saved but are not yet approved. Once our agent verifies the details and documents, it will be automatically approved.',
                        timer: 10000,
                        timerProgressBar: true,
                    }).then(() => {
                        navigate(`/login`);
                    });
                }
            } else {
                setErrorMessage(data.data.message || 'Failed to save delivery person details');
                setIsDialogOpen(true);
            }
        } catch (error) {
            console.error('Error saving delivery person details:', error);
            setErrorMessage('An error occurred while saving delivery person details.');
            setIsDialogOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Dialog
                open={isDialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth="md"
                sx={{
                    '& .MuiDialog-paper': {
                        width: '90%',
                        maxWidth: '800px',
                        height: '80%',
                        maxHeight: '600px',
                    },
                }}
            >
                <DialogTitle>Enter Delivery Person Details</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                margin="dense"
                                label="Name *"
                                type="text"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                error={!!nameError}
                                helperText={nameError}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                margin="dense"
                                label="Contact Number *"
                                type="text"
                                fullWidth
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                error={!!numberError}
                                helperText={numberError}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                margin="dense"
                                label="Driving License *"
                                type="text"
                                fullWidth
                                value={drivingLicense}
                                onChange={(e) => setDrivingLicense(e.target.value)}
                                error={!!drivingLicenseError}
                                helperText={drivingLicenseError}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                component="label"
                                variant={licenseUploaded ? "contained" : "outlined"}
                                color={licenseUploaded ? "success" : "primary"}
                                startIcon={licenseUploaded ? <CheckCircleIcon /> : <CloudUploadIcon />}
                                sx={{ marginTop: 1 }}
                                fullWidth
                            >
                                {licenseUploaded ? 'License Uploaded' : 'Upload License Document *'}
                                <VisuallyHiddenInput
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleLicenseDocumentChange}
                                />
                            </Button>
                            {licenseDocumentError && (
                                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                    {licenseDocumentError}
                                </Typography>
                            )}
                            {licenseDocument && (
                                <FilePreview
                                    file={licenseDocument}
                                    onRemove={() => removeFile(setLicenseDocument, setLicenseUploaded)}
                                />
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                margin="dense"
                                label="PAN Number *"
                                type="text"
                                fullWidth
                                value={panNumber}
                                onChange={(e) => setPanNumber(e.target.value)}
                                error={!!panNumberError}
                                helperText={panNumberError}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                component="label"
                                variant={panPhotoUploaded ? "contained" : "outlined"}
                                color={panPhotoUploaded ? "success" : "primary"}
                                startIcon={panPhotoUploaded ? <CheckCircleIcon /> : <CloudUploadIcon />}
                                sx={{ marginTop: 1 }}
                                fullWidth
                            >
                                {panPhotoUploaded ? 'PAN Photo Uploaded' : 'Upload PAN Photo *'}
                                <VisuallyHiddenInput
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePanPhotoChange}
                                />
                            </Button>
                            {panPhotoError && (
                                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                    {panPhotoError}
                                </Typography>
                            )}
                            {panPhoto && (
                                <FilePreview
                                    file={panPhoto}
                                    onRemove={() => removeFile(setPanPhoto, setPanPhotoUploaded)}
                                />
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl margin="dense" fullWidth variant="outlined" error={!!deliveryModeError}>
                                <InputLabel>Delivery Mode *</InputLabel>
                                <Select
                                    value={deliveryMode}
                                    onChange={(e) => setDeliveryMode(e.target.value)}
                                    label="Delivery Mode *"
                                >
                                    <MenuItem value="motorcycle">Motorcycle</MenuItem>
                                    <MenuItem value="electric_vehicle">Electric Vehicle</MenuItem>
                                    <MenuItem value="bicycle">Bicycle</MenuItem>
                                </Select>
                                {deliveryModeError && <FormHelperText>{deliveryModeError}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                margin="dense"
                                label="Vehicle Number *"
                                type="text"
                                fullWidth
                                value={vehicleNumber}
                                onChange={(e) => setVehicleNumber(e.target.value)}
                                error={!!vehicleNumberError}
                                helperText={vehicleNumberError}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                placeholder="Enter Location *"
                                variant="outlined"
                                type="text"
                                fullWidth
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                error={!!locationError}
                                helperText={locationError}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleIconClick} style={{ cursor: 'pointer' }}>
                                                <MyLocationTwoToneIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                placeholder="Enter Latitude *"
                                variant="outlined"
                                type="text"
                                size='small'
                                fullWidth
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                error={!!latitudeError}
                                helperText={latitudeError}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                placeholder="Enter Longitude *"
                                variant="outlined"
                                type="text"
                                size='small'
                                fullWidth
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                error={!!longitudeError}
                                helperText={longitudeError}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="success"
                        sx={{ color: "white" }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={() => setErrorMessage('')}
            >
                <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default PermissionPage;
