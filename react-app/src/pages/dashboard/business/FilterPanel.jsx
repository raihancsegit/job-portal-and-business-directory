import React, { useState, useEffect } from 'react';
import { businessCategories } from '../../../data/businessCategories';
import { businessStatuses } from '../../../data/businessStatuses';

// Helper Component for List Items
const FilterListItem = ({ name, value, label, count, selectedValue, onChange }) => (
    <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
        <label className="d-flex align-items-center text-secondary small">
            <input 
                type="radio" 
                name={name} 
                value={value} 
                checked={selectedValue === value} 
                onChange={e => onChange(e.target.value)} 
                className="form-check-input me-2" 
            />
            {label}
        </label>
        <span className="item-count">{count}</span>
    </li>
);

// Main FilterPanel Component
const BusinessFilterPanel = ({ filters, setFilters, filterCounts, loadingCounts, hideTopSearch = false }) => {
    
    const [searchTitle, setSearchTitle] = useState(filters.title || '');
    const [searchLocation, setSearchLocation] = useState(filters.location || '');

    // filters prop পরিবর্তন হলে লোকাল state আপডেট করা
    useEffect(() => {
        setSearchTitle(filters.title || '');
        setSearchLocation(filters.location || '');
    }, [filters.title, filters.location]);

    const handleFilterChange = (filterType, value) => {
        const newValue = value === 'all' ? '' : value;
        setFilters(prev => ({
            ...prev,
            [filterType]: newValue
        }));
    };
    
    const handleTextSearch = () => {
        setFilters(prev => ({ ...prev, title: searchTitle, location: searchLocation }));
    };

    // ================== নতুন সংযোজন: Clear All ফাংশন ==================
    const handleClearFilters = () => {
        // টপ সার্চ ফিল্ডগুলো খালি করা
        setSearchTitle('');
        setSearchLocation('');
        
        // প্যারেন্ট কম্পোনেন্টের সব ফিল্টার রিসেট করা
        setFilters({
            title: '',
            location: '',
            category: '',
            status: '',
            certification: ''
        });
    };
    // ====================================================================

    const selectedCategory = filters.category || 'all';
    const selectedStatus = filters.status || 'all';
    const selectedCertification = filters.certification || 'all';

    return (
         <div className="filter-panel" id="filterPanel">
            {!hideTopSearch && (
                <div className="top-filter mb-4">
                    <div className="row g-3 d-flex align-items-center">
                        <div className="col-md-12"><div className="top-filter-item style-2"><div className="icon"><i className="ri-briefcase-line"></i></div><input type="text" placeholder="Business name" className="form-control" value={searchTitle} onChange={e => setSearchTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTextSearch()} /></div></div>
                        <div className="col-md-12"><div className="top-filter-item style-2"><div className="icon"><i className="ri-map-pin-line"></i></div><input type="text" placeholder="State/City/Zip" className="form-control" value={searchLocation} onChange={e => setSearchLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTextSearch()} /></div></div>
                        <div className="col-md-12 w-100"><button type="button" className="i-btn btn--lg btn--dark w-100" onClick={handleTextSearch}><i className="ri-search-line me-2"></i> Search</button></div>
                    </div>
                </div>
            )}

            {/* ================== নতুন সংযোজন: Clear All বাটন ================== */}
            <div className="d-flex flex-row justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Filters</h2>
                <button 
                    type="button" 
                    className="btn btn-link text-secondary text-decoration-none p-0" 
                    onClick={handleClearFilters}
                >
                    Clear All
                </button>
            </div>
            {/* ==================================================================== */}
            
            <div className="accordion mb-4" id="filterAccordion">
                {/* Business Status Filter */}
                <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header">
                        <button className="accordion-button fw-semibold px-0 bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapseStatus">
                            <span>Business status</span><span><i className="ri-arrow-down-s-line"></i></span>
                        </button>
                    </h2>
                    <div id="collapseStatus" className="accordion-collapse collapse show">
                        <div className="accordion-body px-0 pt-2 pb-0">
                            <ul className="list-unstyled mb-0">
                                {loadingCounts ? <p>Loading counts...</p> : businessStatuses.map(status => {
                                    const countData = filterCounts?.status?.find(s => s.name === status.value);
                                    return <FilterListItem key={status.value} name="business-status" value={status.value} label={status.label} count={countData?.count ?? 0} selectedValue={selectedStatus} onChange={(value) => handleFilterChange('status', value)} />
                                })}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header"><button className="accordion-button fw-semibold px-0 bg-transparent shadow-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCategory"><span>Category</span><span><i className="ri-arrow-down-s-line"></i></span></button></h2>
                    <div id="collapseCategory" className="accordion-collapse collapse">
                        <div className="accordion-body px-0 pt-2 pb-0">
                            <ul className="list-unstyled mb-0">
                                {loadingCounts ? <p>Loading counts...</p> : businessCategories.map(cat => {
                                    const countData = filterCounts?.category?.find(c => c.name === cat.slug);
                                    return <FilterListItem key={cat.slug} name="category" value={cat.slug} label={cat.name} count={countData?.count ?? 0} selectedValue={selectedCategory} onChange={(value) => handleFilterChange('category', value)} />
                                })}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Certifications Filter */}
                <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header"><button className="accordion-button fw-semibold px-0 bg-transparent shadow-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCerts"><span>Certifications</span><span><i className="ri-arrow-down-s-line"></i></span></button></h2>
                    <div id="collapseCerts" className="accordion-collapse collapse">
                        <div className="accordion-body px-0 pt-2 pb-0">
                            <ul className="list-unstyled mb-0">
                                {loadingCounts ? <p>Loading counts...</p> : filterCounts?.certifications?.map(cert => (
                                    <FilterListItem key={cert.name} name="certification" value={cert.name} label={cert.name} count={cert.count} selectedValue={selectedCertification} onChange={(value) => handleFilterChange('certification', value)} />
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessFilterPanel;