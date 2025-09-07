import React from 'react';

const TopFilterBar = () => {
    return (
        <div className="top-filter">
            <div className="row g-3 d-flex align-items-center">
                <div className="col-md-3">
                    <div className="top-filter-item">
                        <div className="icon"><i className="ri-briefcase-line"></i></div>
                        <input type="text" placeholder="Job title" className="form-control flex-grow-1" />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="top-filter-item">
                        <div className="icon"><i className="ri-map-pin-line"></i></div>
                        <input type="text" placeholder="Location" className="form-control flex-grow-1" />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="top-filter-item">
                        <div className="icon"><i className="ri-time-line"></i></div>
                        <select className="form-select border-0 bg-transparent flex-grow-1 text-secondary">
                            <option>Experience level</option>
                            <option>Entry Level</option>
                            <option>Mid Level</option>
                            <option>Senior Level</option>
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