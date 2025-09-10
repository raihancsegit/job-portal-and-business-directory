import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import Papa from 'papaparse'; // For CSV Export

const OpportunityPostedTable = ({ filters, setFilters }) => {
    const { user } = useAuth();
    const { api_base_url } = window.jpbd_object || {};
    const token = localStorage.getItem('authToken');

    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        const fetchMyOpportunities = async () => {
            if (!api_base_url || !token || !filters) { // Added a check for filters
                setLoading(false);
                return;
            }
            setLoading(true);

            const params = { 
                viewMode: 'my_opportunities',
                dateRange: filters.dateRange 
            };

            try {
                const response = await axios.get(`${api_base_url}opportunities`, {
                    params: params,
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setOpportunities(response.data.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch user's opportunities", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyOpportunities();
    }, [api_base_url, token, filters]); // useEffect now depends on the entire filters object

    const handleDelete = async (opportunityId) => {
        if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
        try {
            await axios.delete(`${api_base_url}opportunities/${opportunityId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
            alert('Opportunity deleted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Could not delete opportunity.');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0 || !window.confirm(`Delete ${selectedIds.length} items?`)) return;
        try {
            await axios.post(`${api_base_url}opportunities/bulk-delete`, { ids: selectedIds }, { headers: { 'Authorization': `Bearer ${token}` } });
            setOpportunities(prev => prev.filter(opp => !selectedIds.includes(opp.id)));
            setSelectedIds([]);
            alert('Selected opportunities deleted.');
        } catch (error) {
            alert(error.response?.data?.message || 'Could not delete opportunities.');
        }
    };

    const handleExportCSV = () => {
        if (opportunities.length === 0) return alert("No data to export.");
        const csv = Papa.unparse(opportunities);
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        link.setAttribute("download", "my-opportunities.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(opportunities.map(job => job.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectSingle = (e, id) => {
        if (e.target.checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

     const dateRangeOptions = {
        'all-time': 'All-time',
        'this-week': 'This Week',
        'this-month': 'This Month',
        'this-year': 'This Year',
    };

    const handleDateRangeChange = (value) => {
        setFilters(prev => ({ ...prev, dateRange: value }));
        console.log("change");
    };


    return (
        <div className="i-card-md">
            {/* ====================================================== */}
            {/* THIS IS THE CORRECTED TABLE FILTER HEADER */}
            {/* ====================================================== */}
            <div className="table-filter">
                <div className="left">
                    <h4 className="card-title">My Recent Opportunities</h4>
                    {/* This will now work correctly because 'filters' is a valid object */}
                    <div className="i-badge big-badge soft">{filters ? dateRangeOptions[filters.dateRange] : 'All-time'}</div>
                    <div className="dropdown d-inline-block">
                        <button className="icon-btn-lg" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="ri-arrow-down-s-line"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleDateRangeChange('this-month'); }}>This Month</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleDateRangeChange('this-week'); }}>This Week</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleDateRangeChange('this-year'); }}>This Year</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleDateRangeChange('all-time'); }}>All-time</a></li>
                        </ul>
                    </div>
                </div>
                <div className="right">
                    <div className="dropdown d-inline-block">
                        <button className="i-btn btn--lg btn--outline" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Export as <i className="ri-arrow-down-s-line ms-1"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleExportCSV(); }}>Export as CSV</a></li>
                            {/* PDF/PNG can be added here later */}
                        </ul>
                    </div>
                    {selectedIds.length > 0 && (
                        <button className="icon-btn-lg text-danger" onClick={handleBulkDelete}>
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
                                <th>Applications</th>
                                <th>Status</th>
                                <th>Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center p-4">Loading...</td></tr>
                            ) : opportunities.length > 0 ? (
                                opportunities.map((job) => (
                                    <tr key={job.id}>
                                        <td><input type="checkbox" checked={selectedIds.includes(job.id)} onChange={(e) => handleSelectSingle(e, job.id)} /></td>
                                        <td>{job.job_title}</td>
                                        <td>{new Date(job.publish_date || job.created_at).toLocaleDateString()}</td>
                                        <td>{job.applications || 0}</td>
                                        <td><div className="status"><span className={`status-dot ${job.vacancy_status === 'Open' ? 'active' : 'closed'}`}></span><span>{job.vacancy_status}</span></div></td>
                                        <td>
                                            <div className="dropdown">
                                                <button className="options-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="ri-more-2-fill"></i></button>
                                                <ul className="dropdown-menu dropdown-menu-end">
                                                    <li><Link className="dropdown-item" to={`/dashboard/opportunities/${job.id}`}>View</Link></li>
                                                    <li><Link className="dropdown-item" to={`/dashboard/update-opportunity/${job.id}`}>Edit</Link></li>
                                                    <li><a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); handleDelete(job.id); }}>Delete</a></li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center p-4">You have not posted any opportunities yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OpportunityPostedTable;