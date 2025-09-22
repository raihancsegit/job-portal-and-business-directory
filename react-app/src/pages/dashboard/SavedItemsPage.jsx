// src/pages/dashboard/SavedItemsPage.jsx (নতুন ফাইল)

import React, { useState, useEffect, useCallback,useMemo  } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import FilterPanel from './components/opportunities/FilterPanel'; // Opportunity ফিল্টার রি-ইউজ করা
import JobList from './components/opportunities/JobList'; // JobList রি-ইউজ করা
import JobDetails from './components/opportunities/JobDetails'; // JobDetails রি-ইউজ করা
// BusinessList এবং BusinessDetails পরে তৈরি করতে হবে

const SavedItemsPage = () => {
    const { token } = useAuth();
    const { api_base_url } = window.jpbd_object || {};
    const [activeTab, setActiveTab] = useState('opportunity'); // 'opportunity' or 'business'
    const [savedItems, setSavedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);

     const [filters, setFilters] = useState({});

    const fetchSavedItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${api_base_url}saved-items`, {
                params: { type: activeTab },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSavedItems(response.data);
            if (response.data.length > 0) {
                setSelectedItem(response.data[0]);
            } else {
                setSelectedItem(null);
            }
        } catch (error) {
            console.error("Failed to fetch saved items", error);
        } finally {
            setLoading(false);
        }
    }, [api_base_url, token, activeTab]);

    useEffect(() => {
        fetchSavedItems();
    }, [fetchSavedItems]);

    // আনসেভ করার পর UI আপডেট করার জন্য
    const handleUnsave = (itemId) => {
        // UI থেকে সাথে সাথে আইটেমটি সরিয়ে ফেলা
        const updatedItems = savedItems.filter(item => item.id !== itemId);
        setSavedItems(updatedItems);

        // JobDetails প্যানেল আপডেট করা
        if (selectedItem?.id === itemId) {
            setSelectedItem(updatedItems.length > 0 ? updatedItems[0] : null);
        }
    };

    const filteredItems = useMemo(() => {
        if (Object.keys(filters).length === 0) {
            return savedItems;
        }
        
        // এখানে একটি বেসিক ফিল্টারিং লজিক যোগ করা হয়েছে
        // আপনার FilterPanel-এর উপর ভিত্তি করে এটি আরও বিস্তারিত হতে পারে
        return savedItems.filter(item => {
            let matches = true;
            if (filters.jobType && item.job_type !== filters.jobType) matches = false;
            if (filters.workplace && item.workplace !== filters.workplace) matches = false;
            if (filters.industry && item.industry !== filters.industry) matches = false;
            // ... আরও ফিল্টার ...
            return matches;
        });
    }, [savedItems, filters]);
    
    return (
        <div className="i-card-md radius-30 card-bg-two">
            <div className="card-body">
                <div className="top-filter">
                    <div className="row g-3 d-flex align-items-center">
                        <div className="col-md-9"><h3>Saved Items</h3></div>
                        <div className="col-md-3 d-flex justify-content-end gap-2">
                            <button onClick={() => setActiveTab('opportunity')} type="button" className={`i-btn btn--xl ${activeTab === 'opportunity' ? 'btn--primary-dark active' : 'btn--outline'}`}>Opportunity</button>
                            <button onClick={() => setActiveTab('business')} type="button" className={`i-btn btn--xl ${activeTab === 'business' ? 'btn--primary-dark active' : 'btn--outline'}`}>Business</button>
                        </div>
                    </div>
                </div>

                <div className="description-container">
                    {/* FilterPanel এবং Main Content */}
                    {activeTab === 'opportunity' && (
                        <>
                            <FilterPanel filters={filters} setFilters={setFilters} /> {/* ফিল্টার পরে যোগ করা যাবে */}
                            <div className="descrition-content">
                                {loading ? <p>Loading...</p> : (
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
                                            <JobDetails opportunity={selectedItem} onUnsave={handleUnsave} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    {activeTab === 'business' && (
                        <div className="p-5 text-center">
                            {/* Business লিস্ট এবং ডিটেইলস এখানে আসবে */}
                            <p>Saved Businesses will be shown here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedItemsPage;