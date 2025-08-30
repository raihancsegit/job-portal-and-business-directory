import React from 'react';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Welcome to your Dashboard, {user ? user.user_display_name : 'Guest'}!</h1>
            <p>This is a protected area.</p>
            <button onClick={logout} className="i-btn btn--primary">Logout</button>
        </div>
    );
}

export default DashboardPage;