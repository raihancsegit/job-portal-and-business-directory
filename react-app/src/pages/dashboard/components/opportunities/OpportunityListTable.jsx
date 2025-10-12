// src/pages/dashboard/components/opportunities/OpportunityListTable.jsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

const OpportunityListTable = ({ opportunities, onDelete, setOpportunities }) => {
    const { user, token } = useAuth();
    const { api_base_url } = window.jpbd_object || {};
    const tableRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // আপনি চাইলে এই সংখ্যা পরিবর্তন করতে পারেন
    const [goToPage, setGoToPage] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);

    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * itemsPerPage;
        return opportunities.slice(firstPageIndex, firstPageIndex + itemsPerPage);
    }, [currentPage, itemsPerPage, opportunities]);

    // opportunities-এর তালিকা পরিবর্তন হলে currentPage এবং selection রিসেট করা
    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]);
    }, [opportunities]);

    const totalPages = Math.ceil(opportunities.length / itemsPerPage);

    const renderPaginationButtons = () => {
        const buttons = [];
        for (let i = 1; i <= totalPages; i++) {
            buttons.push(
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i); }}>{i}</a>
                </li>
            );
        }
        return buttons;
    };
    
    const handleGoToPage = () => {
        const pageNumber = parseInt(goToPage, 10);
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            setGoToPage("");
        } else {
            alert(`Please enter a page number between 1 and ${totalPages}`);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(currentTableData.map(job => Number(job.id)));
        else setSelectedIds([]);
    };

    const handleSelectSingle = (e, id) => {
        const numericId = Number(id);
        if (e.target.checked) setSelectedIds(prev => [...prev, numericId]);
        else setSelectedIds(prev => prev.filter(selectedId => selectedId !== numericId));
    };
    
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0 || !window.confirm(`Delete ${selectedIds.length} items?`)) return;
        try {
            await axios.post(`${api_base_url}opportunities/bulk-delete`, { ids: selectedIds }, { headers: { 'Authorization': `Bearer ${token}` } });
            setOpportunities(prev => prev.filter(opp => !selectedIds.includes(opp.id)));
            setSelectedIds([]);
            alert('Selected opportunities deleted.');
        } catch (error) {
            alert(error.response?.data?.message || 'Could not delete.');
        }
    };
    
    const handleExport = (format) => {
        if (opportunities.length === 0) { alert("No data to export."); return; }
        switch (format) {
            case 'csv':
                const csv = Papa.unparse(opportunities);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.setAttribute("download", "opportunities.csv");
                link.click();
                link.remove();
                break;
            case 'pdf': case 'png':
                const tableElement = tableRef.current;
                if (!tableElement) return;
                html2canvas(tableElement).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    if (format === 'png') { /* ... PNG export ... */ }
                    else { /* ... PDF export ... */ }
                });
                break;
            default: break;
        }
    };

     const canBulkDelete = useMemo(() => {
        // যদি কোনো ইউজার লগইন করা না থাকে, তাহলে বাটন দেখানো হবে না
        if (!user) {
            return false;
        }
        // যদি কোনো আইটেম সিলেক্ট করা না থাকে, তাহলে বাটন দেখানো হবে না
        if (selectedIds.length === 0) {
            return false;
        }

        // সিলেক্ট করা অপরচুনিটিগুলোর সম্পূর্ণ ডেটা খুঁজে বের করা
        const selectedOpportunities = opportunities.filter(job => selectedIds.includes(Number(job.id)));

        // বর্তমান ইউজারের ID (নিরাপত্তার জন্য সংখ্যায় রূপান্তর করা)
        const currentUserId = parseInt(user.id, 10);

        // চেক করা হচ্ছে যে সিলেক্ট করা "প্রতিটি" অপরচুনিটির মালিক বর্তমান ইউজার কিনা
        // Array.every() ফাংশনটি তখনই true রিটার্ন করে যখন অ্যারের সব উপাদান শর্ত পূরণ করে
        return selectedOpportunities.every(job => parseInt(job.user_id, 10) === currentUserId);

    }, [selectedIds, opportunities, user]);

    return (
        <div className="i-card-md bg--light">
            <div className="table-filter">
                <div className="left"><h4 className="card-title">Opportunities</h4></div>
                <div className="right">
                    <div className="dropdown">
                        <button className="i-btn btn--lg btn--outline" type="button" data-bs-toggle="dropdown">Export as <i className="ri-arrow-down-s-line ms-1"></i></button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); handleExport('csv');}}>Export as CSV</a></li>
                        </ul>
                    </div>
                    {canBulkDelete && (
                        <button className="icon-btn-lg text-danger" onClick={handleBulkDelete} title="Delete Selected">
                            <i className="ri-delete-bin-6-line"></i>
                        </button>
                    )}
                </div>
            </div>
            <div className="card-body pt-0">
                <div className="table-wrapper">
                    <table ref={tableRef}>
                        <thead>
                            <tr>
                                <th><div className="custom-checkbox radio-style"><input type="checkbox" id="selectAllList" onChange={handleSelectAll} checked={currentTableData.length > 0 && selectedIds.length === currentTableData.length}/><label htmlFor="selectAllList"></label></div></th>
                                <th>Opportunity Title</th><th>Date Posted</th><th>Views</th><th>Applications</th><th>Status</th><th>Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTableData.length > 0 ? (
                                currentTableData.map(job => (
                                    <tr key={job.id}>
                                        <td><div className="custom-checkbox radio-style"><input type="checkbox" id={`cbList-${job.id}`} checked={selectedIds.includes(Number(job.id))} onChange={(e) => handleSelectSingle(e, job.id)} /><label htmlFor={`cbList-${job.id}`}></label></div></td>
                                        <td>{job.job_title}</td>
                                        <td>{new Date(job.publish_date || job.created_at).toLocaleDateString()}</td>
                                        <td>{job.views_count || 0}</td>
                                        <td>{job.applications || 0}</td>
                                        <td><div className="status"><span className={`status-dot ${job.vacancy_status === 'Open' ? 'active' : 'closed'}`}></span><span>{job.vacancy_status}</span></div></td>
                                        <td>
                                            <div className="dropdown">
                                                <button className="options-btn" type="button" data-bs-toggle="dropdown"><i className="ri-more-2-fill"></i></button>
                                                <ul className="dropdown-menu dropdown-menu-end">
                                                    <li><Link className="dropdown-item" to={`/dashboard/opportunities/${job.id}`}>View</Link></li>
                                                    {user && parseInt(user.id, 10) === parseInt(job.user_id, 10) && (
                                                        <>
                                                        <li><Link className="dropdown-item" to={`/dashboard/update-opportunity/${job.id}`}>Edit</Link></li>
                                                        <li><a className="dropdown-item text-danger" href="#" onClick={(e) => {e.preventDefault(); onDelete(job.id);}}>Delete</a></li>
                                                        </>
                                                    )}
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="text-center p-4">No opportunities found for the selected criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="d-flex align-items-center justify-content-lg-between justify-content-center flex-lg-nowrap flex-wrap gap-3 pagination-wrapper">
                        <div className="pagination-info text-secondary small">Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, opportunities.length)}</strong> of <strong>{opportunities.length}</strong> entries</div>
                        <nav aria-label="Page navigation"><ul className="pagination mb-0"><li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(1); }}><i className="ri-arrow-left-double-line"></i></a></li><li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}><i className="ri-arrow-left-s-line"></i></a></li>{renderPaginationButtons()}<li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}><a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}><i className="ri-arrow-right-s-line"></i></a></li><li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}><a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(totalPages); }}><i className="ri-arrow-right-double-line"></i></a></li></ul></nav>
                        <div className="d-flex align-items-center gap-2 ms-3"><span className="text-secondary small">Go to</span><input type="number" className="form-control form-control-sm pagination-input" min="1" max={totalPages} value={goToPage} onChange={(e) => setGoToPage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleGoToPage(); }} /><button className="btn btn-sm pagination-go" onClick={handleGoToPage}>Go</button></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OpportunityListTable;