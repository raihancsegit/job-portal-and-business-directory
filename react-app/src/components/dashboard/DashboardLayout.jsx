import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

function DashboardLayout() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading session...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <Header />
            <div className="dashboard-wrapper">
                <Sidebar />
                <main className="main-content" data-simplebar>
                    <Outlet />
                </main>
            </div>
        </>
    );
}

export default DashboardLayout;