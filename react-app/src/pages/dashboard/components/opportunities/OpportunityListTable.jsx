import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext'; // AuthContext ইম্পোর্ট করুন

const OpportunityListTable = ({ opportunities }) => {
    const { user } = useAuth(); // বর্তমানে লগইন করা ব্যবহারকারীর তথ্য নিন

    // পেজিনেশনের জন্য state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3); // প্রতি পেজে ৫টি আইটেম
     const [goToPage, setGoToPage] = useState("");

    // বর্তমান পেজের জন্য ডেটা গণনা করা
    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * itemsPerPage;
        const lastPageIndex = firstPageIndex + itemsPerPage;
        return opportunities.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, itemsPerPage, opportunities]);

    const totalPages = Math.ceil(opportunities.length / itemsPerPage);

    // পেজিনেশন বাটন তৈরি করার ফাংশন
    const renderPaginationButtons = () => {
        const buttons = [];
        // জটিল পেজিনেশন লজিক (..., 1, 2, 3, ..., 10) পরে যোগ করা যেতে পারে
        for (let i = 1; i <= totalPages; i++) {
            buttons.push(
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i); }}>
                        {i}
                    </a>
                </li>
            );
        }
        return buttons;
    };

    const handleGoToPage = () => {
        const pageNumber = parseInt(goToPage, 10);
        // ইনপুটটি যদি একটি বৈধ সংখ্যা এবং পেজের সীমার মধ্যে থাকে
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            setGoToPage(""); // ইনপুট বক্সটি খালি করে দিন
        } else {
            alert(`Please enter a page number between 1 and ${totalPages}`);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-4 mt-3 w-100">
                <div className="flex-grow-1">
                    <Link to="/dashboard/opportunities" className="i-btn btn--lg btn--soft">
                        <i className="ri-layout-grid-fill me-2"></i> Grid View
                    </Link>
                </div>
                <div className="flex-grow-1" role="group">
                    <button type="button" className="i-btn btn--outline btn--lg active">All Opportunities</button>
                    <button type="button" className="i-btn btn--primary-dark btn--lg">My Opportunities</button>
                    <button type="button" className="i-btn btn--outline btn--lg">Hired</button>
                </div>
                <div className="d-flex justify-content-end flex-grow-1">
                    <div className="i-badge big-badge soft">All-time</div>
                    <div className="dropdown"><button className="icon-btn-lg" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="ri-arrow-down-s-line"></i></button><ul className="dropdown-menu dropdown-menu-end"><li><a className="dropdown-item" href="#">This Month</a></li><li><a className="dropdown-item" href="#">This Week</a></li><li><a className="dropdown-item" href="#">This Year</a></li></ul></div>
                </div>
            </div>
            <div className="i-card-md bg--light">
                <div className="table-filter">
                    <div className="left"><h4 className="card-title">Opportunity Posted</h4></div>
                    <div className="right">
                        <div className="dropdown"><button className="i-btn btn--lg btn--outline" type="button" data-bs-toggle="dropdown" aria-expanded="false">Export as CSV <i className="ri-arrow-down-s-line ms-1"></i></button><ul className="dropdown-menu dropdown-menu-end"><li><a className="dropdown-item" href="#">Export as PDF</a></li><li><a className="dropdown-item" href="#">Export as PNG</a></li></ul></div>
                        <button className="icon-btn-lg"><i className="ri-delete-bin-6-line"></i></button>
                    </div>
                </div>
                <div className="card-body pt-0">
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th><input type="checkbox" /></th>
                                    <th>Opportunity Title</th>
                                    <th>Date Posted</th>
                                    <th>Views</th>
                                    <th>Applications</th>
                                    <th>Status</th>
                                    <th>Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTableData.length > 0 ? (
                                    currentTableData.map(job => (
                                        <tr key={job.id}>
                                            <td><input type="checkbox" /></td>
                                            <td>{job.job_title}</td>
                                            <td>{new Date(job.publish_date || job.created_at).toLocaleDateString()}</td>
                                            <td>{job.views || 0}</td>
                                            <td>{job.applications || 0}</td>
                                            <td><div className="status"><span className={`status-dot ${job.vacancy_status === 'Open' ? 'active' : 'closed'}`}></span><span>{job.vacancy_status}</span></div></td>
                                            <td>
                                                <div className="dropdown">
                                                    <button className="options-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <i className="ri-more-2-fill"></i>
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-end">
                                                        <li><a className="dropdown-item" href="#">View</a></li>
                                                        {/* কন্ডিশনাল রেন্ডারিং: যদি জবের user_id এবং বর্তমান ইউজারের আইডি একই হয় */}
                                                        {user && parseInt(user.id, 10) === parseInt(job.user_id, 10) && (
                                                            <>
                                                                <li><a className="dropdown-item" href="#">Edit</a></li>
                                                                <li><a className="dropdown-item text-danger" href="#">Delete</a></li>
                                                            </>
                                                        )}
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" className="text-center p-4">No opportunities found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* সম্পূর্ণ পেজিনেশন কম্পোনেন্ট */}
                    {totalPages > 1 && (
                        <div className="d-flex align-items-center justify-content-lg-between justify-content-center flex-lg-nowrap flex-wrap gap-3 pagination-wrapper">
                            <div className="pagination-info text-secondary small">
                                Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, opportunities.length)}</strong> of <strong>{opportunities.length}</strong> entries
                            </div>
                            <nav aria-label="Page navigation">
                                <ul className="pagination mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(1); }}><i className="ri-arrow-left-double-line"></i></a>
                                    </li>
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}><i className="ri-arrow-left-s-line"></i></a>
                                    </li>
                                    
                                    {renderPaginationButtons()}
                                    
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}><i className="ri-arrow-right-s-line"></i></a>
                                    </li>
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(totalPages); }}><i className="ri-arrow-right-double-line"></i></a>
                                    </li>
                                </ul>
                            </nav>
                            <div className="d-flex align-items-center gap-2 ms-3">
                                <span className="text-secondary small">Go to page</span>
                                <input 
                                    type="number" 
                                    className="form-control form-control-sm pagination-input" 
                                    min="1" 
                                    max={totalPages}
                                    value={goToPage}
                                    onChange={(e) => setGoToPage(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleGoToPage(); }} // Enter চাপলেও কাজ করবে
                                />
                                <button className="btn btn-sm pagination-go" onClick={handleGoToPage}>
                                    Go
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpportunityListTable;