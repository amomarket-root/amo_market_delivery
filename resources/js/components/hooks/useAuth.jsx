import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('delivery_token');
            if (token) {
                try {
                    // You can add token validation logic here if needed
                    setIsAuthenticated(true);
                } catch (error) {
                    localStorage.removeItem('delivery_token');
                    setIsAuthenticated(false);
                    navigate('/login');
                }
            } else {
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [navigate]);

    return { isAuthenticated, isLoading };
};
