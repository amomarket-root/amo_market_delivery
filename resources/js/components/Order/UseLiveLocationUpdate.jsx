// useLocationUpdate.js
import { useEffect } from 'react';
import axios from 'axios';

const UseLiveLocationUpdate = (orderId) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const delivery_token = localStorage.getItem('delivery_token');

    const sendLocationUpdate = async (latitude, longitude) => {
        try {
            await axios.post(`${apiUrl}/delivery/update_live_location`, {
                order_id: orderId,
                latitude: latitude,
                longitude: longitude,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${delivery_token}`,
                },
            });
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    sendLocationUpdate(latitude, longitude);
                    console.log("getting location from delivery app", orderId, latitude, longitude);
                },
                (error) => {
                    console.error('Error getting location:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );

            // Cleanup function to clear the watchPosition when the component unmounts
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [orderId]);
};

export default UseLiveLocationUpdate;
