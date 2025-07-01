import React, { useEffect, useState, useCallback, useRef } from "react";
import { Grid, Typography, Box, IconButton, List, ListItem, Paper, Skeleton, Alert } from "@mui/material";
import PreviewIcon from '@mui/icons-material/Preview';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CurrentNotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const apiUrl = import.meta.env.VITE_API_URL;
    const delivery_token = localStorage.getItem('delivery_token');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUserInteracted, setIsUserInteracted] = useState(false);
    const navigate = useNavigate();
    const prevNotificationsRef = useRef(0);

    useEffect(() => {
        const deliveryPersonId = localStorage.getItem('delivery_person_id');
        if (deliveryPersonId) {
            window.Echo.channel(`notification_for_delivery_person.${deliveryPersonId}`)
                .listen('.shop.accept.order.notification', (data) => {
                    setNotifications((prevNotifications) => [
                        {
                            order_id: data.id,
                            total_amount: data.total_amount,
                            created_at: new Date().toISOString(),
                            order: {
                                id: data.id,
                                order_id: data.order_id,
                            },
                        },
                        ...prevNotifications,
                    ]);
                    if (isUserInteracted) {
                        playSound();
                    }
                });
        }

        return () => {
            if (deliveryPersonId) {
                window.Echo.leave(`notification_for_delivery_person.${deliveryPersonId}`);
            }
        };
    }, [isUserInteracted]);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await axios.get(`${apiUrl}/delivery/delivery-notifications`, {
                headers: {
                    Authorization: `Bearer ${delivery_token}`,
                },
            });
            const newNotifications = response.data.notifications;

            if (isUserInteracted && newNotifications.length > prevNotificationsRef.current) {
                playSound();
            }

            setNotifications(newNotifications);
            prevNotificationsRef.current = newNotifications.length;
            setLoading(false);
        } catch (err) {
            setError(err.message || "Failed to fetch notifications");
            setLoading(false);
        }
    }, [apiUrl, delivery_token, isUserInteracted]);

    const playSound = () => {
        const audio = new Audio('/sound/shop_notification.wav');
        audio.play().catch((error) => {
            console.error("Failed to play sound:", error);
        });
    };

    useEffect(() => {
        const handleUserInteraction = () => {
            setIsUserInteracted(true);
            document.removeEventListener('click', handleUserInteraction);
        };

        document.addEventListener('click', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
        };
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => {
            fetchNotifications();
        }, 60000);

        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const viewOrderDetails = async (orderId) => {
        try {
            await axios.post(
                `${apiUrl}/delivery/delivery-notifications/mark-as-read`,
                { order_id: orderId },
                {
                    headers: {
                        Authorization: `Bearer ${delivery_token}`,
                    },
                }
            );
            navigate(`/order-details/${orderId}`);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    return (
        <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
                    Notifications
                </Typography>
            </Box>

            {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : (
                <Paper elevation={10} sx={{ p: 2, borderRadius: '10px', maxHeight: '500px', overflowY: 'auto' }}>
                    {loading ? (
                        <Grid container spacing={2}>
                            {[1, 2, 3].map((item) => (
                                <Grid item xs={12} key={item}>
                                    <Paper elevation={3} sx={{ p: 2, borderRadius: '8px' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Skeleton variant="text" width="40%" height={30} />
                                            <Skeleton variant="circular" width={40} height={40} />
                                        </Box>
                                        <Box mt={1} display="flex" justifyContent="space-between">
                                            <Skeleton variant="text" width="30%" height={25} />
                                            <Skeleton variant="text" width="40%" height={25} />
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : notifications.length === 0 ? (
                        <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: '8px' }}>
                            <Typography variant="h6" color="textSecondary">
                                Currently No Orders Found!
                            </Typography>
                        </Paper>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {notifications.map((notification) => (
                                <ListItem key={notification?.order?.id} sx={{ p: 0, mb: 2 }}>
                                    <Paper elevation={3} sx={{
                                        width: '100%',
                                        p: 2,
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #3f51b5',
                                        '&:hover': {
                                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                                            transform: 'translateY(-2px)',
                                            transition: 'all 0.3s ease'
                                        }
                                    }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                Order ID: {notification?.order?.order_id}
                                            </Typography>
                                            <IconButton
                                                onClick={() => viewOrderDetails(notification?.order?.id)}
                                                color="primary"
                                                sx={{
                                                    backgroundColor: '#f5f5f5',
                                                    '&:hover': {
                                                        backgroundColor: '#e0e0e0'
                                                    }
                                                }}
                                            >
                                                <PreviewIcon />
                                            </IconButton>
                                        </Box>
                                        <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Amount:</strong> ₹{notification.total_amount}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Order Time:</strong> {new Date(notification.created_at).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
            )}
        </Grid>
    );
};

export default CurrentNotificationPage;
