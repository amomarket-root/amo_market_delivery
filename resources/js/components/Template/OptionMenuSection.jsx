import React, { useState, useEffect } from "react";
import { Menu, Switch, MenuItem, IconButton, Typography } from "@mui/material";
import OnlineStatusIcon from "@mui/icons-material/Circle";
import DeliveryDiningTwoToneIcon from '@mui/icons-material/DeliveryDiningTwoTone';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MenuItemWithIcon from "./MenuItemWithIcon";
import LocationModal from "./LocationModal";

const OptionMenuSection = ({ anchorEl, isMenuOpen, handleMenuClose }) => {
    const [isOnline, setIsOnline] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;
    const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deliveryPersonLocation, setDeliveryPersonLocation] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOnlineStatus = async () => {
            try {
                const response = await axios.get(`${apiUrl}/delivery/delivery-person-online-status`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("delivery_token")}`,
                    },
                });

                if (response.data.status !== undefined) {
                    setIsOnline(response.data.status === 1);
                }
            } catch (error) {
                console.error("Error fetching online status:", error);
            }
        };

        fetchOnlineStatus();
    }, [apiUrl]);

    const handleToggleOnlineStatus = async () => {
        const newStatus = !isOnline;
        setIsOnline(newStatus);

        try {
            await axios.post(
                `${apiUrl}/delivery/toggle-online-status`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("delivery_token")}`,
                    },
                }
            );
        } catch (error) {
            console.error("Error updating online status:", error);
            setIsOnline(!newStatus);
        }
    };

    const handleOrderDetailsClick = () => {
        navigate("/order-details");
        handleMenuClose();
    };

    const handleBankAccountClick = () => {
        navigate("/delivery-person-bank-account");
        handleMenuClose();
    };

    const handleSettlementClick = () => {
        navigate("/settlement");
        handleMenuClose();
    };

    const handleUpdateLocationClick = async () => {
        try {
            const response = await axios.get(`${apiUrl}/delivery/get_delivery-person_location`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("delivery_token")}`,
                },
            });

            if (response.data.status) {
                setDeliveryPersonLocation(response.data.data);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error("Error fetching delivery person location:", error);
        }
    };

    const fetchGeocodeLocation = async () => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
                    );
                    if (!response.ok) throw new Error("Failed to fetch address");

                    const data = await response.json();
                    const newLocation = data.results?.[0]?.formatted_address || "Unable to fetch address";

                    setDeliveryPersonLocation(prev => ({
                        ...prev,
                        location: newLocation,
                        latitude: latitude.toString(),
                        longitude: longitude.toString(),
                    }));
                } catch (error) {
                    console.error("Error fetching address:", error);
                    setDeliveryPersonLocation(prev => ({
                        ...prev,
                        location: "Unable to fetch address",
                    }));
                }
            },
            (error) => {
                console.error("Error getting current location:", error);
                setDeliveryPersonLocation(prev => ({
                    ...prev,
                    location: "Unable to get current location",
                }));
            }
        );
    };

    const handleLocationChange = (field, value) => {
        setDeliveryPersonLocation(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateLocation = async () => {
        try {
            const response = await axios.post(
                `${apiUrl}/delivery/update_delivery-person_location`,
                {
                    id: deliveryPersonLocation.id,
                    location: deliveryPersonLocation.location,
                    latitude: deliveryPersonLocation.latitude,
                    longitude: deliveryPersonLocation.longitude,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("delivery_token")}`,
                    },
                }
            );

            if (response.data.status) {
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("Error updating delivery person location:", error);
        }
    };

    return (
        <>
            <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                MenuListProps={{
                    "aria-labelledby": "option-button",
                }}
            >
                <MenuItem>
                    <IconButton>
                        <OnlineStatusIcon sx={{ color: isOnline ? "green" : "red" }} />
                    </IconButton>
                    <Typography variant="body1" sx={{ marginRight: 1 }}>
                        {isOnline ? "Online" : "Offline"}
                    </Typography>
                    <Switch
                        checked={isOnline}
                        onChange={handleToggleOnlineStatus}
                        color="primary"
                    />
                </MenuItem>

                <MenuItemWithIcon
                    icon={<MyLocationIcon />}
                    text="Update Location"
                    color="green"
                    onClick={handleUpdateLocationClick}
                />

                <MenuItemWithIcon
                    icon={<DeliveryDiningTwoToneIcon />}
                    text="Order Details"
                    color="blue"
                    onClick={handleOrderDetailsClick}
                />

                <MenuItemWithIcon
                    icon={<AccountBalanceIcon />}
                    text="Bank Account"
                    color="orange"
                    onClick={handleBankAccountClick}
                />

                <MenuItemWithIcon
                    icon={<CreditScoreIcon />}
                    text="Settlement"
                    color="#9F63FF"
                    onClick={handleSettlementClick}
                />
            </Menu>

            <LocationModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                locationData={deliveryPersonLocation}
                onLocationChange={handleLocationChange}
                onFetchLocation={fetchGeocodeLocation}
                onUpdateLocation={handleUpdateLocation}
            />
        </>
    );
};

export default OptionMenuSection;
