// src/pages/dashboard/business/BusinessDirectoryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { businessCategories } from '../../../data/businessCategories';
import { useAuth } from '../../../context/AuthContext';

// Child Components
import BusinessFilterPanel from './FilterPanel';
import BusinessList from './BusinessList';
import BusinessDetails from './BusinessDetails';
import CategorySlider from './CategorySlider';

const { api_base_url } = window.jpbd_object || {};
const token = localStorage.getItem('authToken');
const authHeader = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};

// Main BusinessDirectoryPage Component
const BusinessDirectoryPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [filters, setFilters] = useState({ viewMode: 'all' });
    const [loading, setLoading] = useState(true);
    const [filterCounts, setFilterCounts] = useState(null);
    const [loadingCounts, setLoadingCounts] = useState(true);

    const fetchBusinesses = useCallback(async () => {
        setLoading(true);
        setSelectedBusiness(null);
        try {
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== '' && value !== 'all')
            );
            if (filters.viewMode) {
                activeFilters.viewMode = filters.viewMode;
            }
            
            const response = await axios.get(`${api_base_url}businesses`, {
                params: activeFilters,
                ...authHeader // 헤더 যোগ করা হয়েছে
            });
            
            setBusinesses(response.data);
            if (response.data.length > 0) {
                setSelectedBusiness(response.data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch businesses", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchBusinesses();
    }, [fetchBusinesses]);

    // ফিল্টার কাউন্ট আনার জন্য useEffect
    useEffect(() => {
        const fetchCounts = async () => {
            setLoadingCounts(true);
            try {
                const response = await axios.get(`${api_base_url}businesses/filter-counts`);
                setFilterCounts(response.data);
            } catch (error) { 
                console.error("Failed to fetch filter counts", error);
            } finally {
                setLoadingCounts(false);
            }
        };
        fetchCounts();
    }, []);

    const handleViewModeChange = (mode) => {
        setFilters(prev => ({ ...prev, viewMode: mode }));
    };
    
    const canAddBusiness = user && (user.roles.includes('employer') || user.roles.includes('business') || user.roles.includes('administrator'));
    
    if (authLoading) {
        return <div className="p-5 text-center">Authenticating...</div>;
    }

    const handleBusinessUnsave = (businessId) => {
    // BusinessDirectory পেজে আনসেভ করলে لیست থেকে আইটেম সরানোর দরকার নেই,
    // কিন্তু আমরা চাইলে লিস্টের আইটেমটির is_saved স্ট্যাটাস আপডেট করতে পারি
    setBusinesses(prev => prev.map(b => 
        b.id === businessId ? { ...b, is_saved: false } : b
    ));
};

    return (
        <div className="main-dir">
            <div className="i-card-md radius-30 card-bg-two">
                <div className="card-body">
                    <div className="description-container">
                        <div className="d-flex gap-4 flex-grow-1">
                            <BusinessFilterPanel 
                                filters={filters}
                                setFilters={setFilters}
                                filterCounts={filterCounts}
                                loadingCounts={loadingCounts}
                            />
                            <div className="descrition-content flex-grow-1">
                                <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-4 mt-3">
                                    <h3>All Businesses</h3>
                                    <div className="flex-grow-1" role="group">
                                        <button type="button" className={`i-btn btn--lg ${filters.viewMode === 'all' ? 'btn--primary-dark active' : 'btn--outline'}`} onClick={() => handleViewModeChange('all')}>All</button>
                                        <button type="button" className={`i-btn btn--lg ${filters.viewMode === 'my_listing' ? 'btn--primary-dark active' : 'btn--outline'}`} onClick={() => handleViewModeChange('my_listing')}>My Listing</button>
                                    </div>
                                   
                                    {canAddBusiness && (
                                        <div className="d-flex justify-content-end flex-grow-1">
                                            <Link to="/dashboard/add-business" className="i-btn btn--xl btn--primary"><i className="ri-add-circle-line me-2"></i>Add Business</Link>
                                        </div>
                                    )}
                                </div>
                                
                                <CategorySlider 
                                    categories={businessCategories}
                                    activeCategory={filters.category}
                                    onCategorySelect={(slug) => setFilters(prev => ({...prev, category: slug === prev.category ? '' : slug}))}
                                />

                                <div className="row g-3 mt-4">
                                    <div className="col-xxl-4">
                                        {loading ? <div className="p-5 text-center">Loading Businesses...</div> : 
                                            <BusinessList 
                                                businesses={businesses} 
                                                onSelectBusiness={setSelectedBusiness}
                                                selectedBusiness={selectedBusiness}
                                            />
                                        }
                                    </div>
                                    <div className="col-xxl-8">
                                        <BusinessDetails business={selectedBusiness} onUnsave={handleBusinessUnsave} onUpdateOrDelete={fetchBusinesses}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessDirectoryPage;