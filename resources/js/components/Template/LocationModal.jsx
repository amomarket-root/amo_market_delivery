import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    InputAdornment,
    Grid,
    IconButton
} from '@mui/material';
import MyLocationTwoToneIcon from '@mui/icons-material/MyLocationTwoTone';

const LocationModal = ({
    open,
    onClose,
    locationData,
    onLocationChange,
    onFetchLocation,
    onUpdateLocation
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Current Location</DialogTitle>
            <DialogContent>
                {locationData && (
                    <>
                        <TextField
                            placeholder="Current Location"
                            variant="outlined"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            value={locationData.location}
                            onChange={(e) => onLocationChange('location', e.target.value)}
                            sx={{ mt: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={onFetchLocation} style={{ cursor: "pointer" }}>
                                            <MyLocationTwoToneIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Latitude"
                                    value={locationData.latitude}
                                    onChange={(e) => onLocationChange('latitude', e.target.value)}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Longitude"
                                    value={locationData.longitude}
                                    onChange={(e) => onLocationChange('longitude', e.target.value)}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                        </Grid>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onClose}
                    variant="contained"
                    color="error"
                    sx={{ color: "white" }}
                >
                    Close
                </Button>
                <Button
                    onClick={onUpdateLocation}
                    variant="contained"
                    color="success"
                    sx={{ color: "white" }}
                >
                    Update Location
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LocationModal;
