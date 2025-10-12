// src/components/dashboard/OpportunityPostedTable.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Papa from 'papaparse';
import { useAuth } from '../../../context/AuthContext';

const { api_base_url } = window.jpbd_object || {};

const OpportunityPostedTable = () => {
    const { user, token, loading: authLoading } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);

    const isCandidateOrBusiness = user?.roles?.includes('candidate') || user?.roles?.includes('business');
    
    const [candidateFilters, setCandidateFilters] = useState({
        dateRange: 'all-time',
        status: 'all'
    });
    
    const [employerFilters, setEmployerFilters] = useState({
        dateRange: 'all-time'
    });

    useEffect(() => {
        if (authLoading || !user || !token) {
            setLoading(false);
            setData([]);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setSelectedIds([]); 

            let endpoint = '';
            let params = {};

            if (isCandidateOrBusiness) {
                endpoint = `${api_base_url}my-applications`;
                params = {}; // Candidate view এর জন্য ক্লায়েন্ট-সাইড ফিল্টারিং হবে
            } else {
                endpoint = `${api_base_url}opportunities`;
                params = { 
                    viewMode: 'my_opportunities', 
                    dateRange: employerFilters.dateRange 
                };
            }
            
            try {
                const response = await axios.get(endpoint, {
                    params,
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, token, authLoading, isCandidateOrBusiness, employerFilters]);

    // --- Employer Functions ---
    const handleDelete = async (opportunityId) => {
        if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
        try {
            await axios.delete(`${api_base_url}opportunities/${opportunityId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            setData(prev => prev.filter(opp => opp.id !== opportunityId));
            alert('Opportunity deleted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Could not delete opportunity.');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0 || !window.confirm(`Are you sure you want to delete ${selectedIds.length} selected items?`)) return;
        try {
            await axios.post(`${api_base_url}opportunities/bulk-delete`, { ids: selectedIds }, { headers: { 'Authorization': `Bearer ${token}` } });
            setData(prev => prev.filter(opp => !selectedIds.includes(opp.id)));
            setSelectedIds([]);
            alert('Selected opportunities have been deleted.');
        } catch (error) {
            alert(error.response?.data?.message || 'Could not delete the selected opportunities.');
        }
    };

    const handleExportCSV = () => {
        if (data.length === 0) {
            alert("There is no data to export.");
            return;
        }
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "my-opportunities.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = data.map(job => Number(job.id));
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectSingle = (e, id) => {
        const numericId = Number(id);
        if (e.target.checked) {
            setSelectedIds(prev => [...prev, numericId]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== numericId));
        }
    };
    
    // --- Filter Handlers ---
    const handleEmployerDateChange = (value) => setEmployerFilters({ dateRange: value });
    const handleCandidateFilterChange = (filterType, value) => {
        setCandidateFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const dateRangeOptions = {'all-time':'All-time', 'this-week':'This Week', 'this-month':'This Month', 'this-year':'This Year'};
    const statusOptions = {'all': 'Status', 'new': 'Active', 'hired': 'Hired', 'shortlisted': 'Shortlisted'};

    // --- Candidate and Business View ---
    const renderCandidateOrBusinessView = () => {
        const filteredData = data.filter(app => {
            // Status Filtering
            const statusMatch = candidateFilters.status === 'all' || (app.status && app.status.toLowerCase() === candidateFilters.status);

            // Date Filtering
            if (candidateFilters.dateRange === 'all-time') {
                return statusMatch;
            }

            const today = new Date();
            const appDate = new Date(app.application_date);
            let startDate;

            switch (candidateFilters.dateRange) {
                case 'this-week':
                    const firstDayOfWeek = today.getDate() - today.getDay();
                    startDate = new Date(today.setDate(firstDayOfWeek));
                    break;
                case 'this-month':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    break;
                case 'this-year':
                    startDate = new Date(today.getFullYear(), 0, 1);
                    break;
                default:
                    return statusMatch; 
            }
            startDate.setHours(0, 0, 0, 0); 
            
            const dateMatch = appDate >= startDate;

            return statusMatch && dateMatch;
        });

        return (
            <div className="i-card-md">
                <div className="table-filter">
                    <div className="left flex-wrap gap-2">
                        <h4 className="card-title">Applied Opportunity</h4>
                        {/* ================== নতুন ড্রপডাউন এখানে যোগ করা হয়েছে ================== */}
                        <div className="d-flex align-items-center">
                            <div className="i-badge big-badge soft">{dateRangeOptions[candidateFilters.dateRange]}</div>
                            <div className="dropdown">
                                <button className="icon-btn-lg" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="ri-arrow-down-s-line"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    {Object.entries(dateRangeOptions).map(([key, value]) => (
                                        <li key={key}>
                                            <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleCandidateFilterChange('dateRange', key); }}>
                                                {value}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {/* =================================================================== */}
                    </div>
                    <div className="right">
                        <div className="d-flex align-items-center justify-content-end">
                            <div className="i-badge big-badge soft">{statusOptions[candidateFilters.status]}</div>
                            <div className="dropdown">
                                <button className="icon-btn-lg" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="ri-arrow-down-s-line"></i></button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    {Object.entries(statusOptions).map(([key, value]) => (
                                        <li key={key}><a className="dropdown-item" href="#" onClick={(e)=>{e.preventDefault(); handleCandidateFilterChange('status', key);}}>{value}</a></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-body pt-0">
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Opportunity Title</th><th>Employer Name</th><th>Location</th><th>Date Applied</th><th>Applicants</th><th>Status</th><th>Option</th></tr></thead>
                            <tbody>
                                {loading ? <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr> : (filteredData.length > 0 ? filteredData.map(app => (
                                    <tr key={app.application_id}>
                                        <td>{app.job_title}</td>
                                        <td>{app.employer_name}</td>
                                        <td>{app.location}</td>
                                        <td>{new Date(app.application_date).toLocaleDateString()}</td>
                                        <td>{app.total_applicants}</td>
                                        <td><div className="status"><span className={`status-dot ${app.status === 'hired' ? 'active' : 'processing'}`}></span><span>{app.status}</span></div></td>
                                        <td><div className="dropdown"><button className="options-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="ri-more-2-fill"></i></button><ul className="dropdown-menu dropdown-menu-end"><li><Link className="dropdown-item" to={`/opportunities/${app.opportunity_id}`}>View</Link></li></ul></div></td>
                                    </tr>
                                )) : <tr><td colSpan="7" className="text-center p-4">You have not applied for any opportunity yet.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // --- Employer View ---
    const renderEmployerView = () => {
        const opportunities = data || [];
        return (
            <div className="i-card-md">
                <div className="table-filter">
                    <div className="left flex-wrap gap-2">
                        <h4 className="card-title">Opportunity Posted</h4>
                        <div className="d-flex align-items-center">
                            <div className="i-badge big-badge soft">{dateRangeOptions[employerFilters.dateRange]}</div>
                             <div className="dropdown">
                                <button className="icon-btn-xl" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="ri-arrow-down-s-line"></i></button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                     {Object.entries(dateRangeOptions).map(([key, value]) => (
                                        <li key={key}><a className="dropdown-item" href="#" onClick={(e)=>{e.preventDefault(); handleEmployerDateChange(key);}}>{value}</a></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="right">
                        <div className="dropdown">
                            <button className="i-btn btn--xl btn--outline" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Export as CSV <i className="ri-arrow-down-s-line ms-1"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li><a className="dropdown-item" href="#" onClick={(e)=>{e.preventDefault(); handleExportCSV();}}>Export as CSV</a></li>
                                <li><a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); alert('PDF export functionality is not available yet.');}}>Export as PDF</a></li>
                                <li><a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); alert('PNG export functionality is not available yet.');}}>Export as PNG</a></li>
                            </ul>
                        </div>
                        {selectedIds.length > 0 && (
                            <button className="icon-btn-xl" onClick={handleBulkDelete} title={`Delete ${selectedIds.length} items`}>
                                <i className="ri-delete-bin-6-line"></i>
                            </button>
                        )}
                    </div>
                </div>
                <div className="card-body pt-0">
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th><input type="checkbox" onChange={handleSelectAll} checked={opportunities.length > 0 && selectedIds.length === opportunities.length} /></th>
                                    <th>Opportunity Title</th>
                                    <th>Date Posted</th>
                                    <th>Views</th>
                                    <th>Applications</th>
                                    <th>Status</th>
                                    <th>Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (<tr><td colSpan="7" className="text-center p-4">Loading...</td></tr>) : opportunities.length > 0 ? (opportunities.map((job)=>(
                                <tr key={job.id}>
                                    <td><input type="checkbox" checked={selectedIds.includes(Number(job.id))} onChange={(e)=>handleSelectSingle(e, job.id)}/></td>
                                    <td>{job.job_title}</td>
                                    <td>{new Date(job.publish_date || job.created_at).toLocaleDateString()}</td>
                                    <td>{job.views || 0}</td>
                                    <td>{job.applications || 0}</td>
                                    <td><div className="status"><span className={`status-dot ${job.vacancy_status === 'Open' ? 'active' : 'closed'}`}></span><span>{job.vacancy_status}</span></div></td>
                                    <td><div className="dropdown"><button className="options-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="ri-more-2-fill"></i></button><ul className="dropdown-menu dropdown-menu-end"><li><Link className="dropdown-item" to={`/opportunities/${job.id}`}>View</Link></li><li><Link className="dropdown-item" to={`/dashboard/update-opportunity/${job.id}`}>Edit</Link></li><li><a className="dropdown-item text-danger" href="#" onClick={(e)=>{e.preventDefault();handleDelete(job.id);}}>Delete</a></li></ul></div></td>
                                </tr>))) : (<tr><td colSpan="7" className="text-center p-4">No opportunities posted yet.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    if (authLoading) return <div className="p-4 text-center">Loading User...</div>;
    
    return isCandidateOrBusiness ? renderCandidateOrBusinessView() : renderEmployerView();
};

export default OpportunityPostedTable;