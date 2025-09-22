// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Auth state
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('authToken')); // শুধু প্রথমবার localStorage থেকে নেয়
    const [loading, setLoading] = useState(true);
    
    // Notification state
    const [notifications, setNotifications] = useState([]);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);

    // Pusher instance ধরে রাখার জন্য useRef
    const pusherRef = useRef(null);

    // window.jpbd_object থেকে ভ্যালু আনা
    const { api_base_url, pusher_key, pusher_cluster } = window.jpbd_object || {};

    // লগইন করা ইউজারের জন্য প্রাথমিক ডেটা (নোটিফিকেশন) আনার ফাংশন
    const fetchInitialData = async (currentToken) => {
        if (!currentToken) {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`${api_base_url}notifications`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            setNotifications(response.data.notifications);
            setUnreadNotifCount(response.data.unread_count);
        } catch (error) {
            console.error("Failed to fetch initial notifications", error);
            if (error.response && error.response.status === 401) {
                // টোকেন inválid হলে স্বয়ংক্রিয়ভাবে লগ-আউট
                logout();
            }
        }
    };

    // শুধুমাত্র প্রথমবার অ্যাপ লোড হওয়ার সময় এই useEffect রান করবে
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUserData = localStorage.getItem('userData');
        
        if (storedToken && storedUserData) {
            setUser(JSON.parse(storedUserData));
            fetchInitialData(storedToken);
        }
        setLoading(false);
    }, []); // খালি dependency array মানে এটি শুধু মাউন্ট হওয়ার সময় রান হবে

    // Pusher কানেকশন ম্যানেজ করার জন্য useEffect
    useEffect(() => {
        // যদি পুরনো কোনো কানেকশন থাকে, তাহলে সেটি প্রথমে বন্ধ করা
        if (pusherRef.current) {
            pusherRef.current.disconnect();
        }

        // টোকেন এবং ইউজার থাকলেই শুধুমাত্র Pusher কানেকশন তৈরি হবে
        if (token && user && pusher_key && pusher_cluster) {
            const pusher = new Pusher(pusher_key, {
                cluster: pusher_cluster,
                authEndpoint: `${api_base_url}pusher/auth`,
                auth: { headers: { 'Authorization': `Bearer ${token}` } }
            });

            pusherRef.current = pusher; // নতুন instance সেভ করা

            const channel = pusher.subscribe(`private-notifications-${user.id}`);

            const handleNewNotification = (newNotification) => {
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadNotifCount(prev => prev + 1);
            };

            channel.bind('new-notification', handleNewNotification);

            // ক্লিন-আপ ফাংশন: কম্পোনেন্ট আনমাউন্ট হলে বা dependency পরিবর্তন হলে রান হবে
            return () => {
                if (pusherRef.current) {
                    pusherRef.current.unsubscribe(`private-notifications-${user.id}`);
                    pusherRef.current.disconnect();
                    pusherRef.current = null;
                }
            };
        }
    }, [token, user, pusher_key, pusher_cluster, api_base_url]); // dependency গুলো এখানে আছে

    // লগইন ফাংশন
    const login = async (userData, userToken) => {
        localStorage.setItem('authToken', userToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        await fetchInitialData(userToken); // লগইন করার পর নতুন করে নোটিফিকেশন আনা
    };

    // লগ-আউট ফাংশন
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setToken(null);
        setUser(null);
        setNotifications([]);
        setUnreadNotifCount(0);
        // Pusher কানেকশন বন্ধ করা
        if (pusherRef.current) {
            pusherRef.current.disconnect();
            pusherRef.current = null;
        }
    };

    // ইউজার প্রোফাইল আপডেট করার ফাংশন
    const updateUserContext = (newUserData) => {
        setUser(prevUser => {
            const updatedUser = { ...prevUser, ...newUserData };
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    // নোটিফিকেশন 'পড়া হয়েছে' হিসেবে মার্ক করার ফাংশন
    const markNotificationsAsRead = async () => {
        if (unreadNotifCount === 0) return;

        setUnreadNotifCount(0);
        setNotifications(prev => prev.map(n => ({...n, is_read: 1})));

        try {
             await axios.post(`${api_base_url}notifications/mark-as-read`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch(error) {
            console.error("Failed to mark notifications as read", error);
        }
    };

    const clearAllNotifications = async () => {
        // যদি কোনো নোটিফিকেশন না থাকে, তাহলে কিছুই করার দরকার নেই
        if (notifications.length === 0) return;

        // UI থেকে সাথে সাথে মুছে ফেলা (Optimistic Update)
        const oldNotifications = [...notifications]; // পুরনো নোটিফিকেশনগুলো সেভ করে রাখা
        setNotifications([]);
        setUnreadNotifCount(0);

        // API কল করে সার্ভার থেকে মুছে ফেলা
        try {
            await axios.delete(`${api_base_url}notifications/clear-all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to clear notifications", error);
            // যদি API কলে এরর হয়, তাহলে UI তে পুরনো নোটিফিকেশনগুলো ফিরিয়ে আনা
            setNotifications(oldNotifications);
            // আনরিড কাউন্টও ফিরিয়ে আনা যেতে পারে, তবে এটি একটু জটিল
        }
    };
    
    const isAuthenticated = !!user;

    // Context Provider-এর জন্য ভ্যালু অবজেক্ট
    const contextValue = {
        user,
        token,
        isAuthenticated,
        login,
        logout,
        loading,
        updateUserContext,
        notifications,
        unreadNotifCount,
        markNotificationsAsRead,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// কাস্টম হুক
export const useAuth = () => {
    return useContext(AuthContext);
};