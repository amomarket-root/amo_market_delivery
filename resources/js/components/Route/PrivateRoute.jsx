import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loader-container">
                <img src="/image/loader.gif" alt="Loading..." className="loader" />
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
