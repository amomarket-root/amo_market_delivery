import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LoadScript, GoogleMap, Marker, InfoWindow, Polyline, OverlayView } from '@react-google-maps/api';
import { Paper, CircularProgress, Typography, Box, useTheme, Grid, Skeleton, Alert, Chip } from '@mui/material';

// Haversine Distance (in km)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const DeliveryBoyCurrentLocation = () => {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const [currentLocation, setCurrentLocation] = useState(null);
    const [deliveryPersonLocation, setDeliveryPersonLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [mapRef, setMapRef] = useState(null);
    const [markerSize, setMarkerSize] = useState(15);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [geocoder, setGeocoder] = useState(null);
    const [fetchingAddress, setFetchingAddress] = useState(false);
    const [distance, setDistance] = useState(0);
    const delivery_token = localStorage.getItem('delivery_token');
    const apiUrl = import.meta.env.VITE_API_URL;
    const animationRef = useRef(null);
    const growingRef = useRef(true);

    const mapContainerStyle = {
        width: '100%',
        height: '400px',
        borderRadius: '8px'
    };

    // Dark mode map styles
    const darkModeStyles = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }]
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }]
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }]
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }]
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }]
        },
        {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }]
        },
        {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }]
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }]
        },
        {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }]
        },
        {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }]
        },
        {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }]
        },
        {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }]
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }]
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }]
        },
        {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }]
        }
    ];

    // Light mode map styles
    const lightModeStyles = [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }
    ];

    const mapOptions = useMemo(() => ({
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        disableDefaultUI: true,
        zoomControl: false,
        styles: isDarkMode ? darkModeStyles : lightModeStyles
    }), [isDarkMode]);

    const handleScriptLoad = () => setScriptLoaded(true);

    const getAddressDetails = useCallback(async (lat, lng) => {
        if (!geocoder) return null;
        setFetchingAddress(true);
        try {
            const response = await new Promise((resolve, reject) => {
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results[0]) resolve(results[0]);
                    else reject(new Error('Geocoder failed'));
                });
            });

            let city = '', state = '';
            for (const component of response.address_components) {
                if (component.types.includes('locality')) city = component.long_name;
                if (component.types.includes('administrative_area_level_1')) state = component.long_name;
            }

            return {
                formattedAddress: response.formatted_address,
                city,
                state
            };
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        } finally {
            setFetchingAddress(false);
        }
    }, [geocoder]);

    const handleMarkerClick = useCallback(async (location, type) => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        const addressDetails = await getAddressDetails(location.lat, location.lng);
        setSelectedLocation({
            ...location,
            type,
            address: addressDetails?.formattedAddress || 'Address not available',
            city: addressDetails?.city || 'Unknown city',
            state: addressDetails?.state || 'Unknown state'
        });

        if (mapRef) mapRef.panTo(location);
    }, [getAddressDetails, mapRef]);

    const onMapLoad = useCallback((map) => {
        setMapRef(map);
        setGeocoder(new window.google.maps.Geocoder());
    }, []);

    const getMarkerIcon = useCallback((size, color = '#10d915') => ({
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: size,
        fillColor: color,
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 2
    }), []);

    const interpolateColor = (start, end, factor) => {
        const hexToRgb = hex => hex.match(/\w\w/g).map(x => parseInt(x, 16));
        const rgbToHex = rgb => '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
        const s = hexToRgb(start), e = hexToRgb(end);
        const result = s.map((val, i) => Math.round(val + (e[i] - val) * factor));
        return rgbToHex(result);
    };

    const generateCurvedPolyline = (start, end, segments = 20, offset = 0.001) => {
        const curve = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const lat = (1 - t) * start.lat + t * end.lat;
            const lng = (1 - t) * start.lng + t * end.lng;
            const curveOffset = Math.sin(t * Math.PI) * offset;
            curve.push({ lat: lat + curveOffset, lng: lng });
        }
        return curve;
    };

    const fitBoundsToMap = (map, loc1, loc2) => {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(loc1);
        bounds.extend(loc2);
        map.fitBounds(bounds);
    };

    useEffect(() => {
        const animateMarker = () => {
            if (growingRef.current) {
                setMarkerSize(prev => (prev >= 18 ? (growingRef.current = false, 18) : prev + 0.020));
            } else {
                setMarkerSize(prev => (prev <= 15 ? (growingRef.current = true, 15) : prev - 0.020));
            }
            animationRef.current = requestAnimationFrame(animateMarker);
        };

        if (scriptLoaded && (currentLocation || deliveryPersonLocation)) {
            animationRef.current = requestAnimationFrame(animateMarker);
        }

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [scriptLoaded, currentLocation, deliveryPersonLocation]);

    const fetchDeliveryPersonLocation = async () => {
        try {
            const response = await fetch(`${apiUrl}/delivery/get_delivery-person_location`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${delivery_token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch delivery person location');
            const data = await response.json();
            if (data.status && data.data) {
                const { latitude, longitude } = data.data;
                setDeliveryPersonLocation({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
            } else {
                throw new Error(data.message || 'Location data not found');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch delivery person location');
        }
    };

    useEffect(() => {
        const fetchLocations = async () => {
            setLoading(true);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    pos => setCurrentLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    }),
                    err => setError(err.message || 'Failed to get current location'),
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                setError("Geolocation not supported.");
            }

            await fetchDeliveryPersonLocation();
            setLoading(false);
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        if (currentLocation && deliveryPersonLocation) {
            const calculatedDistance = calculateDistance(
                currentLocation.lat,
                currentLocation.lng,
                deliveryPersonLocation.lat,
                deliveryPersonLocation.lng
            );
            setDistance(calculatedDistance);

            if (mapRef) {
                fitBoundsToMap(mapRef, currentLocation, deliveryPersonLocation);
            }
        }
    }, [currentLocation, deliveryPersonLocation, mapRef]);

    return (
        <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" sx={{ fontWeight: 'bold' }} gutterBottom>
                    Current Location
                </Typography>
            </Box>

            {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            ) : (
                <Paper elevation={10} sx={{ padding: 2, borderRadius: '10px' }}>
                    {loading ? (
                        <Skeleton variant="rectangular" height={400} animation="wave" sx={{ borderRadius: '8px' }} />
                    ) : (
                        <LoadScript
                            googleMapsApiKey={import.meta.env.VITE_GOOGLE_API_KEY}
                            onLoad={handleScriptLoad}
                        >
                            {scriptLoaded && (
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={currentLocation || deliveryPersonLocation}
                                    zoom={18}
                                    options={mapOptions}
                                    onLoad={onMapLoad}
                                >
                                    {currentLocation && (
                                        <Marker
                                            position={currentLocation}
                                            title="Your Current Location"
                                            onClick={() => handleMarkerClick(currentLocation, 'current')}
                                            icon={getMarkerIcon(markerSize, '#32CD32')}
                                        />
                                    )}
                                    {deliveryPersonLocation && (
                                        <Marker
                                            position={deliveryPersonLocation}
                                            title="Your Set Location"
                                            onClick={() => handleMarkerClick(deliveryPersonLocation, 'delivery')}
                                            icon={getMarkerIcon(markerSize, '#FA8072')}
                                        />
                                    )}

                                    {currentLocation && deliveryPersonLocation && distance > 0.1 && (() => {
                                        const curve = generateCurvedPolyline(deliveryPersonLocation, currentLocation);
                                        const midIndex = Math.floor(curve.length / 2);
                                        const midPoint = curve[midIndex];

                                        return (
                                            <>
                                                {curve.map((point, i) => {
                                                    if (i === 0) return null;
                                                    const color = interpolateColor('#f27474', '#10d915', i / curve.length);
                                                    return (
                                                        <Polyline
                                                            key={i}
                                                            path={[curve[i - 1], point]}
                                                            options={{
                                                                strokeColor: color,
                                                                strokeOpacity: 1.0,
                                                                strokeWeight: 3,
                                                                icons: i === midIndex ? [{
                                                                    icon: {
                                                                        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                                                        scale: 4,
                                                                        strokeColor: color,
                                                                        strokeWeight: 2
                                                                    },
                                                                    offset: '100%'
                                                                }] : []
                                                            }}
                                                        />
                                                    );
                                                })}
                                                <OverlayView
                                                    position={midPoint}
                                                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                                                >
                                                    <Box sx={{
                                                        color: isDarkMode ? '#ffffff' : '#000000',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '1rem',
                                                        fontWeight: 'bold',
                                                        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
                                                    }}>
                                                        {distance.toFixed(2)} km
                                                    </Box>
                                                </OverlayView>
                                            </>
                                        );
                                    })()}

                                    {selectedLocation && (
                                        <InfoWindow
                                            position={selectedLocation}
                                            onCloseClick={() => {
                                                setSelectedLocation(null);
                                                if (mapRef) {
                                                    fitBoundsToMap(mapRef, currentLocation, deliveryPersonLocation);
                                                }
                                            }}
                                        >
                                            <Box
                                                p={0.5}
                                                sx={{
                                                    width: '300px',
                                                    maxWidth: '100%',
                                                    backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                                                    color: isDarkMode ? '#ffffff' : '#000000'
                                                }}
                                            >
                                                {fetchingAddress ? (
                                                    <CircularProgress size={24} />
                                                ) : (
                                                    <>
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            {selectedLocation.type === 'current' ? 'Your Current Location' : 'Your Set Location'}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {selectedLocation.city}, {selectedLocation.state}
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            <strong>Address:</strong> {selectedLocation.address}
                                                        </Typography><br />
                                                        <Typography variant="caption">
                                                            <strong>Lat:</strong> {selectedLocation.lat.toFixed(6)}, <strong>Lng:</strong> {selectedLocation.lng.toFixed(6)},
                                                        </Typography>
                                                        <Typography variant="caption">
                                                            <strong>Distance:</strong> {distance.toFixed(2)} km
                                                        </Typography>
                                                    </>
                                                )}
                                            </Box>
                                        </InfoWindow>
                                    )}
                                </GoogleMap>
                            )}
                        </LoadScript>
                    )}
                </Paper>
            )}
        </Grid>
    );
};

export default DeliveryBoyCurrentLocation;
