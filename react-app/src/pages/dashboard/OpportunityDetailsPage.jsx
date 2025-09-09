import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
function OpportunityDetailsPage() {
     const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const { api_base_url } = window.jpbd_object || {};

    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchOpportunity = async () => {
            if (!id || !api_base_url) return;
            setLoading(true);
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

    useEffect(() => {
        if (typeof ApexCharts === 'undefined' || !chartRef.current || !opportunity) {
            return;
        }
        
        const options = {
            chart: { type: 'area', height: 220, toolbar: { show: false } },
            series: [{ name: 'Applications', data: [10, 15, 7, 20, 14, 25, 22] }],
            xaxis: { categories: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'] }
        };
        
        const chart = new ApexCharts(chartRef.current, options);
        chart.render();

        return () => {
            chart.destroy();
        };
    }, [opportunity]);

    if (loading) {
        return <div className="p-4">Loading Details...</div>;
    }

    if (!opportunity) {
        return <div className="p-4">Opportunity not found.</div>;
    }

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
                                    <div className="col-6"><div className="card overview-card views"><div className="card-body text-start"><h6>Views</h6><h3>{opportunity.views || '000'}</h3></div></div></div>
                                    <div className="col-6"><div className="card overview-card applications"><div className="card-body text-start"><h6>Total Applications</h6><h3>{opportunity.applications || '000'}</h3></div></div></div>
                                    <div className="col-6"><div className="card overview-card shortlisted"><div className="card-body text-start"><h6>Shortlisted</h6><h3>{opportunity.shortlisted || '000'}</h3></div></div></div>
                                    <div className="col-6"><div className="card overview-card review"><div className="card-body text-start"><h6>Awaiting Review</h6><h3>{opportunity.awaiting_review || '000'}</h3></div></div></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="i-card-md bordered-card">
                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                    <h5 className="mb-3">Applications Over Time</h5>
                                    <div className="dropdown">
                                        <button className="i-btn btn--lg btn--outline" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            Nov, 01 - 07 <i className="ri-arrow-down-s-line ms-1"></i>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><a className="dropdown-item" href="#">Nov, 01 - 07</a></li>
                                            <li><a className="dropdown-item" href="#">Nov, 02 - 07</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <div ref={chartRef} id="applicationsChart" style={{ height: '220px' }}></div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="i-card-md bordered-card">
                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                                    <h5 className="mb-3">Opportunity Description</h5>
                                    {user && parseInt(user.id, 10) === parseInt(opportunity.user_id, 10) && (
                                        <Link to={`/dashboard/update-opportunity/${opportunity.id}`} className="i-btn btn--outline btn--lg">
                                            <i className="ri-edit-box-line me-2"></i> Edit Opportunity
                                        </Link>
                                    )}
                                </div>
                                <div className="details-list-wrapper">
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
            </div>
        </div>
    );
}

export default OpportunityDetailsPage;