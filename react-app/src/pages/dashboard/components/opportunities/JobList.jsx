// src/pages/dashboard/components/opportunities/JobList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';

// ======================================================
// Helper Component: JobCard
// প্রতিটি জব কার্ডের নিজস্ব state থাকবে
// ======================================================
const JobCard = ({ job, selectedOpportunityId, onSelectOpportunity, activeTab, onWithdrawSuccess,onUnsave  }) => {
    const { user, token } = useAuth();
    const { api_base_url } = window.jpbd_object || {};
    const isEmployer = user?.roles?.includes('employer') || user?.roles?.includes('administrator');
    
    // প্রতিটি কার্ডের নিজস্ব state
    const [isSaved, setIsSaved] = useState(job.is_saved || false);
    const [saving, setSaving] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);

    // job prop পরিবর্তন হলে isSaved স্টেট আপডেট করা
    useEffect(() => {
        setIsSaved(job.is_saved || false);
    }, [job.is_saved]);
    
    // আইটেম সেভ/আনসেভ করার হ্যান্ডলার
    const handleToggleSave = async (e) => {
        e.stopPropagation(); // Parent div-এর onClick ট্রিগার হওয়া থেকে বিরত রাখা
        setSaving(true);
        try {
            const response = await axios.post(`${api_base_url}saved-items/toggle`, {
                item_id: job.id,
                item_type: 'opportunity',
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            
            setIsSaved(response.data.status === 'saved');
            if (response.data.status === 'unsaved' && onUnsave) {
                onUnsave(job.id); // প্যারেন্টকে (SavedItemsPage) জানানো
            }
        } catch (error) {
            alert("Could not update save status. Please try again.");
        } finally {
            setSaving(false);
        }
    };
    
    // আবেদন বাতিল করার হ্যান্ডলার
    const handleWithdraw = async (e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to withdraw your application?")) {
            if (!job.application_id) {
                alert("Cannot withdraw: Application ID is missing.");
                return;
            }
            setWithdrawing(true);
            try {
                await axios.delete(`${api_base_url}applications/${job.application_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                onWithdrawSuccess(job.id);
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to withdraw application.');
            } finally {
                setWithdrawing(false);
            }
        }
    };

    return (
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
            <div className="d-flex justify-content-start align-items-center">
                {isEmployer ? (
                    <Link to={`/dashboard/opportunities/${job.id}`} className="i-btn btn--lg btn--primary w-100">
                        View Details
                    </Link>
                ) : (
                    activeTab === 'applied' ? (
                        <button 
                            onClick={handleWithdraw}
                            className="i-btn btn--lg btn--danger w-100"
                            disabled={withdrawing}
                        >
                            {withdrawing ? 'Withdrawing...' : <><i className="ri-close-circle-line me-1"></i> Withdraw</>}
                        </button>
                    ) : (
                        job.has_applied ? (
                            <button className="i-btn btn--lg btn--success w-100" disabled>
                                <i className="ri-check-line"></i> Applied
                            </button>
                        ) : (
                            <Link to={`/dashboard/opportunities/${job.id}`} className="i-btn btn--lg btn--primary w-100">
                                Apply Now
                            </Link>
                        )
                    )
                )}

                {/* কার্যকরী Save বাটন */}
                <button 
                    className="icon-btn-lg" 
                    type="button" 
                    onClick={handleToggleSave}
                    disabled={saving}
                >
                    <i className={isSaved ? "ri-save-fill text-primary" : "ri-save-line"}></i>
                </button>
            </div>
        </div>
    );
};


// ======================================================
// মূল JobList কম্পোনেন্ট
// ======================================================
const JobList = ({ opportunities, onSelectOpportunity, selectedOpportunityId, activeTab, onWithdrawSuccess,onUnsave  }) => {
    // activeTab অনুযায়ী opportunity লিস্ট ফিল্টার করা
    const opportunitiesToShow = activeTab === 'all'
        ? opportunities.filter(job => !job.has_applied) 
        : opportunities;

    return (
        <div id="job-listings" className="job-listings">
            <div className="row g-3">
                {opportunitiesToShow && opportunitiesToShow.length > 0 ? (
                    opportunitiesToShow.map(job => (
                        <div className="col-12" key={job.id}>
                            <JobCard 
                                job={job}
                                selectedOpportunityId={selectedOpportunityId}
                                onSelectOpportunity={onSelectOpportunity}
                                activeTab={activeTab}
                                onWithdrawSuccess={onWithdrawSuccess}
                                onUnsave={onUnsave}
                            />
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="i-card-md text-center p-4">
                            {activeTab === 'applied' 
                                ? "You haven't applied to any opportunities yet." 
                                : "No open opportunities found."
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobList;