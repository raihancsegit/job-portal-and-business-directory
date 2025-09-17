// src/components/dashboard/StatsCards.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const { api_base_url } = window.jpbd_object || {};

const StatsCards = () => {
    const { user, token, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user || !token) {
            setLoading(false);
            setStats(null);
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${api_base_url}dashboard/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                setStats(null);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user, token, authLoading]);
    
    // User role check
    const isCandidate = user?.roles?.includes('candidate');
    const isBusiness = user?.roles?.includes('business');

    // =====================================================================
    // Candidate's View
    // =====================================================================
    const renderCandidateView = () => (
        <div className="row g-2">
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header"><h4 className="card-title">Times Hired</h4></div>
                    <div className="card-body pt-0">
                        {loading ? <h3 className="fs-72 placeholder-glow"><span className="placeholder col-3"></span></h3> : <h3 className="fs-72">{stats?.hired_count || 0}</h3>}
                    </div>
                </div>
            </div>
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header"><h4 className="card-title">Saved Jobs</h4><button className="icon-btn-lg"><i className="ri-arrow-right-up-line"></i></button></div>
                    <div className="card-body pt-0">
                        <h3 className="fs-72">{stats?.saved_jobs_count || 0}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
    
    // =====================================================================
    // Business's View
    // =====================================================================
    const renderBusinessView = () => (
         <div className="row g-2">
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header"><h4 className="card-title">My Business Listings</h4></div>
                    <div className="card-body pt-0">
                        {loading ? <h3 className="fs-72 placeholder-glow"><span className="placeholder col-4"></span></h3> : <h3 className="fs-72">{stats?.business_listings_count || 0}</h3>}
                    </div>
                </div>
            </div>
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header"><h4 className="card-title">Saved Items</h4><button className="icon-btn-lg"><i className="ri-arrow-right-up-line"></i></button></div>
                    <div className="card-body pt-0">
                        <h3 className="fs-72">{stats?.saved_items_count || 0}</h3>
                    </div>
                </div>
            </div>
        </div>
    );

    // =====================================================================
    // Employer's View (Default)
    // =====================================================================
    const renderEmployerView = () => (
        <div className="row g-2">
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header"><h4 className="card-title">Total Business Listing</h4></div>
                    <div className="card-body pt-0">{(authLoading || loading) ? (<h3 className="fs-72 placeholder-glow"><span className="placeholder col-4"></span></h3>) : (<h3 className="fs-72">{stats?.total_businesses || 0}</h3>)}</div>
                </div>
            </div>
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header"><h4 className="card-title">Candidate Hired</h4><Link to="/dashboard/applicants?status=hired" className="icon-btn-lg"><i className="ri-arrow-right-up-line"></i></Link></div>
                    <div className="card-body pt-0">{(authLoading || loading) ? (<h3 className="fs-72 placeholder-glow"><span className="placeholder col-3"></span></h3>) : (<h3 className="fs-72">{stats?.total_hired || 0}</h3>)}</div>
                </div>
            </div>
        </div>
    );

    // =====================================================================
    // Final Rendering Logic
    // =====================================================================
    if (authLoading) {
        // Auth লোড হওয়া পর্যন্ত একটি সাধারণ লোডিং স্টেট দেখানো যেতে পারে
        return (
             <div className="row g-2">
                <div className="col-lg-6 col-md-6"><div className="i-card-md min-h-176"><div className="card-body pt-0"><h3 className="fs-72 placeholder-glow"><span className="placeholder col-4"></span></h3></div></div></div>
                <div className="col-lg-6 col-md-6"><div className="i-card-md min-h-176"><div className="card-body pt-0"><h3 className="fs-72 placeholder-glow"><span className="placeholder col-3"></span></h3></div></div></div>
            </div>
        );
    }
    
    if (isCandidate) {
        return renderCandidateView();
    }
    
    if (isBusiness) {
        return renderBusinessView();
    }
    
    // ডিফল্ট হিসেবে এমপ্লয়ার ভিউ
    return renderEmployerView();
};

export default StatsCards;