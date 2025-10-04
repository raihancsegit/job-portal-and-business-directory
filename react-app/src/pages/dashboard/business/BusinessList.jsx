import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

const BusinessCard = ({ business, onSelect, isActive,onUnsave  }) => {
    // এই ডেটাগুলো ডাইনামিকভাবে আসবে, আপাতত ডেমো হিসেবে দেওয়া হলো
    const { token } = useAuth();
    const { api_base_url } = window.jpbd_object || {};

    const rating = business.rating || { score: 4.6, reviews: 56 };
    const status = business.status || 'Open to contracts';

    const [isSaved, setIsSaved] = useState(business.is_saved || false);
    const [saving, setSaving] = useState(false);

     useEffect(() => {
        setIsSaved(business.is_saved || false);
    }, [business.is_saved]);

    const handleToggleSave = async (e) => {
        e.stopPropagation();
        setSaving(true);
        try {
            const response = await axios.post(`${api_base_url}saved-items/toggle`, {
                item_id: business.id,
                item_type: 'business', // <-- আইটেম টাইপ 'business'
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            
            setIsSaved(response.data.status === 'saved');
            
            // যদি Saved পেজে থাকি এবং আনসেভ করা হয়, তাহলে প্যারেন্টকে জানানো
            if (response.data.status === 'unsaved' && onUnsave) {
                onUnsave(business.id);
            }
        } catch (error) {
            alert("Could not update save status.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="col-lg-12 col-sm-6" onClick={() => onSelect(business)}>
            <div className={`i-card-md dir-card ${isActive ? 'active' : ''}`}>
                <div className="dir-card__header">
                    <div className="dir-card__logo">
                        {business.logo_url ? 
                            <img src={business.logo_url} alt={business.title} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '50%' }} /> :
                            <div className="logo-placeholder"></div> // যদি লোগো না থাকে
                        }
                    </div>
                    <div className="dir-card__badge">
                        <span className="status-dot"></span>
                        {status}
                    </div>
                </div>

                {/* Rating */}
                <div className="dir-card__rating">
                    <span className="rating-score">{rating.score}</span>
                    <span className="stars">
                        {/* ডাইনামিক স্টার রেন্ডারিং-এর জন্য একটি Helper ফাংশন ব্যবহার করা যেতে পারে */}
                        <i className="ri-star-fill"></i>
                        <i className="ri-star-fill"></i>
                        <i className="ri-star-fill"></i>
                        <i className="ri-star-fill"></i>
                        <i className="ri-star-half-fill"></i>
                    </span>
                    <span className="reviews">({rating.reviews} reviews)</span>
                </div>

                {/* Company Info */}
                <h4 className="company-name">{business.title}</h4>
                <p className="company-type">{business.industry || 'N/A'}</p>
                <p className="company-location">{business.city}, {business.country_code}</p>

                {/* Save Button */}
               <button className="save-btn" onClick={handleToggleSave} disabled={saving}>
                    {/* আইকনটি এখন ডাইনামিক */}
                    <i className={isSaved ? "ri-bookmark-fill text-primary" : "ri-bookmark-line"}></i>
                </button>
            </div>
        </div>
    );
};

const BusinessList = ({ businesses, onSelectBusiness, selectedBusiness,onUnsave  }) => {
    if (!businesses || businesses.length === 0) {
        return (
            <div className="text-center p-5">
                <h5>No businesses found.</h5>
                <p className="text-muted">Try adjusting your search filters.</p>
            </div>
        );
    }
    
    return (
        <div id="job-listings" className="job-listings">
            <div className="row g-3">
                {businesses.map(business => (
                    <BusinessCard 
                        key={business.id} 
                        business={business} 
                        onSelect={onSelectBusiness}
                        isActive={selectedBusiness?.id === business.id}
                        onUnsave={onUnsave}
                    />
                ))}
            </div>
        </div>
    );
};

export default BusinessList;