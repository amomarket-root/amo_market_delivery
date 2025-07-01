import React from 'react';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import CurrentNotificationPage from './CurrentNotificationPage';
import DeliveryBoyCurrentLocation from './DeliveryBoyCurrentLocation';
import DeliveryMetricsPage from './DeliveryMetricsPage';

const DashboardPage = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', padding: 2 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <CurrentNotificationPage />
                </Grid>
                <Grid item xs={12}>
                    <DeliveryBoyCurrentLocation />
                </Grid>
                <Grid item xs={12}>
                    <DeliveryMetricsPage />
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
