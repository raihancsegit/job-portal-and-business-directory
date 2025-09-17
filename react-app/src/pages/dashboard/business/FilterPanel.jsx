// src/pages/dashboard/components/business/FilterPanel.jsx

import React, { useState, useEffect } from 'react';
import { businessCategories } from '../../../data/businessCategories';
import { businessStatuses } from '../../../data/businessStatuses';
// Helper Component for List Items
const FilterListItem = ({ name, value, label, count, selectedValue, onChange }) => (
    <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
        <label className="d-flex align-items-center text-secondary small">
            <input type="radio" name={name} value={value} checked={selectedValue === value} onChange={e => onChange(e.target.value)} className="form-check-input me-2" />
            {label}
        </label>
        <span className="item-count">{count}</span>
    </li>
);

// Main FilterPanel Component
const FilterPanel = ({ onFilterChange, filters, filterCounts }) => {
    
    // লোকাল state, শুধুমাত্র টেক্সট ইনপুটের জন্য
    const [searchTitle, setSearchTitle] = useState(filters.title || '');
    const [searchLocation, setSearchLocation] = useState(filters.location || '');

    const selectedStatus = filters.status || 'all';
    // "Search" বাটনে ক্লিক করলে বা Enter চাপলে এই ফাংশনটি কল হবে
    const handleTextSearch = () => {
        onFilterChange(prev => ({ ...prev, title: searchTitle, location: searchLocation }));
    };

    // রেডিও বাটনগুলোর state প্যারেন্ট থেকে আসা `filters` অবজেক্টের উপর ভিত্তি করে নির্ধারিত হবে
    const selectedCategory = filters.category || 'all';
    const selectedCertification = filters.certification || 'all';


   
    return (
         <div className="filter-panel" id="filterPanel">
            <div className="top-filter mb-4">
                <div className="row g-3 d-flex align-items-center">
                    <div className="col-md-12"><div className="top-filter-item style-2"><div className="icon"><i className="ri-briefcase-line"></i></div><input type="text" placeholder="Business name" className="form-control" value={searchTitle} onChange={e => setSearchTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTextSearch()} /></div></div>
                    <div className="col-md-12"><div className="top-filter-item style-2"><div className="icon"><i className="ri-map-pin-line"></i></div><input type="text" placeholder="State/City/Zip" className="form-control" value={searchLocation} onChange={e => setSearchLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTextSearch()} /></div></div>
                    <div className="col-md-12 w-100"><button type="button" className="i-btn btn--lg btn--dark w-100" onClick={handleTextSearch}><i className="ri-search-line me-2"></i> Search</button></div>
                </div>
            </div>

            <div className="d-flex flex-row justify-content-between align-items-center mb-3"><h2 className="mb-0">Filters</h2></div>
            
            <div className="accordion mb-4" id="filterAccordion">
                <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header">
                        <button className="accordion-button fw-semibold px-0 bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapseStatus">
                            <span>Business status</span><span><i className="ri-arrow-down-s-line"></i></span>
                        </button>
                    </h2>
                    <div id="collapseStatus" className="accordion-collapse collapse show">
                        <div className="accordion-body px-0 pt-2 pb-0">
                            <ul className="list-unstyled mb-0">
                                {businessStatuses.map(status => {
                                    const countData = filterCounts?.status?.find(s => s.name === status.value);
                                    return (
                                        <FilterListItem 
                                            key={status.value}
                                            name="business-status"
                                            value={status.value}
                                            label={status.label}
                                            count={countData?.count || 0}
                                            selectedValue={selectedStatus}
                                            onChange={(value) => onFilterChange(prev => ({...prev, status: value === 'all' ? '' : value}))}
                                        />
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Category */}
                <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header"><button className="accordion-button fw-semibold px-0 bg-transparent shadow-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCategory"><span>Category</span><span><i className="ri-arrow-down-s-line"></i></span></button></h2>
                    <div id="collapseCategory" className="accordion-collapse collapse"><div className="accordion-body px-0 pt-2 pb-0"><ul className="list-unstyled mb-0">
                        {businessCategories.map(cat => {
                            const countData = filterCounts?.category?.find(c => c.name === cat.slug);
                            return <FilterListItem key={cat.slug} name="category" value={cat.slug} label={cat.name} count={countData?.count || 0} selectedValue={selectedCategory} onChange={(value) => onFilterChange(prev => ({...prev, category: value === 'all' ? '' : value}))} />
                        })}
                    </ul></div></div>
                </div>

                {/* Certifications */}
                <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header"><button className="accordion-button fw-semibold px-0 bg-transparent shadow-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCerts"><span>Certifications</span><span><i className="ri-arrow-down-s-line"></i></span></button></h2>
                    <div id="collapseCerts" className="accordion-collapse collapse"><div className="accordion-body px-0 pt-2 pb-0"><ul className="list-unstyled mb-0">
                        {filterCounts?.certifications?.map(cert => (
                            <FilterListItem key={cert.name} name="certification" value={cert.name} label={cert.name} count={cert.count} selectedValue={selectedCertification} onChange={(value) => onFilterChange(prev => ({...prev, certification: value === 'all' ? '' : value}))} />
                        ))}
                    </ul></div></div>
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;