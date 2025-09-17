// src/pages/dashboard/business/BusinessDirectoryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { businessCategories } from '../../../data/businessCategories';
import { useAuth } from '../../../context/AuthContext';

// Child Components
import FilterPanel from './FilterPanel';
import BusinessList from './BusinessList';
import BusinessDetails from './BusinessDetails';
import CategorySlider from './CategorySlider';

const { api_base_url } = window.jpbd_object || {};
const token = localStorage.getItem('authToken');
const authHeader = { headers: { 'Authorization': `Bearer ${token}` } };



// ===================================================================
// Main BusinessDirectoryPage Component
// ===================================================================
const BusinessDirectoryPage = () => {
     const { user, loading: authLoading } = useAuth();
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [filters, setFilters] = useState({ viewMode: 'all' });
    const [loading, setLoading] = useState(true);
    const [filterCounts, setFilterCounts] = useState(null);
    
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
            const params = new URLSearchParams(activeFilters).toString();
            const response = await axios.get(`${api_base_url}businesses?${params}`, authHeader);
            
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

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await axios.get(`${api_base_url}businesses/filter-counts`, authHeader);
                setFilterCounts(response.data);
            } catch (error) { 
                console.error("Failed to fetch filter counts", error);
            }
        };
        fetchCounts();
    }, []);

     const handleFilterChange = (newFilters) => {
        // useCallback এখান থেকে সরিয়ে দেওয়া হয়েছে, কারণ এটি আর প্রয়োজন নেই
        setFilters(newFilters);
    };

    const handleViewModeChange = (mode) => {
        setFilters(prev => ({ ...prev, viewMode: mode }));
    };
    
    const canAddBusiness = user && (user.roles.includes('employer') || user.roles.includes('business') || user.roles.includes('administrator'));
     if (authLoading || loading) {
        return <div className="p-5 text-center">Loading...</div>;
    }
    return (
        <div className="main-dir">
            <div className="i-card-md radius-30 card-bg-two">
                <div className="card-body">
                    <div className="description-container">
                        {/* Bootstrap গ্রিড বাদ দিয়ে সরাসরি Flexbox ব্যবহার করা হলো */}
                        <div className="d-flex gap-4">
                            <FilterPanel 
                                onFilterChange={handleFilterChange} 
                                filters={filters}
                                filterCounts={filterCounts}
                            />
                            <div className="descrition-content flex-grow-1">
                                <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-4 mt-3">
                                    <h3>All Business</h3>
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
                                        {loading ? <div className="p-5 text-center">Loading...</div> : 
                                            <BusinessList 
                                                businesses={businesses} 
                                                onSelectBusiness={setSelectedBusiness}
                                                selectedBusiness={selectedBusiness}
                                            />
                                        }
                                    </div>
                                    <div className="col-xxl-8">
                                        {loading ? <div className="p-5 text-center">Loading...</div> :
                                            <BusinessDetails business={selectedBusiness} />
                                        }
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