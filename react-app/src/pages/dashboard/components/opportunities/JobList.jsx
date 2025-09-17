import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
const JobList = ({ opportunities, onSelectOpportunity, selectedOpportunityId }) => {
     const { user } = useAuth();
    const isEmployer = user?.roles?.includes('employer') || user?.roles?.includes('administrator');
    return (
        <div id="job-listings" className="job-listings">
            <div className="row g-3">
                {opportunities && opportunities.length > 0 ? (
                    opportunities.map(job => (
                        <div className="col-12" key={job.id}>
                            <div 
                                className={`i-card-md job-post-card ${selectedOpportunityId === job.id ? 'active' : ''}`}
                                onClick={() => onSelectOpportunity(job)}
                                style={{ cursor: 'pointer' }}
                            >
                                <span className="post-time">Posted {new Date(job.created_at).toLocaleDateString()}</span>
                                <h4>{job.job_title}</h4>
                                <p>{job.location}</p>
                                <div className="job-meta">
                                    <p className="mb-0"><span>Job type</span><span>{job.job_type}</span></p>
                                    <div className="varticle-separate"></div>
                                    <p className="mb-0"><span>Workplace</span><span>{job.workplace}</span></p>
                                </div>
                                <div className="post-salary">
                                    <p>{job.salary_currency} {job.salary_amount} <span>/{job.salary_type}</span></p>
                                </div>
                                <div className="post-bottom mb-4">
                                    <span className="dot"></span><span>{job.salary_type} paid</span>
                                </div>
                                
                                {isEmployer ? (
                                    <Link to={`/dashboard/opportunities/${job.id}`} className="i-btn btn--lg btn--primary w-100">
                                        View Proposal
                                    </Link>
                                ) : (
                                    // job অবজেক্টে 'has_applied' নামে একটি প্রপার্টি থাকতে হবে
                                    // এই প্রপার্টিটি jpbd_api_get_opportunities ফাংশন থেকে পাঠাতে হবে
                                    job.has_applied ? (
                                        <button className="i-btn btn--lg btn--success w-100" disabled>
                                            <i className="ri-check-line"></i> Applied
                                        </button>
                                    ) : (
                                        <Link to={`/dashboard/opportunities/${job.id}`} className="i-btn btn--lg btn--primary w-100">
                                            Apply Now
                                        </Link>
                                    )
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="i-card-md text-center p-4">No opportunities posted yet.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobList;