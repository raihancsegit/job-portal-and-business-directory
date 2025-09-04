import React from 'react';

const OpportunityPostedTable = () => {
    const opportunities = [
        { title: 'UI/UX Designer', date: 'Mar 12, 2025', views: 5364, applications: 867, status: 'Active', statusClass: 'active' },
        { title: 'Senior Marketing Manager', date: 'Feb 27, 2025', views: 4648, applications: 578, status: 'Closed', statusClass: 'closed' },
        { title: 'SEO Expert', date: 'Feb 04, 2025', views: 2354, applications: 784, status: 'Active', statusClass: 'active' },
    ];

    return (
        <div className="i-card-md">
            <div className="table-filter">
                <div className="left">
                    <h4 className="card-title">Opportunity Posted</h4>
                    <div className="i-badge big-badge soft">All-time</div>
                    <div className="dropdown d-inline-block">
                        <button className="icon-btn-lg" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="ri-arrow-down-s-line"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><a className="dropdown-item" href="#">This Month</a></li>
                            <li><a className="dropdown-item" href="#">This Week</a></li>
                            <li><a className="dropdown-item" href="#">This Year</a></li>
                        </ul>
                    </div>
                </div>
                <div className="right">
                    <div className="dropdown d-inline-block">
                        <button className="i-btn btn--lg btn--outline" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Export as CSV <i className="ri-arrow-down-s-line ms-1"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><a className="dropdown-item" href="#">Export as PDF</a></li>
                            <li><a className="dropdown-item" href="#">Export as PNG</a></li>
                        </ul>
                    </div>
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
                            {opportunities.map((opp, index) => (
                                <tr key={index}>
                                    <td><input type="checkbox" /></td>
                                    <td>{opp.title}</td>
                                    <td>{opp.date}</td>
                                    <td>{opp.views}</td>
                                    <td>{opp.applications}</td>
                                    <td>
                                        <div className="status">
                                            <span className={`status-dot ${opp.statusClass}`}></span>
                                            <span>{opp.status}</span>
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

export default OpportunityPostedTable;