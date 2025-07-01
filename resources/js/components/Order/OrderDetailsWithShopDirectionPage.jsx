import React, { useEffect, useState } from 'react';
import {
    Grid, Paper, Typography, Box, Divider, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Skeleton,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import NavigationTwoToneIcon from '@mui/icons-material/NavigationTwoTone';
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import UseLiveLocationUpdate from './useLiveLocationUpdate';
import { useSweetAlert } from '../Template/SweetAlert';
import axios from "axios";

const OrderDetailsWithShopDirectionPage = () => {
    const navigate = useNavigate();
    const showAlert = useSweetAlert();
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOrderPreparing, setIsOrderPreparing] = useState(false);
    const [shops, setShops] = useState([]);
    const apiUrl = import.meta.env.VITE_API_URL;
    const delivery_token = localStorage.getItem('delivery_token');

    UseLiveLocationUpdate(orderId);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`${apiUrl}/delivery/get_order_details_with_shop_direction/${orderId}`, {
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

                // Updated data access to match the API response structure
                const orderData = data.orderData.order || data.orderData.original?.order;
                const shopData = data.orderData.shops || data.orderData.original?.shops || [];

                setOrderDetails(orderData);
                setShops(shopData);
                setIsOrderPreparing(orderData?.order_status === 'preparing');
            } catch (error) {
                console.error('Error fetching order details:', error);
                showAlert({
                    title: "Error!",
                    text: "Failed to fetch order details.",
                    icon: "error",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId, apiUrl, delivery_token]);

    const handleNavigateToShop = (latitude, longitude) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        window.open(url, '_blank');
    };

    const reachShopLocation = async () => {
        if (!orderDetails) {
            showAlert({
                title: "Error!",
                text: "Order details not found!",
                icon: "error",
            });
            return;
        }

        // Get shop ID from the first shop in the shops array
        const shopId = shops.length > 0 ? shops[0].id : null;
        if (!shopId) {
            showAlert({
                title: "Error!",
                text: "Shop ID is missing!",
                icon: "error",
            });
            return;
        }

        try {
            const response = await axios.post(
                `${apiUrl}/delivery/reach_shop_location`,
                {
                    order_id: orderDetails.id,
                    order_status: 'on_the_way',
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('delivery_token')}`,
                    },
                }
            );

            showAlert({
                icon: "success",
                title: 'Shop Location Reached',
                text: 'Delivery partner reached the shop location successfully',
                showConfirmButton: true,
                timer: 3000,
                timerProgressBar: true,
                confirmButtonText: "OK",
            }).then(() => {
                navigate(`/order-details-with-user-direction/${orderDetails.id}`);
            });

            setIsOrderPreparing(true);
            console.log('Order accepted:', response.data);
        } catch (error) {
            console.error('Error accepting order:', error);
            showAlert({
                title: "Error!",
                text: error.response?.data?.message || 'Something went wrong while accepting the order.',
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
            <Grid container spacing={3} style={{ padding: '5px' }}>
                <Grid item xs={12}>
                    <Paper elevation={3} style={{ padding: '16px' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                            <Skeleton variant="text" width="30%" height={40} />
                            <Box display="flex" gap={1}>
                                <Skeleton variant="rectangular" width={120} height={40} />
                                <Skeleton variant="rectangular" width={120} height={40} />
                            </Box>
                        </Box>
                        <Divider style={{ margin: '10px 0' }} />

                        <Grid container spacing={2} mb={2}>
                            <Grid item xs={12} sm={6}>
                                <Box display="flex" flexDirection="column" gap={1}>
                                    <Skeleton variant="text" width="50%" height={30} />
                                    <Skeleton variant="text" width="50%" height={30} />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box display="flex" flexDirection="column" gap={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                                    <Skeleton variant="text" width="50%" height={30} />
                                    <Skeleton variant="text" width="50%" height={30} />
                                </Box>
                            </Grid>
                        </Grid>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><Skeleton variant="text" width="100%" height={30} /></TableCell>
                                        <TableCell><Skeleton variant="text" width="100%" height={30} /></TableCell>
                                        <TableCell><Skeleton variant="text" width="100%" height={30} /></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Array.from(new Array(3)).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Skeleton variant="circular" width={50} height={50} />
                                                    <Skeleton variant="text" width="60%" height={30} sx={{ ml: 1 }} />
                                                </Box>
                                            </TableCell>
                                            <TableCell><Skeleton variant="text" width="100%" height={30} /></TableCell>
                                            <TableCell><Skeleton variant="text" width="100%" height={30} /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
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
                            {isOrderPreparing && shops.length > 0 && (
                                <>
                                    {shops.map((shop) => (
                                        <React.Fragment key={shop.id}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleNavigateToShop(shop.latitude, shop.longitude)}
                                                startIcon={<NavigationTwoToneIcon />}
                                            >
                                                Navigate to {shop.name}
                                            </Button>
                                        </React.Fragment>
                                    ))}
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        onClick={reachShopLocation}
                                        startIcon={<StorefrontTwoToneIcon />}
                                    >
                                        Reached Shop Location
                                    </Button>
                                </>
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
                                {shops.length > 0 && (
                                    <Box display="flex" gap={1}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Shop:</Typography>
                                        <Typography variant="body1">{shops[0].name}</Typography>
                                    </Box>
                                )}
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

                    {/* Display shop details section */}
                    {shops.length > 0 && (
                        <Box mt={4}>
                            <Typography variant="h6" gutterBottom>Shop Details</Typography>
                            <Divider style={{ marginBottom: '16px' }} />
                            <Grid container spacing={2}>
                                {shops.map((shop) => (
                                    <Grid item xs={12} key={shop.id}>
                                        <Paper elevation={2} style={{ padding: '16px' }}>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <img
                                                    src={shop.image}
                                                    alt={shop.name}
                                                    style={{ width: '80px', height: '80px', borderRadius: '4px' }}
                                                    loading="eager"
                                                    decoding="async"
                                                />
                                                <Box>
                                                    <Typography variant="h6">{shop.name}</Typography>
                                                    <Typography variant="body2">{shop.description}</Typography>
                                                    <Typography variant="body2">
                                                        <strong>Location:</strong> {shop.location}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Contact:</strong> {shop.number}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default OrderDetailsWithShopDirectionPage;
