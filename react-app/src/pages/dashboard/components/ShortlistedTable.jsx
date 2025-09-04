import React from 'react';

const ShortlistedTable = () => {
    const applicants = [
        { name: 'Tyrone Washington', status: 'Hired', statusClass: 'active' },
        { name: 'Michael Johnson', status: 'Processing', statusClass: 'processing' },
        { name: 'Jessica Brown', status: 'Active', statusClass: 'active' },
    ];

    return (
        <div className="i-card-md">
            <div className="table-filter">
                <div className="left">
                    <h4 className="card-title">Shortlisted</h4>
                </div>
                <div className="right">
                    <div className="dropdown">
                        <button className="i-btn btn--lg btn--outline" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            UI/UX Designer <i className="ri-arrow-down-s-line ms-1"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><a className="dropdown-item" href="#">Fontend Developer</a></li>
                            <li><a className="dropdown-item" href="#">Backend Developer</a></li>
                        </ul>
                   </div>
                </div>
            </div>
            <div className="card-body pt-0">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Applicant</th>
                                <th>Status</th>
                                <th>Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map((applicant, index) => (
                                <tr key={index}>
                                    <td>{applicant.name}</td>
                                    <td>
                                        <div className="status">
                                            <span className={`status-dot ${applicant.statusClass}`}></span>
                                            <span>{applicant.status}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="dropdown">
                                            <button className="options-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <i className="ri-more-2-fill"></i>
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end">
                                                <li><a className="dropdown-item" href="#">View</a></li>
                                                <li><a className="dropdown-item" href="#">Edit</a></li>
                                                <li><a className="dropdown-item text-danger" href="#">Delete</a></li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ShortlistedTable;