import React from 'react';

const JobDetails = ({ opportunity }) => {
    if (!opportunity) {
        return (
            <div className="job-details-panel d-flex align-items-center justify-content-center h-100">
                <p className="text-muted">Select an opportunity from the left to see the details.</p>
            </div>
        );
    }

    return (
        <div className="job-details-panel">
            <div className="title-area">
                <div className="icon"><i className="ri-briefcase-line"></i></div>
                <div className="text">
                    <div className="d-flex justify-content-start align-items-center gap-2">
                        <h3>{opportunity.job_title}</h3> <span><i className="ri-edit-line"></i></span>
                    </div>
                    <p className="mb-0">{opportunity.location}</p>
                </div>
                <i className="fa-solid fa-bookmark ms-auto text-secondary fs-5 cursor-pointer"></i>
            </div>
            <div className="row g-3 text-center mb-4">
                <div className="col-md-4"><div className="tiny-card"><p className="text-secondary small mb-0">Job type</p><h5 className="fw-semibold small mb-0">{opportunity.job_type}</h5></div></div>
                <div className="col-md-4"><div className="tiny-card"><p className="text-secondary small mb-0">Workplace</p><h5 className="fw-semibold small mb-0">{opportunity.workplace}</h5></div></div>
                <div className="col-md-4"><div className="tiny-card"><p className="text-secondary small mb-0">Experience</p><h5 className="fw-semibold small mb-0">{opportunity.experience}</h5></div></div>
            </div>
            <div className="desc-salary mb-40">
                <p className="desc-subtitle">Salary</p>
                <div className="post-salary"><p>{opportunity.salary_currency} {opportunity.salary_amount} <span>/{opportunity.salary_type}</span></p></div>
            </div>
            <div className="mb-4">
                <p className="desc-subtitle mb-3">Description</p>
                <p className="desc-text">{opportunity.job_details}</p>
            </div>
            <div className="mb-30">
                <h4 className="desc-title">Responsibilities</h4>
                <div className="desc-list" dangerouslySetInnerHTML={{ __html: opportunity.responsibilities }}></div>
            </div>
            <div className="mb-0">
                <h4 className="desc-title">Qualifications</h4>
                <div className="desc-list" dangerouslySetInnerHTML={{ __html: opportunity.qualifications }}></div>
            </div>
        </div>
    );
};

export default JobDetails;