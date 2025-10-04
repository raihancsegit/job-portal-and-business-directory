// src/pages/dashboard/SavedItemsPage.jsx (নতুন ফাইল)

import React, { useState, useEffect, useCallback,useMemo  } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import OpportunityFilterPanel from './components/opportunities/FilterPanel'; // Opportunity ফিল্টার রি-ইউজ করা
import JobList from './components/opportunities/JobList'; // JobList রি-ইউজ করা
import JobDetails from './components/opportunities/JobDetails'; // JobDetails রি-ইউজ করা
import DateRangeDropdown from './components/opportunities/DateRangeDropdown';
// BusinessList এবং BusinessDetails পরে তৈরি করতে হবে
import BusinessFilterPanel from './business/FilterPanel'; // Business-এর জন্য আলাদা ফিল্টার
import BusinessList from './business/BusinessList';
import BusinessDetails from './business/BusinessDetails';

const SavedItemsPage = () => {
    const { token } = useAuth();
    const { api_base_url } = window.jpbd_object || {};
    
    // UI States
    const [activeTab, setActiveTab] = useState('opportunity'); // 'opportunity' or 'business'
    const [loading, setLoading] = useState(true);
    
    // Data States
    const [savedItems, setSavedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    
    // Filter States
    const [filters, setFilters] = useState({});
    const [filterCounts, setFilterCounts] = useState(null);
    const [loadingCounts, setLoadingCounts] = useState(true);

    // সেভ করা আইটেমগুলো আনার জন্য ফাংশন
    const fetchSavedItems = useCallback(async () => {
        setLoading(true);
        setSelectedItem(null); // ট্যাব পরিবর্তনের সময় সিলেকশন রিসেট করা
        try {
            const response = await axios.get(`${api_base_url}saved-items`, {
                params: { type: activeTab },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSavedItems(response.data);
            if (response.data.length > 0) {
                setSelectedItem(response.data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch saved items", error);
        } finally {
            setLoading(false);
        }
    }, [api_base_url, token, activeTab]);

    // ফিল্টার কাউন্ট আনার জন্য ফাংশন
    const fetchFilterCounts = useCallback(async () => {
        if (!token) return;
        setLoadingCounts(true);
        try {
            const response = await axios.get(`${api_base_url}saved-items/filter-counts`, {
                params: { type: activeTab },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFilterCounts(response.data);
        } catch (error) {
            console.error(`Failed to fetch saved ${activeTab} counts`, error);
        } finally {
            setLoadingCounts(false);
        }
    }, [api_base_url, token, activeTab]);

    // ট্যাব পরিবর্তন হলে ডেটা এবং কাউন্ট রি-ফেচ করা
    useEffect(() => {
        setFilters({}); // ট্যাব পরিবর্তনের সময় ফিল্টার রিসেট করা
        fetchSavedItems();
        fetchFilterCounts();
    }, [fetchSavedItems, fetchFilterCounts]);

    // আনসেভ করার পর UI আপডেট করার জন্য হ্যান্ডলার
    const handleUnsave = (itemId) => {
        const updatedItems = savedItems.filter(item => item.id !== itemId);
        setSavedItems(updatedItems);

        if (selectedItem?.id === itemId) {
            setSelectedItem(updatedItems.length > 0 ? updatedItems[0] : null);
        }
        // আনসেভ করার পর কাউন্ট রি-ফেচ করা
        fetchFilterCounts();
    };

    // ফিল্টার করা আইটেমগুলোর জন্য useMemo
    const filteredItems = useMemo(() => {
        if (Object.values(filters).every(val => !val)) { // চেক করা হচ্ছে সব ফিল্টার খালি কিনা
            return savedItems;
        }
        
        return savedItems.filter(item => {
            if (activeTab === 'opportunity') {
                if (filters.jobType && item.job_type !== filters.jobType) return false;
                if (filters.workplace && item.workplace !== filters.workplace) return false;
                if (filters.industry && item.industry !== filters.industry) return false;
                if (filters.experience && item.experience !== filters.experience) return false;
                return true;
            } else if (activeTab === 'business') {
                if (filters.category && item.category !== filters.category) return false;
                if (filters.status && item.status !== filters.status) return false;
                if (filters.certification && !item.certifications?.includes(filters.certification)) return false;
                return true;
            }
            return true;
        });
    }, [savedItems, filters, activeTab]);
    
    return (
        <div className="i-card-md radius-30 card-bg-two">
            <div className="card-body">
                <div className="top-filter">
                    <div className="row g-3 d-flex align-items-center">
                        <div className="col-md-9">
                            <h3>
                            {activeTab === 'opportunity' ? 'Saved Opportunities' : 'Saved Businesses'}
                        </h3>
                        </div>
                        <div className="col-md-3 d-flex justify-content-end gap-2">
                            <button onClick={() => setActiveTab('opportunity')} type="button" className={`i-btn btn--xl ${activeTab === 'opportunity' ? 'btn--primary-dark active' : 'btn--outline'}`}>Opportunity</button>
                            <button onClick={() => setActiveTab('business')} type="button" className={`i-btn btn--xl ${activeTab === 'business' ? 'btn--primary-dark active' : 'btn--outline'}`}>Business</button>
                        </div>
                    </div>
                </div>

                <div className="description-container">
                                    
                    {activeTab === 'opportunity' && (
                        <>
                            <OpportunityFilterPanel 
                                filters={filters} 
                                setFilters={setFilters} 
                                filterCounts={filterCounts}
                                loadingCounts={loadingCounts}
                            />
                            <div className="descrition-content">
                                <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-4 mt-3">
                                   
                                    <DateRangeDropdown filters={filters} setFilters={setFilters} />
                                </div>
                                
                                {loading ? <p className="p-5 text-center">Loading...</p> : (
                                    <div className="row g-3">
                                        <div className="col-xxl-4">
                                            <JobList 
                                                opportunities={filteredItems} 
                                                onSelectOpportunity={setSelectedItem} 
                                                selectedOpportunityId={selectedItem?.id} 
                                                onUnsave={handleUnsave}
                                            />
                                        </div>
                                        <div className="col-xxl-8">
                                            <JobDetails 
                                                opportunity={selectedItem} 
                                                onUnsave={handleUnsave} 
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {activeTab === 'business' && (
                        <>
                            <BusinessFilterPanel 
                                filters={filters} 
                                setFilters={setFilters} 
                                filterCounts={filterCounts}
                                loadingCounts={loadingCounts}
                                hideTopSearch={true}
                            />
                            <div className="descrition-content">
                                 <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-4 mt-3">
                                   
                                    <DateRangeDropdown filters={filters} setFilters={setFilters} />
                                </div>
                                {loading ? <p className="p-5 text-center">Loading...</p> : (
                                    <div className="row g-3">
                                        <div className="col-xxl-4">
                                            <BusinessList 
                                                businesses={filteredItems} 
                                                onSelectBusiness={setSelectedItem} 
                                                selectedBusiness={selectedItem}
                                                onUnsave={handleUnsave} 
                                            />
                                        </div>
                                        <div className="col-xxl-8">
                                            <BusinessDetails business={selectedItem} onUnsave={handleUnsave}/>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedItemsPage;