// src/pages/dashboard/components/business/BusinessDetails.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import LocationMapDisplay from './LocationMapDisplay';
import { useNavigate, Link } from 'react-router-dom';
import ReviewSection from './ReviewSection';

const BusinessDetails = ({ business, onUnsave, onUpdateOrDelete }) => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('desc');
    const { api_base_url } = window.jpbd_object || {};
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // রিভিউ কাউন্ট এখন business prop থেকে আসবে এবং এখানেই ম্যানেজ হবে
    const [reviewCount, setReviewCount] = useState(0);

    const isOwner = user && business && parseInt(user.id, 10) === parseInt(business.user_id, 10);

    // business prop পরিবর্তন হলে state গুলো আপডেট করা
    useEffect(() => {
        if (business?.id) {
            setActiveTab('desc');
            setIsSaved(business.is_saved || false);
            // সরাসরি business prop থেকে review_count সেট করা, আলাদা API কলের প্রয়োজন নেই
            setReviewCount(business.review_count || 0);
        }
    }, [business]);

    if (!business) {
        return (
            <div className="dir-card-details p-5 text-center d-flex align-items-center justify-content-center h-100">
                <h5>Select a business from the list to see more details.</h5>
            </div>
        );
    }

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this business listing?")) {
            try {
                await axios.delete(`${api_base_url}businesses/${business.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert('Business deleted successfully!');
                if (onUpdateOrDelete) onUpdateOrDelete(); // প্যারেন্টকে জানানো
            } catch (error) {
                alert(error.response?.data?.message || "Failed to delete business.");
            }
        }
    };
    
    const handleToggleSave = async () => {
        setSaving(true);
        try {
            const response = await axios.post(`${api_base_url}saved-items/toggle`, {
                item_id: business.id,
                item_type: 'business',
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            
            setIsSaved(response.data.status === 'saved');

            if (response.data.status === 'unsaved' && onUnsave) {
                onUnsave(business.id);
            }
        } catch (error) {
            alert("Could not update save status.");
        } finally {
            setSaving(false);
        }
    };
    
    // ডেটা পার্সিং এবং ডিফল্ট ভ্যালু সেট করা
    // businessHours এবং mapLocation এখন আর পার্স করার প্রয়োজন নেই, কারণ API থেকে অবজেক্ট হিসেবে আসছে
    const businessHours = business.businessHours || []; 
    const mapLocation = business.mapLocation || null;
    const services = business.services ? business.services.split(',').map(s => s.trim()).filter(Boolean) : [];
    const certifications = business.certifications ? business.certifications.split(',').map(c => c.trim()).filter(Boolean) : [];

    return (
        <div className="dir-card-details">
            {/* Header, Info, Actions Section */}
            <div className="dir-card-details__header">
                <div className="dir-card-details__logo">
                    {business.logo_url ? <img src={business.logo_url} alt={`${business.title} logo`} /> : <div className="logo-placeholder">{business.title?.charAt(0).toUpperCase()}</div>}
                </div>
                <div>
                    <div className="dir-card-details__badge">
                        <span className="status-dot"></span> {business.status || 'Status not available'}
                    </div>
                    <div className="d-flex justify-content-start align-items-center gap-2">
                        <div>
                            <h3 className="company-name">{business.title}</h3>
                            <p className="company-type">{business.tagline}</p>
                        </div>
                        {isOwner && (
                            <div className="dropdown ms-auto me-0">
                                <button className="icon-btn-xl" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="ri-more-2-fill"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><Link className="dropdown-item" to={`/dashboard/edit-business/${business.id}`}>Edit</Link></li>
                                    <li><a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); handleDelete(); }}>Delete</a></li>
                                </ul>
                            </div>
                        )}
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
                        {business.average_rating || 0} <i className="ri-star-s-fill"></i>
                    </p>
                </div>
            </div>

            <div className="dir-card-details__actions">
                <button className="i-btn btn--dark btn--xl">Get in touch</button>
                <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="i-btn btn--outline btn--xl">Visit Website</a>
                <button className="icon-btn-xl ms-auto me-0" onClick={handleToggleSave} disabled={saving}>
                    <i className={isSaved ? "ri-bookmark-fill text-primary" : "ri-bookmark-line"}></i>
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
                    {activeTab === 'desc' && (
                        <div className="tab-pane fade show active p-4">
                            <p>{business.details}</p>
                            {business.founded_year && <div className="mb-3 badge-wrap"><span className="badge bg-light text-dark me-2">Founded</span><span className="fw-semibold">{business.founded_year}</span></div>}
                            {certifications.length > 0 && <div className="mb-3 badge-wrap"><span className="badge bg-light text-dark me-2">Certifications</span><span className="fw-semibold">{certifications.join(', ')}</span></div>}
                            {businessHours.length > 0 && (
                                <div className="accordion" id="openHoursAccordion">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header"><button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseHours">Open hours</button></h2>
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
                    {activeTab === 'services' && (
                        <div className="tab-pane fade show active p-4">
                            <div className="d-flex flex-row flex-wrap gap-2">
                               {services.map((service, index) => <span key={index} className="badge rounded-pill skill-badge style-two">{service}</span>)}
                            </div>
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="tab-pane fade show active">
                            <ReviewSection 
                                businessId={business.id}
                                onReviewSubmitted={() => {
                                    // নতুন রিভিউ জমা হলে কাউন্ট বাড়ানো হয়
                                    setReviewCount(prev => prev + 1);
                                    // প্যারেন্টকে জানানো হয় যাতে পুরো লিস্ট রিফ্রেশ হয়
                                    if (onUpdateOrDelete) onUpdateOrDelete();
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessDetails;