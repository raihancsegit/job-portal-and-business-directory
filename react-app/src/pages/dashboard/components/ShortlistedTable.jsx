// src/components/dashboard/ShortlistedTable.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const ShortlistedTable = ({ data, loading }) => {
    const { user } = useAuth();
    const [selectedJobTitle, setSelectedJobTitle] = useState('all');

    const isCandidateOrBusiness = user?.roles?.includes('candidate') || user?.roles?.includes('business');

    // Helper to get status CSS class
    const getStatusClass = (status) => {
        switch (status) {
            case 'hired': return 'active';
            case 'shortlisted': return 'processing';
            default: return 'pending';
        }
    };
    
    // Candidate and Business View
    const renderCandidateOrBusinessView = () => {
        const applications = data?.candidate_applications || [];
        const opportunityOptions = [...new Map(applications.map(item => [item['job_title'], item])).values()];
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
                                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedJobTitle('all'); }}>All</a></li>
                                        {opportunityOptions.map((opt, index) => (
                                            <li key={index}><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedJobTitle(opt.job_title); }}>{opt.job_title}</a></li>
                                        ))}
                                   </ul>
                              </div>
                         </div>
                     )}
                </div>
                <div className="card-body pt-0">
                     <div className="table-wrapper shortlisted-table">
                          <table>
                               <thead><tr><th>Opportunity Title</th><th>Company</th><th>Status</th></tr></thead>
                               <tbody>
                                    {loading ? (
                                        <tr><td colSpan="3" className="p-4 text-center">Loading...</td></tr>
                                    ) : filteredApplications.length > 0 ? (
                                        filteredApplications.slice(0, 5).map((app, index) => ( // Showing first 5
                                            <tr key={index}>
                                                 <td><Link to={`/opportunities/${app.opportunity_id}`}>{app.job_title}</Link></td>
                                                 <td>{app.company_name}</td>
                                                 <td><div className="status"><span className={`status-dot ${getStatusClass(app.status)}`}></span><span>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span></div></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="p-4 text-center">No applications found.</td></tr>
                                    )}
                               </tbody>
                          </table>
                     </div>
                </div>
           </div>
        );
    };

    // Employer View
    const renderEmployerView = () => {
        const getEmpStatusClass = (status) => (status === 'hired' ? 'active' : 'processing');
        const shortlistedApplicants = data?.shortlisted_applicants || [];
        const filteredApplicants = shortlistedApplicants.filter(app => selectedJobTitle === 'all' || app.job_title === selectedJobTitle);

        return (
            <div className="i-card-md">
                <div className="table-filter">
                    <div className="left"><h4 className="card-title">Shortlisted</h4></div>
                    <div className="right">
                        <div className="dropdown">
                            <button className="i-btn btn--lg btn--outline" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                {selectedJobTitle === 'all' ? 'All Opportunities' : selectedJobTitle} <i className="ri-arrow-down-s-line ms-1"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedJobTitle('all'); }}>All Opportunities</a></li>
                                {data?.user_opportunities?.map(job => (
                                    <li key={job.id}><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedJobTitle(job.job_title); }}>{job.job_title}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="card-body pt-0">
                    <div className="table-wrapper shortlisted-table">
                        <table>
                            <thead><tr><th>Applicant</th><th>Status</th><th>Options</th></tr></thead>
                            <tbody>
                                {loading ? (<tr><td colSpan="3" className="p-4 text-center">Loading...</td></tr>) 
                                : filteredApplicants.length > 0 ? (filteredApplicants.map(app => (
                                    <tr key={app.application_id}>
                                        <td><div className="d-flex justify-content-start align-items-center gap-2"><span>{app.applicant_name}</span></div></td>
                                        <td><div className="status"><span className={`status-dot ${getEmpStatusClass(app.status)}`}></span><span>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span></div></td>
                                        <td>
                                            <div className="dropdown">
                                                <button className="options-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="ri-more-2-fill"></i></button>
                                                <ul className="dropdown-menu dropdown-menu-end">
                                                    <li><Link className="dropdown-item" to={`/dashboard/candidate/${app.candidate_user_id}`}>View Profile</Link></li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                ))) : (<tr><td colSpan="3" className="p-4 text-center">No shortlisted applicants found.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
    
    if (isCandidateOrBusiness) return renderCandidateOrBusinessView();
    return renderEmployerView();
};

export default ShortlistedTable;