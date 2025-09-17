// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // ================== পরিবর্তন এখানে (ধাপ ১) ==================
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    // ========================================================
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // অ্যাপ লোড হওয়ার সময় localStorage থেকে টোকেন এবং ইউজার ডেটা চেক করা
        const storedToken = localStorage.getItem('authToken');
        const storedUserData = localStorage.getItem('userData');
        
        if (storedToken && storedUserData) {
            setUser(JSON.parse(storedUserData));
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = (userData, userToken) => {
        localStorage.setItem('authToken', userToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        // ================== পরিবর্তন এখানে (ধাপ ২) ==================
        setToken(userToken); // লগইন করার সময় টোকেন state-ও আপডেট করুন
        // ========================================================
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUser(null);
        // ================== পরিবর্তন এখানে (ধাপ ৩) ==================
        setToken(null); // লগ-আউট করার সময় টোকেন state রিসেট করুন
        // ========================================================
    };

    const isAuthenticated = !!user;

    return (
        // ================== পরিবর্তন এখানে (ধাপ ৪) ==================
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
        // ========================================================
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};