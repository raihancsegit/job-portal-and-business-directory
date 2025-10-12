// src/components/dashboard/StatsCards.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const StatsCards = ({ data, loading }) => {
    const { user } = useAuth();
    
    const isCandidate = user?.roles?.includes('candidate');
    const isBusiness = user?.roles?.includes('business');

    // Loading Placeholder
    const renderPlaceholder = () => (
         <div className="row g-2">
            <div className="col-lg-6 col-md-6"><div className="i-card-md min-h-176"><div className="card-header"><h4 className="card-title placeholder-glow"><span className="placeholder col-6"></span></h4></div><div className="card-body pt-0"><h3 className="fs-72 placeholder-glow"><span className="placeholder col-4"></span></h3></div></div></div>
            <div className="col-lg-6 col-md-6"><div className="i-card-md min-h-176"><div className="card-header"><h4 className="card-title placeholder-glow"><span className="placeholder col-5"></span></h4></div><div className="card-body pt-0"><h3 className="fs-72 placeholder-glow"><span className="placeholder col-3"></span></h3></div></div></div>
        </div>
    );

    if (loading) return renderPlaceholder();

    // Candidate & Business View
    const renderCandidateOrBusinessView = () => (
        <div className="row g-2">
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header">
                        <h4 className="card-title">Saved Opportunities</h4>
                        <Link to="/dashboard/saved" className="icon-btn-lg"><i className="ri-arrow-right-up-line"></i></Link>
                    </div>
                    <div className="card-body pt-0"><h3 className="fs-72">{data?.saved_opportunities_count ?? 0}</h3></div>
                </div>
            </div>
            {isCandidate && (
                 <div className="col-lg-6 col-md-6">
                    <div className="i-card-md min-h-176">
                        <div className="card-header"><h4 className="card-title">Times Hired</h4></div>
                        <div className="card-body pt-0"><h3 className="fs-72">{data?.hired_count ?? 0}</h3></div>
                    </div>
                </div>
            )}
            {isBusiness && (
                <div className="col-lg-6 col-md-6">
                    <div className="i-card-md min-h-176">
                        <div className="card-header"><h4 className="card-title">My Listings</h4></div>
                        <div className="card-body pt-0"><h3 className="fs-72">{data?.my_listings_count ?? 0}</h3></div>
                    </div>
                </div>
            )}
        </div>
    );
    
    // Employer's View
    const renderEmployerView = () => (
        <div className="row g-2">
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header"><h4 className="card-title">Total Business Listing</h4></div>
                    <div className="card-body pt-0"><h3 className="fs-72">{data?.total_businesses || 0}</h3></div>
                </div>
            </div>
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header">
                        <h4 className="card-title">Candidate Hired</h4>
                        <Link to="/dashboard/opportunities" state={{ defaultTab: 'hired' }} className="icon-btn-lg"><i className="ri-arrow-right-up-line"></i></Link>
                    </div>
                    <div className="card-body pt-0"><h3 className="fs-72">{data?.total_hired || 0}</h3></div>
                </div>
            </div>
        </div>
    );

    if (isCandidate || isBusiness) return renderCandidateOrBusinessView();
    return renderEmployerView();
};

export default StatsCards;