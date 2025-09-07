import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FilterPanel from './components/opportunities/FilterPanel';
import JobList from './components/opportunities/JobList';
import JobDetails from './components/opportunities/JobDetails';
import TopFilterBar from './components/opportunities/TopFilterBar';

function OpportunitiesPage() {
    const [opportunities, setOpportunities] = useState([]);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const { api_base_url } = window.jpbd_object;

    useEffect(() => {
        const fetchOpportunities = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${api_base_url}opportunities`);
                setOpportunities(response.data);
                if (response.data.length > 0) {
                    setSelectedOpportunity(response.data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch opportunities", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOpportunities();
    }, [api_base_url]);

    if (loading) {
        return <div className="p-4">Loading opportunities...</div>;
    }

    return (
        <>
            <div className="i-card-md radius-30 card-bg-two">
                <div className="card-body">
                    <TopFilterBar />
                    <div className="description-container">
                        <FilterPanel />
                        <div className="descrition-content">
                            <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-4 mt-3">
                                <div className="flex-grow-1" role="group">
                                    <button type="button" className="i-btn btn--outline btn--lg active">All Opportunities</button>
                                    <button type="button" className="i-btn btn--primary-dark btn--lg">My Opportunities</button>
                                    <button type="button" className="i-btn btn--outline btn--lg">Hired</button>
                                </div>
                                <div className="d-flex justify-content-end flex-grow-1">
                                    <div className="i-badge big-badge soft">All-time</div>
                                    <div className="dropdown">
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
                            </div>
                            <div className="row g-3">
                                <div className="col-xxl-4">
                                    <JobList 
                                        opportunities={opportunities}
                                        onSelectOpportunity={setSelectedOpportunity}
                                        selectedOpportunityId={selectedOpportunity?.id}
                                    />
                                </div>
                                <div className="col-xxl-8">
                                    <JobDetails opportunity={selectedOpportunity} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OpportunitiesPage;