import React, { useEffect, useState } from 'react';
import {
    Grid, Paper, Typography, Box, CircularProgress, Tooltip,
    FormControl, InputLabel, Select, MenuItem, Pagination, Stack,
    Button, useMediaQuery, useTheme, Chip, Divider, Skeleton, Avatar
} from '@mui/material';
import { useSweetAlert } from '../Template/SweetAlert';
import ToggleOnTwoToneIcon from '@mui/icons-material/ToggleOnTwoTone';
import ToggleOffTwoToneIcon from '@mui/icons-material/ToggleOffTwoTone';
import RefreshIcon from '@mui/icons-material/Refresh';
import dayjs from 'dayjs';

const getAvatarColor = (status) => {
    switch (status) {
        case 'success': return 'success.main';
        case 'failed': return 'error.main';
        case 'pending': return 'warning.main';
        default: return 'grey.500';
    }
};

const OrderDetailsPage = () => {
    const showAlert = useSweetAlert();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, per_page: 10, total: 0 });
    const [filter, setFilter] = useState('all');
    const apiUrl = import.meta.env.VITE_API_URL;
    const delivery_token = localStorage.getItem('delivery_token');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const url = new URL(`${apiUrl}/delivery/delivery-details`);
            url.searchParams.append('time_filter', filter);
            url.searchParams.append('page', pagination.page);
            url.searchParams.append('per_page', pagination.per_page);

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${delivery_token}`,
                },
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            setOrderDetails(data.data.data);
            setPagination({ ...pagination, total: data.data.total, last_page: data.data.last_page });
        } catch (error) {
            console.error('Error fetching order details:', error);
            showAlert({ title: "Error!", text: "Failed to fetch order details.", icon: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [filter, pagination.page, pagination.per_page]);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setPagination({ ...pagination, page: 1 });
    };

    const handlePageChange = (e, value) => {
        setPagination({ ...pagination, page: value });
    };

    const formatDate = (date) => dayjs(date).format('DD MMM YYYY, hh:mm A');

    return (
        <Grid container spacing={2} style={{ padding: isMobile ? '2px' : '5px' }}>
            <Grid item xs={12}>
                <Paper elevation={10} style={{ padding: isMobile ? '16px' : '24px', borderRadius: '10px' }}>

                    <Box display="flex" justifyContent="space-between" alignItems="center" flexDirection={isMobile ? 'column' : 'row'} gap={2} mb={3}>
                        <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold">Order Details</Typography>
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchOrderDetails} disabled={loading} fullWidth={isMobile} size={isMobile ? 'small' : 'medium'}>
                            {isMobile ? 'Refresh' : 'Refresh Orders'}
                        </Button>
                    </Box>

                    <Box mb={3} display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2}>
                        <FormControl variant="outlined" size='small' fullWidth={isMobile} sx={{ minWidth: 200 }}>
                            <InputLabel>Time Period</InputLabel>
                            <Select value={filter} onChange={handleFilterChange} label="Time Period">
                                <MenuItem value="today">Today</MenuItem>
                                <MenuItem value="yesterday">Yesterday</MenuItem>
                                <MenuItem value="last_7_days">Last 7 Days</MenuItem>
                                <MenuItem value="last_30_days">Last 30 Days</MenuItem>
                                <MenuItem value="all">All Orders</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" size='small' fullWidth={isMobile} sx={{ minWidth: 120 }}>
                            <InputLabel>Per Page</InputLabel>
                            <Select
                                value={pagination.per_page}
                                onChange={(e) => setPagination({ ...pagination, per_page: e.target.value, page: 1 })}
                                label="Per Page"
                            >
                                {[5, 10, 25, 50].map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box mb={2}>
                        <Divider>
                            <Chip
                                label="Orders"
                                size="medium"
                                sx={{
                                    bgcolor: '#9F63FF',          // background color
                                    color: '#fff',               // text color
                                    fontWeight: 600,
                                    px: 2,
                                    py: 0.5,
                                    fontSize: '0.95rem',
                                    borderRadius: '8px',         // rounded chip
                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',

                                    '& .MuiChip-label': {
                                        padding: 0,
                                    },
                                }}
                            />
                        </Divider>
                    </Box>


                    {loading ? (
                        <Grid container spacing={2}>{[...Array(pagination.per_page)].map((_, i) => (
                            <Grid item xs={12} key={i}>
                                <Skeleton variant="rounded" height={100} />
                            </Grid>
                        ))}</Grid>
                    ) : orderDetails && orderDetails.length > 0 ? (
                        <Grid container spacing={3}>
                            {orderDetails.map((order) => (
                                <Grid item xs={12} key={order.id}>
                                    <Paper
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: '10px',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 3
                                            }
                                        }}
                                        elevation={6}
                                    >
                                        <Box p={2}>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar sx={{ bgcolor: getAvatarColor(order.payment_status) }}>
                                                    {order.payment_status === 'success' ? <ToggleOnTwoToneIcon /> : <ToggleOffTwoToneIcon />}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6">Order ID: {order.generate_order_id}</Typography>
                                                    <Typography variant="body2" color="text.secondary">Date: {formatDate(order.created_at)}</Typography>
                                                </Box>
                                            </Box>

                                            <Divider sx={{ my: 2 }} />

                                            <Box mb={1}>
                                                <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                                                <Typography variant="body1">₹{order.delivery_amount?.toFixed(2) || '0.00'}</Typography>
                                            </Box>

                                            <Box mb={1}>
                                                <Typography variant="subtitle2" color="text.secondary">Method</Typography>
                                                <Typography variant="body1">{order.payment_method || 'N/A'}</Typography>
                                            </Box>

                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                                <Typography variant="body1" color={getAvatarColor(order.payment_status)} textTransform="capitalize">
                                                    {order.payment_status}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                            <Typography variant="h6" color="textSecondary">No orders found.</Typography>
                        </Box>

                    )}

                    <Box mt={3} display="flex" justifyContent="center">
                        <Stack spacing={2}>
                            <Pagination
                                count={pagination.last_page}
                                page={pagination.page}
                                onChange={handlePageChange}
                                color="primary"
                                showFirstButton
                                showLastButton
                                size='small'
                            />
                        </Stack>
                    </Box>

                </Paper>
            </Grid>
        </Grid>
    );
};

export default OrderDetailsPage;
