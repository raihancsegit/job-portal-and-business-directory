// src/components/dashboard/OpportunityPostedTable.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Papa from 'papaparse';
import { useAuth } from '../../../context/AuthContext';

const { api_base_url } = window.jpbd_object || {};

const OpportunityPostedTable = ({ filters, setFilters }) => {
    const { user, token, loading: authLoading } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);

    const isCandidateOrBusiness = user?.roles?.includes('candidate') || user?.roles?.includes('business');

    useEffect(() => {
        if (authLoading || !user || !token) {
            setLoading(false);
            setData([]);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setSelectedIds([]); // নতুন ডেটা লোড করার আগে সিলেকশন রিসেট করা
            const endpoint = isCandidateOrBusiness 
                ? `${api_base_url}my-applications`
                : `${api_base_url}opportunities`;

            const params = isCandidateOrBusiness 
                ? {}
                : { viewMode: 'my_opportunities', dateRange: filters?.dateRange || 'all-time' };
            
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
    }, [user, token, authLoading, isCandidateOrBusiness, filters]);
    
    // --- এমপ্লয়ারের জন্য নির্দিষ্ট ফাংশন ---
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
        if (selectedIds.length === 0 || !window.confirm(`Delete ${selectedIds.length} items?`)) return;
        try {
            await axios.post(`${api_base_url}opportunities/bulk-delete`, { ids: selectedIds }, { headers: { 'Authorization': `Bearer ${token}` } });
            setData(prev => prev.filter(opp => !selectedIds.includes(opp.id)));
            setSelectedIds([]);
            alert('Selected opportunities deleted.');
        } catch (error) {
            alert(error.response?.data?.message || 'Could not delete opportunities.');
        }
    };

    const handleExportCSV = () => {
        if (data.length === 0) return alert("No data to export.");
        const csv = Papa.unparse(data);
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        link.setAttribute("download", "my-opportunities.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ================== মূল পরিবর্তন এখানে ==================
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // নিশ্চিত করা হচ্ছে যে শুধুমাত্র সংখ্যা (number) ID গুলোই সিলেক্ট করা হচ্ছে
            const allIds = data.map(job => Number(job.id));
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectSingle = (e, id) => {
        const numericId = Number(id); // ID টিকে সংখ্যায় রূপান্তর করা
        if (e.target.checked) {
            setSelectedIds(prev => [...prev, numericId]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== numericId));
        }
    };
    // =========================================================
    
    const handleDateRangeChange = (value) => setFilters(prev => ({ ...prev, dateRange: value }));
    const dateRangeOptions = {'all-time':'All-time', 'this-week':'This Week', 'this-month':'This Month', 'this-year':'This Year'};

    // Candidate and Business View
    const renderCandidateOrBusinessView = () => (
        <div className="i-card-md">
            <div className="table-filter"><div className="left"><h4 className="card-title">Applied Opportunity</h4></div></div>
            <div className="card-body pt-0">
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Opportunity Title</th><th>Employer Name</th><th>Location</th><th>Date Applied</th><th>Applicants</th><th>Status</th><th>Option</th></tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan="7">Loading...</td></tr> : (data.length > 0 ? data.map(app => (
                                <tr key={app.application_id}><td>{app.job_title}</td><td>{app.employer_name}</td><td>{app.location}</td><td>{new Date(app.application_date).toLocaleDateString()}</td><td>{app.total_applicants}</td><td><div className="status"><span className={`status-dot ${app.status === 'hired' ? 'active' : 'processing'}`}></span><span>{app.status}</span></div></td><td><div className="dropdown"><button className="options-btn" type="button" data-bs-toggle="dropdown"><i className="ri-more-2-fill"></i></button><ul className="dropdown-menu dropdown-menu-end"><li><Link className="dropdown-item" to={`/dashboard/opportunities/${app.opportunity_id}`}>View</Link></li></ul></div></td></tr>
                            )) : <tr><td colSpan="7" className="text-center p-4">You have not applied yet.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Employer View
    const renderEmployerView = () => {
        const opportunities = data || [];
        return (
            <div className="i-card-md">
                <div className="table-filter">
                    <div className="left"><h4 className="card-title">My Recent Opportunities</h4><div className="i-badge big-badge soft">{filters ? dateRangeOptions[filters.dateRange] : 'All-time'}</div><div className="dropdown d-inline-block"><button className="icon-btn-lg" type="button" data-bs-toggle="dropdown"><i className="ri-arrow-down-s-line"></i></button><ul className="dropdown-menu dropdown-menu-end"><li><a className="dropdown-item" href="#" onClick={(e)=>{e.preventDefault(); handleDateRangeChange('this-month');}}>This Month</a></li><li><a className="dropdown-item" href="#" onClick={(e)=>{e.preventDefault(); handleDateRangeChange('this-week');}}>This Week</a></li><li><a className="dropdown-item" href="#" onClick={(e)=>{e.preventDefault(); handleDateRangeChange('this-year');}}>This Year</a></li><li><a className="dropdown-item" href="#" onClick={(e)=>{e.preventDefault(); handleDateRangeChange('all-time');}}>All-time</a></li></ul></div></div>
                    <div className="right"><div className="dropdown d-inline-block"><button className="i-btn btn--lg btn--outline" type="button" data-bs-toggle="dropdown">Export as <i className="ri-arrow-down-s-line ms-1"></i></button><ul className="dropdown-menu dropdown-menu-end"><li><a className="dropdown-item" href="#" onClick={(e)=>{e.preventDefault();handleExportCSV();}}>Export as CSV</a></li></ul></div>{selectedIds.length > 0 && (<button className="icon-btn-lg text-danger" onClick={handleBulkDelete}><i className="ri-delete-bin-6-line"></i></button>)}</div>
                </div>
                <div className="card-body pt-0">
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th><div className="custom-checkbox radio-style"><input type="checkbox" id="selectAll" onChange={handleSelectAll} checked={opportunities.length > 0 && selectedIds.length === opportunities.length}/><label htmlFor="selectAll"></label></div></th><th>Opportunity Title</th><th>Date Posted</th><th>Applications</th><th>Status</th><th>Options</th></tr></thead>
                            <tbody>
                                {loading ? (<tr><td colSpan="6" className="text-center p-4">Loading...</td></tr>) : opportunities.length > 0 ? (opportunities.map((job)=>(<tr key={job.id}><td><div className="custom-checkbox radio-style"><input type="checkbox" id={`cb-${job.id}`} checked={selectedIds.includes(Number(job.id))} onChange={(e)=>handleSelectSingle(e, job.id)}/><label htmlFor={`cb-${job.id}`}></label></div></td><td>{job.job_title}</td><td>{new Date(job.publish_date || job.created_at).toLocaleDateString()}</td><td>{job.applications || 0}</td><td><div className="status"><span className={`status-dot ${job.vacancy_status === 'Open' ? 'active' : 'closed'}`}></span><span>{job.vacancy_status}</span></div></td><td><div className="dropdown"><button className="options-btn" type="button" data-bs-toggle="dropdown"><i className="ri-more-2-fill"></i></button><ul className="dropdown-menu dropdown-menu-end"><li><Link className="dropdown-item" to={`/dashboard/opportunities/${job.id}`}>View</Link></li><li><Link className="dropdown-item" to={`/dashboard/update-opportunity/${job.id}`}>Edit</Link></li><li><a className="dropdown-item text-danger" href="#" onClick={(e)=>{e.preventDefault();handleDelete(job.id);}}>Delete</a></li></ul></div></td></tr>))) : (<tr><td colSpan="6" className="text-center p-4">No opportunities posted yet.</td></tr>)}
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