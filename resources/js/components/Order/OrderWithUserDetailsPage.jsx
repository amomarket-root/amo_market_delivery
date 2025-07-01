import React, { useEffect, useState } from 'react';
import {
    Grid, Paper, Typography, Box, Divider, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton, Skeleton,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import PhoneIcon from "@mui/icons-material/Phone";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigationTwoToneIcon from '@mui/icons-material/NavigationTwoTone';
import UseLiveLocationUpdate from './useLiveLocationUpdate';
import { useSweetAlert } from '../Template/SweetAlert';
import axios from "axios";

const OrderWithUserDetailsPage = () => {
    const navigate = useNavigate();
    const showAlert = useSweetAlert();
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOrderPreparing, setIsOrderPreparing] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;
    const delivery_token = localStorage.getItem('delivery_token');

    UseLiveLocationUpdate(orderId);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`${apiUrl}/delivery/get_order_with_user_details/${orderId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${delivery_token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                setOrderDetails(data.orderData);
                setUserLocation(data.orderData.address);
                setIsOrderPreparing(data.orderData.order_status === 'reached');
            } catch (error) {
                console.error('Error fetching order details:', error);
                showAlert({
                    title: "Error!",
                    text: 'Failed to fetch order details.',
                    icon: "error",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId, apiUrl, delivery_token]);

    const handleNavigateToUser = (latitude, longitude) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        window.open(url, '_blank');
    };

    const reachUserLocation = async () => {
        if (!orderDetails) {
            showAlert({
                title: "Error!",
                text: 'Order details not found!',
                icon: "error",
            });
            return;
        }

        try {
            const response = await axios.post(
                `${apiUrl}/delivery/order_delivered`,
                {
                    order_id: orderDetails.id,
                    order_status: 'delivered',
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('delivery_token')}`,
                    },
                }
            );
            showAlert({
                icon: 'success',
                title: 'Delivered',
                text: 'The order has been successfully delivered to the user.',
                showConfirmButton: true,
                timer: 3000,
                timerProgressBar: true,
                confirmButtonText: "OK",
            }).then(() => {
                navigate(`/dashboard`);
            });

            setIsOrderPreparing(false);
            console.log('Order delivered:', response.data);
        } catch (error) {
            console.error('Error delivering order:', error);
            showAlert({
                title: "Error!",
                text: error.response?.data?.message || 'Something went wrong while delivering the order.',
                icon: "error",
            });
        }
    };

    const calculateTotalAmount = (items) => {
        return items.reduce((total, productItem) => {
            return total + parseFloat(productItem.product.price) * productItem.quantity;
        }, 0);
    };

    if (loading) {
        return (
            <Box display="flex" flexDirection="column" gap={2} style={{ padding: '16px' }}>
                <Skeleton variant="rectangular" width="100%" height={200} />
                <Skeleton variant="rectangular" width="100%" height={100} />
                <Skeleton variant="rectangular" width="100%" height={300} />
            </Box>
        );
    }

    if (!orderDetails) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography variant="h6" color="error" textAlign="center">
                    Something went wrong. Order not found. <br />
                    Please contact admin as soon as possible.
                </Typography>
            </Box>
        );
    }

    const { user_cart, payment_status, payment_method, created_at } = orderDetails;
    const cartItems = JSON.parse(user_cart?.cart_items || '[]');
    const totalAmount = calculateTotalAmount(cartItems);

    return (
        <Grid container spacing={3} style={{ padding: '5px' }}>
            <Grid item xs={12}>
                <Paper elevation={3} style={{ padding: '16px' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Typography variant="h6">Order ID: {orderDetails?.order_id || orderId}</Typography>
                        <Box display="flex" gap={1}>
                            {isOrderPreparing && userLocation ? (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleNavigateToUser(userLocation.latitude, userLocation.longitude)}
                                        startIcon={<NavigationTwoToneIcon />}
                                    >
                                        Navigate to User
                                    </Button>
                                    <Button
                                        sx={{ color: 'white' }}
                                        variant="contained"
                                        color="success"
                                        onClick={reachUserLocation}
                                        startIcon={<CheckCircleIcon />}
                                    >
                                        Delivered
                                    </Button>
                                </>
                            ) : (
                                <></>
                            )}
                        </Box>
                    </Box>
                    <Divider style={{ margin: '10px 0' }} />

                    <Grid container spacing={2} mb={2}>
                        <Grid item xs={12} sm={6}>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <Box display="flex" gap={1}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Created At:</Typography>
                                    <Typography variant="body1">{new Date(created_at).toLocaleString()}</Typography>
                                </Box>
                                <Box display="flex" gap={1}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total Amount:</Typography>
                                    <Typography variant="body1">₹{totalAmount.toFixed(2)}</Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box display="flex" flexDirection="column" gap={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                                <Box display="flex" gap={1}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Payment Method:</Typography>
                                    <Typography variant="body1">{payment_method}</Typography>
                                </Box>
                                <Box display="flex" gap={1}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Payment Status:</Typography>
                                    <Box
                                        style={{
                                            backgroundColor:
                                                payment_status === 'success' ? '#10d915' :
                                                    payment_status === 'failed' ? '#f27474' :
                                                        '#d9c404',
                                            color: 'white',
                                            padding: '3px',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        {payment_status}
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell>Qty</TableCell>
                                    <TableCell>Weight</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cartItems.map((productItem) => (
                                    <TableRow key={productItem.id}>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <img
                                                    src={productItem.product.image}
                                                    alt={productItem.product.name}
                                                    style={{ width: '50px', height: '50px', marginRight: '10px' }}
                                                />
                                                <Typography>{productItem.product.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{productItem.quantity}</TableCell>
                                        <TableCell>{productItem.product.weight}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Moved Contact Details and Delivery Address below the table */}
                    {userLocation && (
                        <Box mt={4}>
                            {/* Contact Details */}
                            <Typography variant="h6" gutterBottom>
                                Contact Details
                            </Typography>
                            <Divider style={{ marginBottom: '16px' }} />
                            <Paper elevation={2} style={{ padding: '16px', marginBottom: '16px' }}>
                                <Grid container spacing={2} alignItems="center">
                                    {/* Image on left */}
                                    <Grid item xs={12} sm={2}>
                                        <Box display="flex" justifyContent="center">
                                            <img
                                                src="/image/user_contact.png"
                                                alt="Contact"
                                                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
                                                loading="eager"
                                                decoding="async"
                                            />
                                        </Box>
                                    </Grid>

                                    {/* Contact info on right */}
                                    <Grid item xs={12} sm={8}>
                                        <Box display="flex" flexDirection="column" gap={2}>
                                            <Typography variant="body1">
                                                <strong>Name:</strong> {userLocation.full_name}
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="body1">
                                                    <strong>Phone Number:</strong> {userLocation.phone_number}
                                                </Typography>
                                                <IconButton
                                                    color="success"
                                                    onClick={() => window.location.href = `tel:${userLocation.phone_number}`}
                                                    sx={{ border: '1px solid', borderColor: 'success.main' }}
                                                >
                                                    <PhoneIcon />
                                                </IconButton>
                                            </Box>
                                            {userLocation.alternative_number && (
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="body1">
                                                        <strong>Another Number:</strong> {userLocation.alternative_number}
                                                    </Typography>
                                                    <IconButton
                                                        color="success"
                                                        onClick={() => window.location.href = `tel:${userLocation.alternative_number}`}
                                                        sx={{ border: '1px solid', borderColor: 'success.main' }}
                                                    >
                                                        <PhoneIcon />
                                                    </IconButton>
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Delivery Address */}
                            <Typography variant="h6" gutterBottom>
                                Delivery Address
                            </Typography>
                            <Divider style={{ marginBottom: '16px' }} />
                            <Paper elevation={2} style={{ padding: '16px' }}>
                                <Grid container spacing={2} alignItems="center">
                                    {/* Image on left */}
                                    <Grid item xs={12} sm={2}>
                                        <Box display="flex" justifyContent="center">
                                            <img
                                                src="/image/user_order_location.png"
                                                alt="Delivery Address"
                                                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
                                                loading="eager"
                                                decoding="async"
                                            />
                                        </Box>
                                    </Grid>

                                    {/* Address info on right */}
                                    <Grid item xs={12} sm={8}>
                                        <Box display="flex" flexDirection="column" gap={1}>
                                            <Typography variant="body1">
                                                <strong>Location:</strong> {userLocation.location}
                                            </Typography>
                                            <Typography variant="body1">
                                                <strong>Building Details:</strong> {userLocation.building_details}
                                            </Typography>
                                            <Typography variant="body1">
                                                <strong>City:</strong> {userLocation.city}
                                            </Typography>
                                            <Typography variant="body1">
                                                <strong>State:</strong> {userLocation.state}
                                            </Typography>
                                            <Typography variant="body1">
                                                <strong>Pin Code:</strong> {userLocation.pin_code}
                                            </Typography>
                                            <Typography variant="body1">
                                                <strong>Coordinates:</strong> {userLocation.latitude}, {userLocation.longitude}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default OrderWithUserDetailsPage;
