import React, { useState, useEffect,useCallback  } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';

import FilterPanel from './components/opportunities/FilterPanel';
import JobList from './components/opportunities/JobList';
import JobDetails from './components/opportunities/JobDetails';
import TopFilterBar from './components/opportunities/TopFilterBar';
import OpportunityListTable from './components/opportunities/OpportunityListTable'; // নতুন ইম্পোর্ট

function OpportunitiesPage() {
    const [opportunities, setOpportunities] = useState([]);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);

     const [filters, setFilters] = useState({
        searchTitle: '',
        searchLocation: '',
        experience: '',
        jobType: '',
        workplace: '',
        datePosted: 'all',
        industry: '',
    });

    const { api_base_url } = window.jpbd_object;
    
    // URL দেখে বর্তমান ভিউ নির্ধারণ করা
    const location = useLocation();
    const isListView = location.pathname.includes('opportunities-list');


     const fetchOpportunities = useCallback(() => {
        setLoading(true);
        axios.get(`${api_base_url}opportunities`, { params: filters })
            .then(response => {
                setOpportunities(response.data);
                if (response.data.length > 0 && !isListView) {
                    setSelectedOpportunity(response.data[0]);
                } else {
                    setSelectedOpportunity(null);
                }
            })
            .catch(error => console.error("Failed to fetch opportunities", error))
            .finally(() => setLoading(false));
    }, [api_base_url, isListView, filters]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchOpportunities();
        }, 500);
        return () => clearTimeout(handler);
    }, [filters, fetchOpportunities]);

    useEffect(() => {
        const fetchOpportunities = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${api_base_url}opportunities`);
                setOpportunities(response.data);
                if (response.data.length > 0 && !isListView) {
                    setSelectedOpportunity(response.data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch opportunities", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOpportunities();
    }, [api_base_url, isListView]);

    if (loading) {
        return <div className="p-4">Loading opportunities...</div>;
    }

    return (
        <div className="i-card-md radius-30 card-bg-two">
            <div className="card-body">
               <TopFilterBar filters={filters} setFilters={setFilters} />

                {isListView ? (
                    // ===================
                    // LIST VIEW
                    // ===================
                    <OpportunityListTable opportunities={opportunities} />
                ) : (
                    // ===================
                    // GRID VIEW
                    // ===================
                    <div className="description-container">
                        <FilterPanel filters={filters} setFilters={setFilters} />
                        <div className="descrition-content">
                             <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-4 mt-3">
                               <div className="flex-grow-1" role="group">
                                    <button type="button" className="i-btn btn--outline btn--lg active">All Opportunities</button>
                                    <button type="button" className="i-btn btn--primary-dark btn--lg">My Opportunities</button>
                                    <button type="button" className="i-btn btn--outline btn--lg">Hired</button>
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
                )}
            </div>
        </div>
    );
}

export default OpportunitiesPage;