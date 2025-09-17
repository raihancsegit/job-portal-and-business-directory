import React from 'react';

const BusinessCard = ({ business, onSelect, isActive }) => {
    // এই ডেটাগুলো ডাইনামিকভাবে আসবে, আপাতত ডেমো হিসেবে দেওয়া হলো
    const rating = business.rating || { score: 4.6, reviews: 56 };
    const status = business.status || 'Open to contracts';

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
                <button className="save-btn" onClick={(e) => {
                    e.stopPropagation(); // কার্ডে ক্লিক হওয়া থেকে আটকানোর জন্য
                    console.log('Save button clicked for:', business.title);
                    // এখানে সেভ করার লজিক যোগ করা হবে
                }}>
                    <i className="ri-bookmark-line"></i>
                </button>
            </div>
        </div>
    );
};

const BusinessList = ({ businesses, onSelectBusiness, selectedBusiness }) => {
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
                    />
                ))}
            </div>
        </div>
    );
};

export default BusinessList;