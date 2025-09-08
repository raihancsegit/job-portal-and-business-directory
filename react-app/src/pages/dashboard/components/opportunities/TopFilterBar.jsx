import React from 'react';

const TopFilterBar = ({ filters, setFilters }) => {
    
    // ১. একটি হ্যান্ডলার ফাংশন তৈরি করা
    const handleChange = (e) => {
        const { name, value } = e.target;
        // ২. মূল পেজের state আপডেট করা
        setFilters(prev => ({...prev, [name]: value}));
    };
    
    return (
        <div className="top-filter">
            <div className="row g-3 d-flex align-items-center">
                <div className="col-md-3">
                    <div className="top-filter-item">
                        <div className="icon"><i className="ri-briefcase-line"></i></div>
                        {/* ৩. input-কে state-এর সাথে যুক্ত করা */}
                        <input type="text" name="searchTitle" placeholder="Job title" className="form-control flex-grow-1" value={filters.searchTitle} onChange={handleChange} />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="top-filter-item">
                        <div className="icon"><i className="ri-map-pin-line"></i></div>
                        <input type="text" name="searchLocation" placeholder="Location" className="form-control flex-grow-1" value={filters.searchLocation} onChange={handleChange} />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="top-filter-item">
                        <div className="icon"><i className="ri-time-line"></i></div>
                        <select name="experience" className="form-select border-0 bg-transparent flex-grow-1 text-secondary" value={filters.experience} onChange={handleChange}>
                            <option value="">Experience level</option>
                            <option value="No experience">No experience</option>
                            <option value="1-2 years">1-2 years</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-2 d-flex justify-content-end">
                     <button className="i-btn btn--lg btn--dark"><i className="ri-search-line me-2"></i>Search</button>
                </div>
            </div>
        </div>
    );
};
export default TopFilterBar;