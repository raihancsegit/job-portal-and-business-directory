// src/pages/OpportunitiesPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FilterPanel from './components/opportunities/FilterPanel';
import JobList from './components/opportunities/JobList';
import JobDetails from './components/opportunities/JobDetails';
import TopFilterBar from './components/opportunities/TopFilterBar';
import OpportunityListTable from './components/opportunities/OpportunityListTable';
import OpportunityTabs from './components/opportunities/OpportunityTabs';
import DateRangeDropdown from './components/opportunities/DateRangeDropdown';

const { api_base_url } = window.jpbd_object || {};

function OpportunitiesPage() {
    const { user, token } = useAuth();
     const location = useLocation();
    const [opportunities, setOpportunities] = useState([]);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'all');
    const [filters, setFilters] = useState({});
     const [notice, setNotice] = useState({ message: '', type: '' });
    
    
    const isListView = location.pathname.includes('opportunities-list');

    const showNoticeMessage = (message, type = 'success') => {
        setNotice({ message, type });
        // কয়েক সেকেন্ড পর নোটিশটি মুছে ফেলা হবে
        setTimeout(() => setNotice({ message: '', type: '' }), 4000); 
    };

    const fetchOpportunities = useCallback(async () => {
        setLoading(true);
        try {
            // সকল ফিল্টার এবং viewMode একসাথে করে প্যারামিটার তৈরি করা
            const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_,v]) => v && v !== 'all'));
            const params = { ...activeFilters, viewMode: activeTab };
            
            const response = await axios.get(`${api_base_url}opportunities`, {
                params,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setOpportunities(response.data);
            if (response.data.length > 0 && !isListView) {
                setSelectedOpportunity(response.data[0]);
            } else {
                setSelectedOpportunity(null);
            }
        } catch (error) {
            console.error("Failed to fetch opportunities", error);
            setOpportunities([]); // এরর হলে খালি করে দেওয়া
        } finally {
            setLoading(false);
        }
    }, [token, filters, activeTab, isListView]);

    useEffect(() => {
        // Debounce এর মাধ্যমে API কল করা
        const handler = setTimeout(() => {
            fetchOpportunities();
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [fetchOpportunities]);
    
    const handleDeleteOpportunity = async (opportunityId) => {
        if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
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

     // After applying, show a notice and RE-FETCH the data from the server.
    const handleApplicationSuccess = (appliedOpportunityId) => {
        showNoticeMessage('Application submitted! You can see it in the "Applied" tab.', 'success');
        // THIS IS THE FIX. Re-fetch from the server. The server is the single source of truth.
        fetchOpportunities();
    };

    // After withdrawing, show a notice and RE-FETCH the data from the server.
    const handleWithdrawSuccess = (withdrawnOpportunityId) => {
        showNoticeMessage('Application withdrawn successfully!', 'success');
        // THIS IS THE FIX. Re-fetch from the server.
        fetchOpportunities(); 
    };

    const handleDeleteSuccess = (deletedOpportunityId) => {
        // 1. Remove the deleted opportunity from the main list
        const updatedOpps = opportunities.filter(opp => opp.id !== deletedOpportunityId);
        setOpportunities(updatedOpps);

        // 2. Clear the details panel if the deleted item was selected
        if (selectedOpportunity?.id === deletedOpportunityId) {
            // Select the next item in the list, or null if the list is empty
            setSelectedOpportunity(updatedOpps.length > 0 ? updatedOpps[0] : null);
        }
    };

    return (
        <div className="i-card-md radius-30 card-bg-two">
            <div className="card-body">
               {!isListView && <TopFilterBar filters={filters} setFilters={setFilters} />}
                
                {isListView ? (
                    <div>
                         <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-4 mt-3 w-100">
                             <div className="flex-grow-1">
                                 <Link to="/dashboard/opportunities" className="i-btn btn--lg btn--soft">
                                     <i className="ri-layout-grid-fill me-2"></i> Grid View
                                 </Link>
                             </div>
                             <OpportunityTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                             <DateRangeDropdown filters={filters} setFilters={setFilters} />
                         </div>
                         <OpportunityListTable 
                            opportunities={opportunities}  
                            onDelete={handleDeleteOpportunity}
                            setOpportunities={setOpportunities}
                        />
                    </div>
                ) : (
                    <div className="description-container">
                        <FilterPanel filters={filters} setFilters={setFilters} />
                        <div className="descrition-content">
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
                                         activeTab={activeTab}
                                        onWithdrawSuccess={handleWithdrawSuccess} 
                                        
                                    />
                                </div>
                                <div className="col-xxl-8">
                                    <JobDetails 
                                        opportunity={selectedOpportunity} 
                                        showNotice={showNoticeMessage} 
                                        activeTab={activeTab}
                                        onApplySuccess={handleApplicationSuccess}
                                        onWithdrawSuccess={handleWithdrawSuccess}
                                         onDeleteSuccess={handleDeleteSuccess}
                                    />
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