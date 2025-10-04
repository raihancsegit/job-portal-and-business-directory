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
        // যদি authLoading হয় বা ইউজার না থাকে, তাহলে API কল না করা
        if (authLoading || !user || !token) {
            // authLoading শেষ না হওয়া পর্যন্ত লোডিং দেখানো
            if (authLoading) {
                setLoading(true);
            } else {
                setLoading(false);
            }
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
    }, [user, token, authLoading, api_base_url]);
    
    // ইউজার রোল চেক
    const isCandidate = user?.roles?.includes('candidate');
    const isBusiness = user?.roles?.includes('business');

    // =====================================================================
    // Candidate & Business View (নতুন ডিজাইন)
    // =====================================================================
    const renderCandidateOrBusinessView = () => (
        <div className="row g-2">
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header">
                        <h4 className="card-title">Saved</h4>
                        <Link to="/dashboard/saved" className="icon-btn-lg"><i className="ri-arrow-right-up-line"></i></Link>
                    </div>
                    <div className="card-body pt-0">
                        {loading ? <h3 className="fs-72 placeholder-glow"><span className="placeholder col-3"></span></h3> : <h3 className="fs-72">{stats?.saved_opportunities_count ?? 0}</h3>}
                    </div>
                </div>
            </div>
            {/* <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header">
                        <h4 className="card-title">Saved Businesses</h4>
                        <Link to="/dashboard/saved" className="icon-btn-lg"><i className="ri-arrow-right-up-line"></i></Link>
                    </div>
                    <div className="card-body pt-0">
                         {loading ? <h3 className="fs-72 placeholder-glow"><span className="placeholder col-3"></span></h3> : <h3 className="fs-72">{stats?.saved_businesses_count ?? 0}</h3>}
                    </div>
                </div>
            </div> */}
            
            {/* Candidate-দের জন্য "Times Hired" কার্ড */}
            {isCandidate && (
                 <div className="col-lg-6 col-md-6">
                    <div className="i-card-md min-h-176">
                        <div className="card-header"><h4 className="card-title">Times Hired</h4></div>
                        <div className="card-body pt-0">
                            {loading ? <h3 className="fs-72 placeholder-glow"><span className="placeholder col-2"></span></h3> : <h3 className="fs-72">{stats?.hired_count ?? 0}</h3>}
                        </div>
                    </div>
                </div>
            )}

            {/* Business-দের জন্য "My Listings" কার্ড */}
            {isBusiness && (
                <div className="col-lg-6 col-md-6">
                    <div className="i-card-md min-h-176">
                        <div className="card-header"><h4 className="card-title">My Listings</h4></div>
                        <div className="card-body pt-0">
                            {loading ? <h3 className="fs-72 placeholder-glow"><span className="placeholder col-2"></span></h3> : <h3 className="fs-72">{stats?.my_listings_count ?? 0}</h3>}
                        </div>
                    </div>
                </div>
            )}
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
                    <div className="card-body pt-0">{(loading) ? (<h3 className="fs-72 placeholder-glow"><span className="placeholder col-4"></span></h3>) : (<h3 className="fs-72">{stats?.total_businesses || 0}</h3>)}</div>
                </div>
            </div>
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header"><h4 className="card-title">Candidate Hired</h4>
                    <Link 
                            to="/dashboard/opportunities" 
                            state={{ defaultTab: 'hired' }} 
                            className="icon-btn-lg">
                         <i className="ri-arrow-right-up-line"></i></Link></div>
                    <div className="card-body pt-0">{(loading) ? (<h3 className="fs-72 placeholder-glow"><span className="placeholder col-3"></span></h3>) : (<h3 className="fs-72">{stats?.total_hired || 0}</h3>)}</div>
                </div>
            </div>
        </div>
    );

    // =====================================================================
    // Final Rendering Logic
    // =====================================================================
    if (authLoading) {
        // AuthContext থেকে ইউজার লোড না হওয়া পর্যন্ত লোডিং দেখানো
        return (
             <div className="row g-2">
                <div className="col-lg-6 col-md-6"><div className="i-card-md min-h-176"><div className="card-header"><h4 className="card-title placeholder-glow"><span className="placeholder col-6"></span></h4></div><div className="card-body pt-0"><h3 className="fs-72 placeholder-glow"><span className="placeholder col-4"></span></h3></div></div></div>
                <div className="col-lg-6 col-md-6"><div className="i-card-md min-h-176"><div className="card-header"><h4 className="card-title placeholder-glow"><span className="placeholder col-5"></span></h4></div><div className="card-body pt-0"><h3 className="fs-72 placeholder-glow"><span className="placeholder col-3"></span></h3></div></div></div>
            </div>
        );
    }
    
    if (isCandidate || isBusiness) {
        return renderCandidateOrBusinessView();
    }
    
    // ডিফল্ট হিসেবে এমপ্লয়ার ভিউ
    return renderEmployerView();
};

export default StatsCards;