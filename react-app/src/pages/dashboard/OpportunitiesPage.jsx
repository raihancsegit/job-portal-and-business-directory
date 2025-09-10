import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import FilterPanel from './components/opportunities/FilterPanel';
import JobList from './components/opportunities/JobList';
import JobDetails from './components/opportunities/JobDetails';
import TopFilterBar from './components/opportunities/TopFilterBar';
import OpportunityListTable from './components/opportunities/OpportunityListTable';
import OpportunityTabs from './components/opportunities/OpportunityTabs';
import DateRangeDropdown from './components/opportunities/DateRangeDropdown';
function OpportunitiesPage() {
    const { user } = useAuth();
    const [opportunities, setOpportunities] = useState([]);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('authToken');

    // ======================================================
    // ধাপ ১: ট্যাবের জন্য নতুন state তৈরি করা
    // ======================================================
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'my_opportunities', or 'hired'

    const [filters, setFilters] = useState({
        searchTitle: '', searchLocation: '', experience: '',
        jobType: '', workplace: '', datePosted: 'all', industry: '',
        minSalary: '', maxSalary: '', dateRange: 'all-time',
    });

    const { api_base_url } = window.jpbd_object || {};
    const location = useLocation();
    const isListView = location.pathname.includes('opportunities-list');
    const debounceTimeout = useRef(null);

    // ======================================================
    // ধাপ ২: API কল করার ফাংশনটিকে activeTab অনুযায়ী আপডেট করা
    // ======================================================
    const fetchOpportunities = useCallback(() => {
        setLoading(true);
        
        const params = { ...filters };
        const config = { params, headers: {} };

        // ট্যাবের উপর ভিত্তি করে API প্যারামিটার সেট করা
        if (activeTab === 'my_opportunities') {
            params.viewMode = 'my_opportunities';
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        } else {
            delete params.viewMode;
        }
        
        axios.get(`${api_base_url}opportunities`, config)
            .then(response => {
                setOpportunities(response.data);
                if (response.data.length > 0 && !isListView) {
                    setSelectedOpportunity(response.data[0]);
                } else {
                    setSelectedOpportunity(null);
                }
            })
            .catch(error => {
                console.error("Failed to fetch opportunities", error);
                setOpportunities([]);
                setSelectedOpportunity(null);
            })
            .finally(() => setLoading(false));
    }, [api_base_url, isListView, token, filters, activeTab]); // activeTab-কে dependency হিসেবে যোগ করা

    // `filters` বা `activeTab` পরিবর্তন হলে API কল করা
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            fetchOpportunities();
        }, 500);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [filters, activeTab, fetchOpportunities]); // activeTab-কে dependency হিসেবে যোগ করা
    
    // ... (handleDeleteOpportunity ফাংশন অপরিবর্তিত) ...
    const handleDeleteOpportunity = async (opportunityId) => {
        if (!window.confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
            return;
        }
        try {
            await axios.delete(`${api_base_url}opportunities/${opportunityId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
            if (selectedOpportunity?.id === opportunityId) {
                setSelectedOpportunity(null);
            }
            alert('Opportunity deleted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Could not delete the opportunity.');
        }
    };

    return (
        <div className="i-card-md radius-30 card-bg-two">
            <div className="card-body">
               <TopFilterBar filters={filters} setFilters={setFilters} />
                {isListView ? (
                    <OpportunityListTable 
                        opportunities={opportunities}  
                        onDelete={handleDeleteOpportunity}
                        activeTab={activeTab} // prop পাস করা
                        setActiveTab={setActiveTab} // prop পাস করা
                        filters={filters}
                        setFilters={setFilters}
                    />
                ) : (
                    <div className="description-container">
                        <FilterPanel filters={filters} setFilters={setFilters} />
                        <div className="descrition-content">
                            {/* ====================================================== */}
                            {/* ধাপ ৩: বাটনগুলোকে state-এর সাথে যুক্ত করা */}
                            {/* ====================================================== */}
                            <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-4 mt-3">
                                 <OpportunityTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                                
                                <DateRangeDropdown filters={filters} setFilters={setFilters} />
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