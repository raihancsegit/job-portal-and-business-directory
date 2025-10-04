// src/pages/SelectRolePage.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const { api_base_url, nonce } = window.jpbd_object || {};

const SelectRolePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [userInfo, setUserInfo] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // URL থেকে user_info প্যারামিটারটি ডিকোড করা
        const infoParam = searchParams.get('user_info');
        if (infoParam) {
            try {
                // Base64 ডিকোড করে JSON পার্স করা
                const decodedInfo = JSON.parse(atob(infoParam));
                setUserInfo(decodedInfo);
            } catch (e) {
                setError('Invalid user information provided. Please try again.');
            }
        } else {
            setError('User information not found. Please initiate login again.');
        }
    }, [searchParams]);

    const handleRoleSelection = (role) => {
        setSelectedRole(role);
    };
    
    const handleRegistration = async (e) => {
        e.preventDefault();
        if (!selectedRole) {
            setError('Please select a role to continue.');
            return;
        }
        if (!userInfo) {
             setError('User data is missing. Cannot complete registration.');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            // নতুন API এন্ডপয়েন্টে ডেটা পাঠানো
            const response = await axios.post(`${api_base_url}auth/complete-social-registration`, {
                email: userInfo.email,
                full_name: userInfo.full_name,
                role: selectedRole,
                source: userInfo.source,
            }, {
                headers: { 'X-WP-Nonce': nonce }
            });

            // সফলভাবে রেজিস্ট্রেশন এবং লগইন হওয়ার পর
            const { token, ...userData } = response.data;
            login(userData, token);
            navigate('/dashboard');

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete registration.');
        } finally {
            setLoading(false);
        }
    };
    
    if (error) {
        return (
            <AuthLayout>
                <div className="text-center p-5">
                    <h3 className="text-danger">An Error Occurred</h3>
                    <p>{error}</p>
                    <button onClick={() => navigate('/login')} className="i-btn btn--primary">Back to Login</button>
                </div>
            </AuthLayout>
        );
    }
    
    if (!userInfo) {
        return <AuthLayout><div className="p-5 text-center">Loading user data...</div></AuthLayout>;
    }

    return (
        <AuthLayout>
            <div className="auth-form-wrapper" style={{ maxWidth: '600px', margin: 'auto' }}>
                <h4 className="form-title text-center">Complete Your Profile</h4>
                <p className="text-center text-muted mb-4">Welcome, {userInfo.full_name}! Please select your role to get started.</p>

                <form onSubmit={handleRegistration}>
                    <div className="role-selection-wrapper">
                        <div 
                            className={`role-card ${selectedRole === 'candidate' ? 'selected' : ''}`}
                            onClick={() => handleRoleSelection('candidate')}
                        >
                            <h5>I am a Candidate</h5>
                            <p>Looking for job opportunities.</p>
                        </div>
                        <div 
                            className={`role-card ${selectedRole === 'business' ? 'selected' : ''}`}
                            onClick={() => handleRoleSelection('business')}
                        >
                            <h5>I am a Business</h5>
                            <p>Listing my business in the directory.</p>
                        </div>
                        <div 
                            className={`role-card ${selectedRole === 'employer' ? 'selected' : ''}`}
                            onClick={() => handleRoleSelection('employer')}
                        >
                            <h5>I am an Employer</h5>
                            <p>Looking to hire talent.</p>
                        </div>
                    </div>
                    
                    <button type="submit" className="i-btn btn--primary btn--xl w-100 rounded-pill mt-4" disabled={loading || !selectedRole}>
                        {loading ? 'Creating Account...' : 'Continue'}
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
};

export default SelectRolePage;