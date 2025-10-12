import React from 'react';

const TopFilterBar = ({ filters, setFilters }) => {
    
    // ইনপুট ফিল্ড পরিবর্তনের জন্য হ্যান্ডলার
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };
    
    // ================== নতুন সংযোজন ==================
    // ১. সমস্ত ফিল্টার ক্লিয়ার করার জন্য নতুন হ্যান্ডলার ফাংশন
    const handleClear = () => {
        setFilters({
            searchTitle: '',
            searchLocation: '',
            experience: ''
            // ভবিষ্যতে নতুন ফিল্টার যোগ হলে এখানেও তা রিসেট করতে হবে
        });
    };
    // ===============================================

    return (
        <div className="top-filter">
            <div className="row g-3 d-flex align-items-center">
                <div className="col-md-3">
                    <div className="top-filter-item">
                        <div className="icon"><i className="ri-briefcase-line"></i></div>
                        <input 
                            type="text" 
                            name="searchTitle" 
                            placeholder="Job title" 
                            className="form-control flex-grow-1" 
                            value={filters.searchTitle || ''} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>
                <div className="col-md-3"> {/* কলামের প্রস্থ সামঞ্জস্য করা হয়েছে */}
                    <div className="top-filter-item">
                        <div className="icon"><i className="ri-map-pin-line"></i></div>
                        <input 
                            type="text" 
                            name="searchLocation" 
                            placeholder="Location" 
                            className="form-control flex-grow-1" 
                            value={filters.searchLocation || ''} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>
               <div className="col-md-3">
                    <div className="top-filter-item">
                        <div className="icon"><i className="ri-time-line"></i></div>
                        <select 
                            name="experience"
                            className="form-select border-0 bg-transparent flex-grow-1 text-secondary" 
                            value={filters.experience || ''}
                            onChange={handleChange}
                        >
                            <option value="" disabled>Experience level</option>
                            <option value="">Any Experience</option> {/* একটি "Any" অপশন যোগ করা ভালো */}
                            <option value="fresh">No experience required</option>
                            <option value="2-years">2 years</option>
                            <option value="3-years">3 years</option>
                            <option value="5-years+">5+ years</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-3 d-flex justify-content-end align-items-center gap-2"> {/* কলামের প্রস্থ এবং gap যোগ করা হয়েছে */}
                     {/* ================== নতুন সংযোজন ================== */}
                        {/* ২. নতুন "Clear All" বাটন */}
                        <button 
                            className="i-btn btn--lg btn--secondary" 
                            type="button" // ফর্ম সাবমিট হওয়া থেকে বিরত রাখতে type="button" ব্যবহার করা ভালো
                            onClick={handleClear}
                        >
                            Clear All
                        </button>
                        {/* =============================================== */}
                    
                     <button className="i-btn btn--lg btn--dark flex-grow-1">
                        <i className="ri-search-line me-2"></i>Search
                     </button>
                   
                </div>
            </div>
        </div>
    );
};

export default TopFilterBar;