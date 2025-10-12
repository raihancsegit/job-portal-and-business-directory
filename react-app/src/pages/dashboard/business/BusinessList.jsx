// src/pages/dashboard/components/business/BusinessList.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

// ================== নতুন: স্টার রেন্ডারিং-এর জন্য Helper Component ==================
/**
 * Renders star icons based on a numeric score.
 * @param {object} props - Component props.
 * @param {number} props.score - The rating score (e.g., 4.5).
 * @returns {JSX.Element} - A set of star icons.
 */
const RenderStars = ({ score }) => {
    const totalStars = 5;
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.3; // 0.3 বা তার বেশি হলে হাফ স্টার দেখানো হবে
    const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <>
            {Array.from({ length: fullStars }, (_, i) => <i key={`full-${i}`} className="ri-star-fill"></i>)}
            {hasHalfStar && <i key="half" className="ri-star-half-fill"></i>}
            {Array.from({ length: emptyStars }, (_, i) => <i key={`empty-${i}`} className="ri-star-line"></i>)}
        </>
    );
};
// =================================================================================

const BusinessCard = ({ business, onSelect, isActive, onUnsave }) => {
    const { token } = useAuth();
    const { api_base_url } = window.jpbd_object || {};

    // ================== হার্ডকোডেড ডেটার পরিবর্তে API থেকে আসা ডাইনামিক ডেটা ==================
    const ratingScore = business.average_rating || 0;
    const reviewCount = business.review_count || 0;
    const status = business.status || 'Status Unavailable';
    // =======================================================================================

    const [isSaved, setIsSaved] = useState(business.is_saved || false);
    const [saving, setSaving] = useState(false);

    // business prop পরিবর্তন হলে isSaved স্টেট আপডেট করা
    useEffect(() => {
        setIsSaved(business.is_saved || false);
    }, [business.is_saved]);

    const handleToggleSave = async (e) => {
        e.stopPropagation(); // Parent div-এর onClick ট্রিগার হওয়া থেকে বিরত রাখা
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
            alert("Could not update save status. Please try again.");
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
                            <img src={business.logo_url} alt={business.title} /> :
                            <div className="logo-placeholder">{business.title?.charAt(0).toUpperCase()}</div>
                        }
                    </div>
                    <div className="dir-card__badge">
                        <span className="status-dot"></span>
                        {status}
                    </div>
                </div>

                {/* ================== Rating সেকশন এখন সম্পূর্ণ ডাইনামিক ================== */}
                <div className="dir-card__rating">
                    <span className="rating-score">{ratingScore}</span>
                    <span className="stars">
                        <RenderStars score={parseFloat(ratingScore)} />
                    </span>
                    <span className="reviews">({reviewCount} reviews)</span>
                </div>
                {/* ========================================================================= */}

                {/* Company Info */}
                <h4 className="company-name">{business.title}</h4>
                <p className="company-type">{business.industry || 'N/A'}</p>
                <p className="company-location">{business.city}, {business.country_code}</p>

                {/* Save Button */}
               <button className="save-btn" onClick={handleToggleSave} disabled={saving}>
                    <i className={isSaved ? "ri-bookmark-fill text-primary" : "ri-bookmark-line"}></i>
                </button>
            </div>
        </div>
    );
};

const BusinessList = ({ businesses, onSelectBusiness, selectedBusiness, onUnsave }) => {
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