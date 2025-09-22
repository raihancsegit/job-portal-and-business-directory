// src/pages/dashboard/components/business/BusinessDetails.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import LocationMapDisplay from './LocationMapDisplay';
import StarRating from './StarRating';
import ReviewSection from './ReviewSection';

const BusinessDetails = ({ business }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('desc');
    const [reviewCount, setReviewCount] = useState(0);
     const { api_base_url } = window.jpbd_object || {};

    useEffect(() => {
        if (business?.id) {
            setActiveTab('desc'); // ডিফল্ট ট্যাবে ফেরা

            const fetchReviewCount = async () => {
                try {
                    const response = await axios.get(`${api_base_url}businesses/${business.id}/reviews/count`);
                    setReviewCount(response.data.count);
                } catch (error) {
                    console.error("Failed to fetch review count", error);
                    setReviewCount(0); // এরর হলে 0 সেট করা
                }
            };

            fetchReviewCount();
        }
    }, [business, api_base_url]);

    if (!business) {
        return (
            <div className="dir-card-details p-5 text-center d-flex align-items-center justify-content-center h-100">
                <h5>Select a business from the list to see more details.</h5>
            </div>
        );
    }
    
    // ডেটা পার্সিং এবং ডিফল্ট ভ্যালু সেট করা
    const businessHours = business.business_hours ? JSON.parse(business.business_hours) : [];
    const services = business.services ? business.services.split(',').map(s => s.trim()).filter(Boolean) : [];
    const certifications = business.certifications ? business.certifications.split(',').map(c => c.trim()).filter(Boolean) : [];
    const mapLocation = business.map_location ? JSON.parse(business.map_location) : null;
    const ratingSummary = { score: 4.8 }; // এটি পরে API থেকে ডাইনামিক করা হবে

    return (
        <div className="dir-card-details">
            {/* Header, Info, Actions Section */}
            <div className="dir-card-details__header">
                <div className="dir-card-details__logo">
                    {business.logo_url && <img src={business.logo_url} alt={`${business.title} logo`} />}
                </div>
                <div>
                    <div className="dir-card-details__badge">
                        <span className="status-dot"></span> {business.status || 'Status not available'}
                    </div>
                    <div>
                        <h3 className="company-name">{business.title}</h3>
                        <p className="company-type">{business.tagline}</p>
                    </div>
                </div>
            </div>

            <div className="dir-card-details__info">
                <div className="location">
                    <span className="label">Location</span>
                    <p className="value">{business.city || 'Not specified'}</p>
                </div>
                <div className="rating">
                    <span className="label">Ratings</span>
                    <p className="value">
                        {ratingSummary.score} <i className="ri-star-s-fill"></i>
                    </p>
                </div>
            </div>

            <div className="dir-card-details__actions">
                <button className="i-btn btn--dark btn--xl">Get in touch</button>
                <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="i-btn btn--outline btn--xl">Visit Website</a>
                <button className="icon-btn-xl ms-auto me-0">
                    <i className="ri-save-line"></i>
                </button>
            </div>
            
            {/* Tabs Section */}
            <div className="dir-card-tabs mt-4">
                <ul className="nav nav-tabs" id="cardTab" role="tablist">
                    <li className="nav-item"><button className={`nav-link ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>Description</button></li>
                    <li className="nav-item"><button className={`nav-link ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>Services <span className="badge bg-secondary ms-1">{services.length}</span></button></li>
                    <li className="nav-item"><button className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews <span className="badge bg-secondary ms-1">{reviewCount}</span></button></li>
                </ul>

                <div className="tab-content rounded-bottom" id="cardTabContent">
                    {/* --- Description Tab --- */}
                    {activeTab === 'desc' && (
                        <div className="tab-pane fade show active p-4">
                            <p>{business.details}</p>
                            
                            {business.founded_year && (
                                <div className="mb-3 badge-wrap">
                                    <span className="badge bg-light text-dark me-2">Founded</span>
                                    <span className="fw-semibold">{business.founded_year}</span>
                                </div>
                            )}

                            {certifications.length > 0 && (
                                <div className="mb-3 badge-wrap">
                                    <span className="badge bg-light text-dark me-2">Certifications</span>
                                    <span className="fw-semibold">{certifications.join(', ')}</span>
                                </div>
                            )}
                            
                            {businessHours.length > 0 && (
                                <div className="accordion" id="openHoursAccordion">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingHours">
                                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseHours">
                                                Open hours
                                            </button>
                                        </h2>
                                        <div id="collapseHours" className="accordion-collapse collapse" data-bs-parent="#openHoursAccordion">
                                            <div className="accordion-body">
                                                <ul className="list-unstyled mb-0">
                                                    {businessHours.map((hour, index) => (
                                                        <li key={index}><strong>{hour.day}:</strong> {hour.fullDay ? 'Open 24 Hours' : `${hour.startTime} - ${hour.endTime}`}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <LocationMapDisplay location={mapLocation} businessName={business.title} />
                        </div>
                    )}

                    {/* --- Services Tab --- */}
                    {activeTab === 'services' && (
                        <div className="tab-pane fade show active p-4">
                            <div className="d-flex flex-row flex-wrap gap-2">
                               {services.map((service, index) => <span key={index} className="badge rounded-pill skill-badge style-two">{service}</span>)}
                            </div>
                        </div>
                    )}

                    {/* --- Reviews Tab --- */}
                    {activeTab === 'reviews' && (
                        <div className="tab-pane fade show active">
                            <ReviewSection businessId={business.id}  onReviewCountChange={setReviewCount} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessDetails;