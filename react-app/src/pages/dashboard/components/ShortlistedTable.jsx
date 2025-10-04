// src/components/dashboard/ShortlistedTable.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const { api_base_url } = window.jpbd_object || {};

const ShortlistedTable = () => {
    const { user, token, loading: authLoading } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedJobTitle, setSelectedJobTitle] = useState('all');

    useEffect(() => {
        if (authLoading || !user || !token) {
            setLoading(false);
            setDashboardData(null);
            return;
        }

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${api_base_url}dashboard/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setDashboardData(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                setDashboardData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user, token, authLoading]);
    
    // User role check
    const isCandidateOrBusiness = user?.roles?.includes('candidate') || user?.roles?.includes('business');

    // Helper to get status CSS class
    const getStatusClass = (status) => {
        switch (status) {
            case 'hired': return 'active';
            case 'shortlisted': return 'processing';
            default: return 'pending';
        }
    };
    
    // =====================================================================
    // Candidate and Business View (এখন একত্রিত)
    // =====================================================================
    const renderCandidateOrBusinessView = () => {
        const applications = dashboardData?.candidate_applications || [];
        
        // ফিল্টার করার জন্য সকল ইউনিক জবের তালিকা
        const opportunityOptions = [...new Map(applications.map(item => [item['job_title'], item])).values()];
            
        // জব টাইটেল অনুযায়ী আবেদনকারীদের ফিল্টার করা
        const filteredApplications = applications.filter(app => selectedJobTitle === 'all' || app.job_title === selectedJobTitle);

        return (
            <div className="i-card-md">
                <div className="table-filter">
                     <div className="left"><h4 className="card-title">My Application Status</h4></div>
                     {opportunityOptions.length > 0 && (
                         <div className="right">
                              <div className="dropdown">
                                   <button className="i-btn btn--lg btn--outline" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {selectedJobTitle === 'all' ? 'All Opportunities' : selectedJobTitle} <i className="ri-arrow-down-s-line ms-1"></i>
                                   </button>
                                   <ul className="dropdown-menu dropdown-menu-end">
                                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedJobTitle('all'); }}>All Opportunities</a></li>
                                        {opportunityOptions.map((opt, index) => (
                                            <li key={index}><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedJobTitle(opt.job_title); }}>{opt.job_title}</a></li>
                                        ))}
                                   </ul>
                              </div>
                         </div>
                     )}
                </div>
                <div className="card-body pt-0">
                     <div className="table-wrapper">
                          <table>
                               <thead><tr><th>Opportunity Title</th><th>Company</th><th>Status</th></tr></thead>
                               <tbody>
                                    {loading ? (
                                        <tr><td colSpan="3" className="text-center p-4">Loading...</td></tr>
                                    ) : filteredApplications.length > 0 ? (
                                        filteredApplications.map((app, index) => (
                                            <tr key={index}>
                                                 <td><Link to={`/dashboard/opportunities/${app.opportunity_id}`}>{app.job_title}</Link></td>
                                                 <td>{app.company_name}</td>
                                                 <td>
                                                      <div className="status justify-content-end">
                                                           <span className={`status-dot ${getStatusClass(app.status)}`}></span>
                                                           <span>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                                                      </div>
                                                 </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="text-center p-4">No applications with status updates yet.</td></tr>
                                    )}
                               </tbody>
                          </table>
                     </div>
                </div>
           </div>
        );
    };

    // =====================================================================
    // Employer View (অপরিবর্তিত)
    // =====================================================================
    const renderEmployerView = () => {
        const getEmpStatusClass = (status) => (status === 'hired' ? 'active' : 'processing');
        const filteredApplicants = dashboardData?.shortlisted_applicants?.filter(app => selectedJobTitle === 'all' || app.job_title === selectedJobTitle) || [];
        const jobTitleForDropdown = dashboardData?.user_opportunities?.find(job => job.job_title === selectedJobTitle)?.job_title || 'All Jobs';
        return (
            <div className="i-card-md">
                 <div className="table-filter"><div className="left"><h4 className="card-title">Recent Shortlisted</h4></div><div className="right"><div className="dropdown"><button className="i-btn btn--lg btn--outline" type="button" data-bs-toggle="dropdown">{jobTitleForDropdown} <i className="ri-arrow-down-s-line ms-1"></i></button><ul className="dropdown-menu dropdown-menu-end"><li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedJobTitle('all'); }}>All Jobs</a></li>{dashboardData?.user_opportunities?.map(job => (<li key={job.id}><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedJobTitle(job.job_title); }}>{job.job_title}</a></li>))}</ul></div></div></div>
                <div className="card-body pt-0">
                     <div className="table-wrapper">
                          <table>
                               <thead><tr><th>Applicant</th><th>For Opportunity</th><th>Status</th><th>Options</th></tr></thead>
                               <tbody>
                                    {loading ? (<tr><td colSpan="4" className="text-center p-4">Loading...</td></tr>) : filteredApplicants.length > 0 ? (filteredApplicants.map(app => ( <tr key={app.application_id}> <td>{app.applicant_name}</td> <td className="text-muted">{app.job_title}</td> <td><div className="status"><span className={`status-dot ${getEmpStatusClass(app.status)}`}></span><span>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span></div></td> <td><div className="dropdown"><button className="options-btn" type="button" data-bs-toggle="dropdown"><i className="ri-more-2-fill"></i></button><ul className="dropdown-menu dropdown-menu-end"><li>
                                        <Link 
                                                                    className="dropdown-item" 
                                                                    to={`/dashboard/candidate/${app.candidate_user_id}`}
                                                                >
                                                                    View Profile
                                                                </Link>
                                        </li></ul></div></td> </tr> ))) : (<tr><td colSpan="4" className="text-center p-4">No shortlisted applicants found.</td></tr>)}
                               </tbody>
                          </table>
                     </div>
                </div>
            </div>
        );
    }
    
    if (authLoading) {
        return <div className="i-card-md p-4 text-center">Authenticating...</div>;
    }

    // `business` এবং `candidate` উভয়ের জন্য একই ভিউ দেখানো হচ্ছে
    if (isCandidateOrBusiness) return renderCandidateOrBusinessView();
    return renderEmployerView(); // ডিফল্ট হিসেবে এমপ্লয়ার ভিউ
};

export default ShortlistedTable;