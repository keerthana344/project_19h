import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to their own dashboard if they try to access another one
        return <Navigate to={`/dashboard/${userRole}`} replace />;
    }

    return children;
};

export default ProtectedRoute;
