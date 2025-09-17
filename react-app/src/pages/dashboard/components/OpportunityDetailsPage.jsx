import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
// মডাল কম্পোনেন্ট
const ApplyModal = ({ opportunity, onClose, showNotice }) => {
    const { api_base_url } = window.jpbd_object || {};
    const token = localStorage.getItem('authToken');
    const [candidateCvs, setCandidateCvs] = useState([]);
    const [selectedCv, setSelectedCv] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCvs = async () => {
            try {
                const response = await axios.get(`${api_base_url}candidate/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.data.cvs && response.data.cvs.length > 0) {
                    setCandidateCvs(response.data.cvs);
                    setSelectedCv(JSON.stringify(response.data.cvs[0])); // ডিফল্ট হিসেবে প্রথম CV সিলেক্ট করা
                }
            } catch (error) {
                console.error("Failed to fetch CVs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCvs();
    }, [api_base_url, token]);

    const handleApply = async () => {
        if (!selectedCv) {
            alert("Please select a CV.");
            return;
        }
        try {
            const cvData = JSON.parse(selectedCv);
            await axios.post(`${api_base_url}applications`, {
                opportunity_id: opportunity.id,
                cv: cvData,
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            
            showNotice('Application submitted successfully!', 'success');
            onClose(); // মডাল বন্ধ করা
        } catch (error) {
            showNotice(error.response?.data?.message || 'Failed to apply.', 'danger');
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-5">
                    <div className="modal-body p-5 text-center">
                        <div className="modal-icon-outline mx-auto mb-4"><i className="ri-briefcase-line"></i></div>
                        <h4 className="mb-3">Apply for <span>{opportunity.job_title}</span>?</h4>
                        {loading ? <p>Loading your CVs...</p> : candidateCvs.length > 0 ? (
                            <div>
                                <select className="form-select" value={selectedCv} onChange={e => setSelectedCv(e.target.value)}>
                                    {candidateCvs.map((cv, index) => (
                                        <option key={index} value={JSON.stringify(cv)}>{cv.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <p className="text-danger">You have no saved CVs. Please add a CV in your settings first.</p>
                        )}
                    </div>
                    <div className="modal-footer px-5 border-0">
                        <button type="button" className="i-btn btn--lg btn--outline flex-grow-1" onClick={onClose}>Close</button>
                        <button type="button" className="i-btn btn--lg btn--primary-dark flex-grow-1" onClick={handleApply} disabled={candidateCvs.length === 0}>Apply</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

function OpportunityDetailsPage() {
    const { id } = useParams(); // URL থেকে ID গ্রহণ করা
    const navigate = useNavigate();
    const { api_base_url } = window.jpbd_object;
     const { user } = useAuth();

    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false); // মডালের জন্য নতুন state
    const [notice, setNotice] = useState({ message: '', type: '' });

    useEffect(() => {
        const fetchOpportunity = async () => {
            try {
                const response = await axios.get(`${api_base_url}opportunities/${id}`);
                setOpportunity(response.data);
            } catch (error) {
                console.error("Failed to fetch opportunity details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOpportunity();
    }, [id, api_base_url]);

   
    // Applications Over Time Chart - Placeholder
    useEffect(() => {
        if (typeof ApexCharts !== 'undefined') {
            const options = {
                chart: { type: 'area', height: 220, toolbar: { show: false } },
                series: [{ name: 'Applications', data: [10, 15, 7, 20, 14, 25, 22] }],
                xaxis: { categories: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'] }
            };
            const chart = new ApexCharts(document.querySelector("#applicationsChart"), options);
            chart.render();
            return () => chart.destroy();
        }
    }, []);


    if (loading) return <div className="p-4">Loading Details...</div>;
    if (!opportunity) return <div className="p-4">Opportunity not found.</div>;

    const isOwner = user && opportunity && parseInt(user.id, 10) === parseInt(opportunity.user_id, 10);
    const isCandidate = user && Array.isArray(user.roles) && user.roles.includes('candidate');

    
   
    return (
        <div className="i-card-md radius-30 card-bg-two">
            <div className="card-body">
                <div className="details-container">
                    <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-4 mt-3">
                        <div className="flex-grow-1 d-flex justify-content-start align-items-center gap-2">
                            <button onClick={() => navigate(-1)} className="icon-btn-lg" type="button">
                                <i className="ri-arrow-left-s-line"></i>
                            </button>
                            <h3>{opportunity.job_title}</h3>
                        </div>
                        <div className="flex-grow-1 d-flex justify-content-lg-end justify-content-start align-items-center gap-2" role="group">
                            <a href="#" className="i-btn btn--outline btn--lg active">Applicants</a>
                            <a href="#" className="i-btn btn--primary-dark btn--lg">Job Details</a>
                        </div>
                    </div>
                    <div className="row g-3">
                        <div className="col-lg-5">
                            <div className="i-card-md bordered-card">
                                <h5 className="mb-3">Overview</h5>
                                <div className="row g-3">
                                    <div className="col-6"><div className="card overview-card views"><div className="card-body text-start"><h6>Views</h6><h3>{opportunity.views_count || 0}</h3></div></div></div>
                                    <div className="col-6"><div className="card overview-card applications"><div className="card-body text-start"><h6>Total Applications</h6><h3>{opportunity.applications || 0}</h3></div></div></div>
                                    <div className="col-6"><div className="card overview-card shortlisted"><div className="card-body text-start"><h6>Shortlisted</h6><h3>{opportunity.shortlisted || 0}</h3></div></div></div>
                                    <div className="col-6"><div className="card overview-card review"><div className="card-body text-start"><h6>Awaiting Review</h6><h3>{opportunity.awaiting_review || 0}</h3></div></div></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="i-card-md bordered-card">
                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                    <h5 className="mb-3">Applications Over Time</h5>
                                </div>
                                <div id="applicationsChart" style={{ height: '220px' }}></div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="i-card-md bordered-card">
                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                    <h5 className="mb-3">Opportunityss Description</h5>
                                        {isOwner && (
                                            <Link to={`/dashboard/update-opportunity/${opportunity.id}`} className="i-btn btn--outline btn--lg"><i className="ri-edit-box-line me-2"></i> Edit Opportunity</Link>
                                        )}
                                        
                                        {isCandidate && !isOwner && (
                                            <button onClick={() => setShowModal(true)} className="i-btn btn--primary btn--lg"><i className="ri-send-plane-fill me-2"></i> Apply Now</button>
                                        )}
                                    
                                </div>
                                <div className="details-list-wrapper">
                                    <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Job Title</h6></div><div className="col-md-9 text-gray-200">{opportunity.job_title}</div></div></div>
                                    <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Job Status</h6></div><div className="col-md-9 text-gray-200">{opportunity.vacancy_status}</div></div></div>
                                    <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Job Type</h6></div><div className="col-md-9 text-gray-200">{opportunity.job_type}</div></div></div>
                                    <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Job Workplace</h6></div><div className="col-md-9 text-gray-200">{opportunity.workplace}</div></div></div>
                                    <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Location</h6></div><div className="col-md-9 text-gray-200">{opportunity.location}</div></div></div>
                                    <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Salary</h6></div><div className="col-md-9 text-gray-200">{opportunity.salary_currency} {opportunity.salary_amount} / {opportunity.salary_type}</div></div></div>
                                    <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Industry</h6></div><div className="col-md-9 text-gray-200">{opportunity.industry}</div></div></div>
                                    <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Job Description</h6></div><div className="col-md-9 text-gray-200" dangerouslySetInnerHTML={{ __html: opportunity.job_details }}></div></div></div>
                                    <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Responsibilities</h6></div><div className="col-md-9 text-gray-200"><ul className="desc-list style-small" dangerouslySetInnerHTML={{ __html: opportunity.responsibilities }}></ul></div></div></div>
                                    <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Qualifications</h6></div><div className="col-md-9 text-gray-200"><ul className="desc-list style-small" dangerouslySetInnerHTML={{ __html: opportunity.qualifications }}></ul></div></div></div>
                                    <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Key Skills</h6></div><div className="col-md-9 text-gray-200">{opportunity.skills}</div></div></div>
                                    <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Experience</h6></div><div className="col-md-9 text-gray-200">{opportunity.experience}</div></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
              {showModal && <ApplyModal opportunity={opportunity} onClose={() => setShowModal(false)} showNotice={showNoticeMessage} />}
        </div>
    );
}

export default OpportunityDetailsPage;