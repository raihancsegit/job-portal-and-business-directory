// src/pages/dashboard/OpportunityDetailsPage.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ApplicantsList from './components/opportunities/ApplicantsList';

// ======================================================
// ApplyModal Component (ফাইলের ভেতরেই থাকছে)
// ======================================================
const ApplyModal = ({ opportunity, onClose, showNotice, onApplySuccess }) => {
    const { api_base_url } = window.jpbd_object || {};
    const token = localStorage.getItem('authToken');
    const [candidateCvs, setCandidateCvs] = useState([]);
    const [selectedCv, setSelectedCv] = useState('');
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        const fetchCvs = async () => {
            if (!token) { setLoading(false); return; }
            try {
                const response = await axios.get(`${api_base_url}candidate/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.data.cvs && response.data.cvs.length > 0) {
                    setCandidateCvs(response.data.cvs);
                    setSelectedCv(JSON.stringify(response.data.cvs[0]));
                }
            } catch (error) {
                console.error("Failed to fetch CVs", error);
                showNotice("Could not load your CVs.", "danger");
            } finally {
                setLoading(false);
            }
        };
        fetchCvs();
    }, [api_base_url, token, showNotice]);

    const handleApply = async () => {
        if (!selectedCv) {
            showNotice("Please select a CV.", "warning");
            return;
        }
        setApplying(true);
        try {
            const cvData = JSON.parse(selectedCv);
            await axios.post(`${api_base_url}applications`, {
                opportunity_id: opportunity.id,
                cv: cvData,
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            
            onApplySuccess();
            onClose();
        } catch (error) {
            showNotice(error.response?.data?.message || 'Failed to apply.', 'danger');
            if (error.response?.data?.code === 'already_applied') {
                onApplySuccess();
                onClose();
            }
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-5">
                    <div className="modal-body p-5 text-center">
                        <div className="modal-icon-outline mx-auto mb-4"><i className="ri-briefcase-line"></i></div>
                        <h4 className="mb-3">Apply for <span>{opportunity.job_title}</span>?</h4>
                        {loading ? <p>Loading CVs...</p> : candidateCvs.length > 0 ? (
                            <div>
                                <label className="form-label">Select a CV to submit</label>
                                <select className="form-select" value={selectedCv} onChange={e => setSelectedCv(e.target.value)}>
                                    {candidateCvs.map((cv, index) => (
                                        <option key={index} value={JSON.stringify(cv)}>{cv.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="alert alert-warning">
                                You have no CVs. Please <Link to="/dashboard/settings" className="alert-link">add a CV to your profile</Link> first.
                            </div>
                        )}
                    </div>
                    <div className="modal-footer px-5 border-0">
                        <button type="button" className="i-btn btn--lg btn--outline flex-grow-1" onClick={onClose} disabled={applying}>Close</button>
                        <button type="button" className="i-btn btn--lg btn--primary-dark flex-grow-1" onClick={handleApply} disabled={candidateCvs.length === 0 || applying || loading}>
                            {applying ? 'Applying...' : 'Confirm Application'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ======================================================
// Main OpportunityDetailsPage Component (চূড়ান্ত সংস্করণ)
// ======================================================
function OpportunityDetailsPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const { api_base_url } = window.jpbd_object || {};

    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [notice, setNotice] = useState({ message: '', type: '' });
    const [activeTab, setActiveTab] = useState('details');
    const chartRef = useRef(null);

    // চার্টের ডেট রেঞ্জের জন্য নতুন স্টেট
    const [chartDateRange, setChartDateRange] = useState('last-7-days');
    const dateRangeOptions = {
        'last-7-days': 'Last 7 Days',
        'last-30-days': 'Last 30 Days',
        'this-month': 'This Month',
    };

    // ডেটা আনার ফাংশন
    const fetchOpportunity = useCallback(async () => {
        if (!id || !api_base_url) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const config = {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                params: {
                    chart_range: chartDateRange // API-তে চার্টের রেঞ্জ পাঠানো হচ্ছে
                }
            };
            const response = await axios.get(`${api_base_url}opportunities/${id}`, config);
            setOpportunity(response.data);
        } catch (error) {
            console.error("Failed to fetch opportunity details", error);
            setOpportunity(null);
        } finally {
            setLoading(false);
        }
    }, [id, api_base_url, chartDateRange]); // chartDateRange এখন একটি dependency

    // ডেটা আনার জন্য useEffect
    useEffect(() => {
        fetchOpportunity();
    }, [fetchOpportunity]);

    // ApexCharts-এর জন্য useEffect
     useEffect(() => {
        // শর্ত: 'details' ট্যাব فعال থাকতে হবে, ApexCharts লাইব্রেরি লোড হতে হবে,
        // ref থাকতে হবে এবং API থেকে opportunity.chart ডেটা আসতে হবে।
        if (activeTab !== 'details' || typeof ApexCharts === 'undefined' || !chartRef.current || !opportunity?.chart) {
            return;
        }
        
        // ১. আপনার দেওয়া নির্দিষ্ট কালার কোড
        const customChartColor = '#E4B65F'; 
        
        const options = {
            // --- Chart General Settings ---
            chart: { 
                type: 'area', 
                height: 220, 
                toolbar: { 
                    show: false // টুলবার লুকানো থাকবে
                },
                // sparkline: { enabled: true } // <-- এই লাইনটি মুছে ফেলা হয়েছে বা false করা হয়েছে
            },
            
            // --- Series Data (API থেকে আসছে) ---
            series: [{ 
                name: 'Applications', 
                data: opportunity.chart.series 
            }],

            // --- Colors ---
            colors: [customChartColor],

            // --- Data Labels (লাইনের উপর সংখ্যা) ---
            dataLabels: {
                enabled: false // আপাতত ডেটা লেবেল বন্ধ রাখা হলো
            },

            // --- Stroke (লাইনের স্টাইল) ---
            stroke: {
                curve: 'smooth',
                width: 2
            },

            // --- Fill (লাইনের নিচের অংশ) ---
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.1,
                    stops: [0, 90, 100]
                }
            },
            
            // --- X-Axis (নিচের তারিখগুলো) ---
            xaxis: { 
                type: 'category', // তারিখের জন্য category ব্যবহার করা ভালো
                categories: opportunity.chart.labels, // API থেকে আসা ডাইনামিক লেবেল
                labels: {
                    style: {
                        colors: '#8A92A6', // লেবেলের কালার
                        fontSize: '12px'
                    },
                },
                axisBorder: { 
                    show: false // নিচের বর্ডার লাইন লুকানো
                },
                axisTicks: {
                    show: false // তারিখের নিচের ছোট দাগগুলো লুকানো
                },
            },

            // --- Y-Axis (বাম পাশের সংখ্যাগুলো) ---
            yaxis: {
                show: true, // Y-অ্যাক্সিস দেখানো হচ্ছে
                labels: {
                    style: {
                        colors: '#8A92A6',
                        fontSize: '12px'
                    },
                    formatter: (value) => { return Math.round(value) } // দশমিক সংখ্যা বাদ দেওয়া
                }
            },

            // --- Grid (পেছনের দাগগুলো) ---
            grid: {
                show: true,
                borderColor: '#e9ecef', // গ্রিডের কালার
                strokeDashArray: 4, // ড্যাশড লাইন
                xaxis: {
                    lines: {
                        show: false // ভার্টিকাল লাইন বন্ধ
                    }
                },   
                yaxis: {
                    lines: {
                        show: true // হরিজন্টাল লাইন চালু
                    }
                },  
            },
            
            // --- Tooltip (হোভার করলে যা দেখাবে) ---
            tooltip: {
                x: {
                    format: 'dd MMM, yyyy'
                },
                y: {
                    formatter: function (val) {
                        return val + " applications"
                    }
                },
                theme: 'light' // টুলটিপের থিম
            },
        };
        
        const chart = new ApexCharts(chartRef.current, options);
        chart.render();

        // চার্টটি destroy করা খুবই গুরুত্বপূর্ণ
        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    }, [opportunity, activeTab]);

    const showNoticeMessage = (message, type = 'success') => {
        setNotice({ message, type });
        setTimeout(() => setNotice({ message: '', type: '' }), 4000);
    };

    const handleApplicationSuccess = () => {
        showNoticeMessage('Application submitted successfully!', 'success');
        fetchOpportunity(); // সার্ভার থেকে লেটেস্ট ডেটা রি-ফেচ করা
    };

    if (loading) return <div className="p-4 text-center">Loading Details...</div>;
    if (!opportunity) return <div className="p-4 text-center">Sorry, the opportunity could not be found.</div>;

    const isOwner = user && opportunity && parseInt(user.id, 10) === parseInt(opportunity.user_id, 10);
    const canApply = user && Array.isArray(user.roles) && (user.roles.includes('candidate') || user.roles.includes('business'));

    return (
        <div className="i-card-md radius-30 card-bg-two">
            {notice.message && <div className={`alert alert-${notice.type} m-4`}>{notice.message}</div>}
            <div className="card-body">
                <div className="details-container">
                    <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-4 mt-3">
                        <div className="flex-grow-1 d-flex justify-content-start align-items-center gap-2">
                            <button onClick={() => navigate(-1)} className="icon-btn-lg" type="button"><i className="ri-arrow-left-s-line"></i></button>
                            <h3>{opportunity.job_title}</h3>
                        </div>
                        <div className="flex-grow-1 d-flex justify-content-lg-end justify-content-start align-items-center gap-2" role="group">
                            {isOwner && (
                                <button onClick={() => setActiveTab('applicants')} className={`i-btn btn--outline btn--lg ${activeTab === 'applicants' ? 'active' : ''}`}>Applicants</button>
                            )}
                            <button onClick={() => setActiveTab('details')} className={`i-btn btn--primary-dark btn--lg ${activeTab === 'details' ? 'active' : ''}`}>Job Details</button>
                        </div>
                    </div>

                    {activeTab === 'details' && (
                        <div className="job-details-content">
                            <div className="row g-3">
                                {isOwner && (
                                <>
                                    <div className="col-lg-5">
                                        <div className="i-card-md bordered-card">
                                            <h5 className="mb-3">Overview</h5>
                                            <div className="row g-3">
                                                <div className="col-6"><div className="card overview-card views"><div className="card-body text-start"><h6>Views</h6><h3>{opportunity.views ?? 0}</h3></div></div></div>
                                                <div className="col-6"><div className="card overview-card applications"><div className="card-body text-start"><h6>Total Applications</h6><h3>{opportunity.applications ?? 0}</h3></div></div></div>
                                                <div className="col-6"><div className="card overview-card shortlisted"><div className="card-body text-start"><h6>Shortlisted</h6><h3>{opportunity.shortlisted ?? 0}</h3></div></div></div>
                                                <div className="col-6"><div className="card overview-card review"><div className="card-body text-start"><h6>Awaiting Review</h6><h3>{opportunity.awaiting_review ?? 0}</h3></div></div></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-7">
                                        <div className="i-card-md bordered-card">
                                            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                                <h5 className="mb-0">Applications Over Time</h5>
                                                <div className="dropdown">
                                                    <button className="i-btn btn--sm btn--outline" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        {dateRangeOptions[chartDateRange]} <i className="ri-arrow-down-s-line ms-1"></i>
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end">
                                                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setChartDateRange('last-7-days'); }}>Last 7 Days</a></li>
                                                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setChartDateRange('last-30-days'); }}>Last 30 Days</a></li>
                                                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setChartDateRange('this-month'); }}>This Month</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div ref={chartRef} id="applicationsChart" style={{ minHeight: '220px' }}></div>
                                        </div>
                                    </div>
                                </>
                                )}
                                <div className="col-12">
                                    <div className="i-card-md bordered-card">
                                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                            <h5 className="mb-3">Opportunity Description</h5>
                                            {isOwner && (<Link to={`/dashboard/update-opportunity/${opportunity.id}`} className="i-btn btn--outline btn--lg"><i className="ri-edit-box-line me-2"></i> Edit Opportunity</Link>)}
                                            {canApply && !isOwner && (
                                                opportunity.has_applied ? (
                                                    <button className="i-btn btn--success btn--lg" disabled><i className="ri-check-line me-2"></i> Applied</button>
                                                ) : (
                                                    <button onClick={() => setShowModal(true)} className="i-btn btn--primary btn--lg"><i className="ri-send-plane-fill me-2"></i> Apply Now</button>
                                                )
                                            )}
                                        </div>
                                        <div className="details-list-wrapper">
                                            {/* Details items here... */}
                                             <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Job Title</h6></div><div className="col-md-9 text-gray-200">{opportunity.job_title}</div></div></div>
                                                <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Job Status</h6></div><div className="col-md-9 text-gray-200 d-flex align-items-center"><span className={`h-2 w-2 rounded-full me-2 ${opportunity.vacancy_status === 'Open' ? 'bg-success' : 'bg-danger'}`}></span>{opportunity.vacancy_status}</div></div></div>
                                                <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Job Type</h6></div><div className="col-md-9 text-gray-200">{opportunity.job_type}</div></div></div>
                                                <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Job Workplace</h6></div><div className="col-md-9 text-gray-200">{opportunity.workplace}</div></div></div>
                                                <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Location</h6></div><div className="col-md-9 text-gray-200">{opportunity.location}</div></div></div>
                                                <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Payment System</h6></div><div className="col-md-9 text-gray-200">{opportunity.salary_type}</div></div></div>
                                                <div className="details-item"><div className="row g-3"><div className="col-md-3 fw-semibold text-gray-400"><h6>Salary</h6></div><div className="col-md-9 text-gray-200">{opportunity.salary_currency} {opportunity.salary_amount}</div></div></div>
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
                    )}
                    
                    {activeTab === 'applicants' && isOwner && (
                        <ApplicantsList opportunityId={opportunity.id} />
                    )}
                </div>
            </div>
            {showModal && <ApplyModal opportunity={opportunity} onClose={() => setShowModal(false)} showNotice={showNoticeMessage} onApplySuccess={handleApplicationSuccess} />}
        </div>
    );
}

export default OpportunityDetailsPage;