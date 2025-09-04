import React from 'react';

const StatsCards = () => {
    return (
        <div className="row g-2">
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header">
                        <h4 className="card-title">Total Business Listing</h4>
                    </div>
                    <div className="card-body pt-0">
                        <h3 className="fs-72">180</h3>
                    </div>
                </div>
            </div>
            <div className="col-lg-6 col-md-6">
                <div className="i-card-md min-h-176">
                    <div className="card-header">
                        <h4 className="card-title">Candidate Hired</h4>
                        <button className="icon-btn-lg"><i className="ri-arrow-right-up-line"></i></button>
                    </div>
                    <div className="card-body pt-0">
                        <h3 className="fs-72">27</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsCards;