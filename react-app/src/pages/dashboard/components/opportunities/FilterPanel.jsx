import React, { useEffect, useRef,useState,memo   } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
const FilterPanel = ({ filters, setFilters }) => {
    // Refs for salary slider and histogram canvas
    const priceHistogramCanvasRef = useRef(null);
    const priceSliderRef = useRef(null);
    const minPriceInputRef = useRef(null);
    const maxPriceInputRef = useRef(null);

    const [counts, setCounts] = useState(null);
    const { api_base_url } = window.jpbd_object;

      useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await axios.get(`${api_base_url}opportunities/filters/counts`);
                setCounts(response.data);
            } catch (error) {
                console.error("Failed to fetch filter counts", error);
            }
        };
        fetchCounts();
    }, [api_base_url]);

    const getCount = (category, name) => {
        if (!counts || !counts[category]) return 0;

        if (category === 'datePosted') {
            return counts.datePosted[name] || 0;
        }

        const item = counts[category].find(c => c.name === name);
        return item ? item.count : 0;
    };

    const handleRadioChange = (e) => {
        const { name, value } = e.target;
        if (filters[name] === value) {
            // ঠিক করা হয়েছে: শুধু নির্দিষ্ট ফিল্টার কী-টি খালি করা হচ্ছে
            setFilters(prev => ({ ...prev, [name]: '' }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };
    
    
    useEffect(() => {
        const priceSlider = priceSliderRef.current;
        const minPriceInput = minPriceInputRef.current;
        const maxPriceInput = maxPriceInputRef.current;

        // noUiSlider লোড হয়েছে কিনা এবং ref গুলো আছে কিনা তা চেক করা
        if (!priceSlider || typeof noUiSlider === 'undefined') {
            return;
        }

        // যদি আগে থেকে স্লাইডার তৈরি করা থাকে, তাহলে সেটি destroy করা
        if (priceSlider.noUiSlider) {
            priceSlider.noUiSlider.destroy();
        }
        
        // নতুন স্লাইডার তৈরি করা
        noUiSlider.create(priceSlider, {
            start: [filters.minSalary || 1000, filters.maxSalary || 5000], // state থেকে প্রাথমিক মান নেওয়া
            connect: true,
            range: { 'min': 0, 'max': 10000 }, // আপনার প্রয়োজন অনুযায়ী রেঞ্জ পরিবর্তন করুন
            step: 100,
            format: {
                to: value => Math.round(value),
                from: value => Number(value)
            }
        });

        // স্লাইডার পরিবর্তনের সময় state আপডেট করা
        priceSlider.noUiSlider.on('update', (values, handle) => {
            const [min, max] = values;
            minPriceInput.value = min;
            maxPriceInput.value = max;
        });

        // স্লাইডার মুভ করা শেষ হলে প্যারেন্ট কম্পোনেন্টের filters state আপডেট করা
        priceSlider.noUiSlider.on('change', (values, handle) => {
            setFilters(prev => ({
                ...prev,
                minSalary: values[0],
                maxSalary: values[1]
            }));
        });
        
        // ইনপুট ফিল্ড থেকে পরিবর্তনের জন্য হ্যান্ডলার
        const minChangeHandler = () => priceSlider.noUiSlider.set([minPriceInput.value, null]);
        const maxChangeHandler = () => priceSlider.noUiSlider.set([null, maxPriceInput.value]);

        minPriceInput.addEventListener('change', minChangeHandler);
        maxPriceInput.addEventListener('change', maxChangeHandler);

        // ক্লিন-আপ ফাংশন
        return () => {
            if (priceSlider.noUiSlider) {
                priceSlider.noUiSlider.destroy();
            }
            minPriceInput.removeEventListener('change', minChangeHandler);
            maxPriceInput.removeEventListener('change', maxChangeHandler);
        };
    }, []); // খালি dependency array, শুধুমাত্র একবার রান হবে
    

    return (
        <div className="filter-panel" id="filterPanel">
            <div className="d-flex flex-row justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Filters</h2>
                <Link to="/dashboard/opportunities-list" className="i-btn btn--lg btn--soft"><i className="ri-list-check me-2"></i> List View</Link>
            </div>
            <div className="accordion mb-4" id="filterAccordion">
               {/* Date Posted */}
                <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header" id="headingDatePosted">
                        <button className="accordion-button fw-semibold px-0 bg-transparent shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDatePosted" aria-expanded="true">
                            <span>Date posted</span><span><i className="ri-arrow-down-s-line"></i></span>
                        </button>
                    </h2>
                    <div id="collapseDatePosted" className="accordion-collapse collapse show" data-bs-parent="#filterAccordion">
                        <div className="accordion-body px-0 pt-2 pb-0">
                            <ul className="list-unstyled mb-0">
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="datePosted" value="all" checked={filters.datePosted === 'all'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        All
                                    </label>
                                    {/* The optional chaining operator (?.) prevents errors if counts is null */}
                                    <span className="item-count">{counts?.datePosted?.all || 0}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="datePosted" value="last-hour" checked={filters.datePosted === 'last-hour'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Last hour
                                    </label>
                                    <span className="item-count">{counts?.datePosted?.['last-hour'] || 0}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="datePosted" value="last-24-hours" checked={filters.datePosted === 'last-24-hours'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Last 24 hours
                                    </label>
                                    <span className="item-count">{counts?.datePosted?.['last-24-hours'] || 0}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="datePosted" value="last-week" checked={filters.datePosted === 'last-week'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Last week
                                    </label>
                                    <span className="item-count">{counts?.datePosted?.['last-week'] || 0}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="datePosted" value="last-2-weeks" checked={filters.datePosted === 'last-2-weeks'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Last 2 weeks
                                    </label>
                                    <span className="item-count">{counts?.datePosted?.['last-2-weeks'] || 0}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="datePosted" value="last-month" checked={filters.datePosted === 'last-month'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Last month
                                    </label>
                                    <span className="item-count">{counts?.datePosted?.['last-month'] || 0}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
              
                {/* Job Type */}
                <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header" id="headingJobType">
                        <button className="accordion-button fw-semibold px-0 bg-transparent shadow-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseJobType" aria-expanded="false">
                            <span>Job type</span><span><i className="ri-arrow-down-s-line"></i></span>
                        </button>
                    </h2>
                    <div id="collapseJobType" className="accordion-collapse collapse" data-bs-parent="#filterAccordion">
                        <div className="accordion-body px-0 pt-2 pb-0">
                            <ul className="list-unstyled mb-0">
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="jobType" value="Full Time" checked={filters.jobType === 'Full Time'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Full-time
                                    </label>
                                    <span className="item-count">{getCount('jobType', 'Full Time')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="jobType" value="Part Time" checked={filters.jobType === 'Part Time'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Part-time
                                    </label>
                                    <span className="item-count">{getCount('jobType', 'Part Time')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="jobType" value="Contract" checked={filters.jobType === 'Contract'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Contract
                                    </label>
                                    <span className="item-count">{getCount('jobType', 'Contract')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="jobType" value="Freelance" checked={filters.jobType === 'Freelance'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Freelance
                                    </label>
                                    <span className="item-count">{getCount('jobType', 'Freelance')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="jobType" value="Intern" checked={filters.jobType === 'Intern'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Intern
                                    </label>
                                    <span className="item-count">{getCount('jobType', 'Intern')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="jobType" value="Temporary" checked={filters.jobType === 'Temporary'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Temporary
                                    </label>
                                    <span className="item-count">{getCount('jobType', 'Temporary')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
              
                {/* Workplace Type */}
                <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header" id="headingWorkplaceType">
                        <button className="accordion-button fw-semibold px-0 bg-transparent shadow-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWorkplaceType" aria-expanded="false">
                            <span>Workplace type</span><span><i className="ri-arrow-down-s-line"></i></span>
                        </button>
                    </h2>
                    <div id="collapseWorkplaceType" className="accordion-collapse collapse" data-bs-parent="#filterAccordion">
                        <div className="accordion-body px-0 pt-2 pb-0">
                            <ul className="list-unstyled mb-0">
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="workplace" value="On-site" checked={filters.workplace === 'On-site'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        On-site
                                    </label>
                                    <span className="item-count">{getCount('workplace', 'On-site')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="workplace" value="Hybrid" checked={filters.workplace === 'Hybrid'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Hybrid
                                    </label>
                                    <span className="item-count">{getCount('workplace', 'Hybrid')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="workplace" value="Remote" checked={filters.workplace === 'Remote'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Remote
                                    </label>
                                    <span className="item-count">{getCount('workplace', 'Remote')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Industry */}
                <div className="accordion-item border-0 mb-40">
                     <h2 className="accordion-header" id="headingIndustry"><button className="accordion-button fw-semibold px-0 bg-transparent shadow-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseIndustry" aria-expanded="false"><span>Industry</span><span><i className="ri-arrow-down-s-line"></i></span></button></h2>
                    <div id="collapseIndustry" className="accordion-collapse collapse" data-bs-parent="#filterAccordion">
                         <div className="accordion-body px-0 pt-2 pb-0">
                            <ul className="list-unstyled mb-0">
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="" checked={filters.industry === ''} onChange={handleRadioChange} className="form-check-input me-2" />
                                        All
                                    </label>
                                    {/* 'all' count is a special case, we can sum up others if needed or get from API */}
                                    <span className="item-count">{counts?.industry?.reduce((acc, item) => acc + parseInt(item.count), 0) || 0}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="accounting" checked={filters.industry === 'accounting'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Accounting/Finance
                                    </label>
                                    <span className="item-count">{getCount('industry', 'accounting')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="automotive" checked={filters.industry === 'automotive'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Automotive
                                    </label>
                                    <span className="item-count">{getCount('industry', 'automotive')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="construction" checked={filters.industry === 'construction'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Construction
                                    </label>
                                    <span className="item-count">{getCount('industry', 'construction')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="education" checked={filters.industry === 'education'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Education
                                    </label>
                                    <span className="item-count">{getCount('industry', 'education')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="healthcare" checked={filters.industry === 'healthcare'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Healthcare
                                    </label>
                                    <span className="item-count">{getCount('industry', 'healthcare')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="restaurant" checked={filters.industry === 'restaurant'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Restaurant/Food
                                    </label>
                                    <span className="item-count">{getCount('industry', 'restaurant')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="sales-marketing" checked={filters.industry === 'sales-marketing'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Sales & Marketing
                                    </label>
                                    <span className="item-count">{getCount('industry', 'sales-marketing')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="development" checked={filters.industry === 'development'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Development
                                    </label>
                                    <span className="item-count">{getCount('industry', 'development')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="telecom" checked={filters.industry === 'telecom'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Telecommunications
                                    </label>
                                    <span className="item-count">{getCount('industry', 'telecom')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="IT" checked={filters.industry === 'IT'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        IT
                                    </label>
                                    <span className="item-count">{getCount('industry', 'IT')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="design" checked={filters.industry === 'design'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Design
                                    </label>
                                    <span className="item-count">{getCount('industry', 'design')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Salary Range */}
               <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header" id="headingSalary">
                        <button className="accordion-button fw-semibold px-0 bg-transparent shadow-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSalary">
                            <span>Salary Range</span><span><i className="ri-arrow-down-s-line"></i></span>
                        </button>
                    </h2>
                    <div id="collapseSalary" className="accordion-collapse collapse" data-bs-parent="#filterAccordion">
                        {/* ================== মূল পরিবর্তন এখানে (JSX) ================== */}
                        <div className="accordion-body px-0 pt-2 pb-0">
                            {/* Histogram ক্যানভাসটি মুছে ফেলা হয়েছে */}
                            <div className="slider-container mt-4">
                                <div ref={priceSliderRef} id="priceSlider"></div>
                            </div>
                            <div className="input-container">
                                <input ref={minPriceInputRef} type="number" id="minPriceInput" />
                                <input ref={maxPriceInputRef} type="number" id="maxPriceInput" />
                            </div>
                        </div>
                        {/* ============================================================= */}
                    </div>
                </div>
                {/* Experience */}
                <div className="accordion-item border-0 mb-40">
                     <h2 className="accordion-header" id="headingExperience"><button className="accordion-button fw-semibold px-0 bg-transparent shadow-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExperience" aria-expanded="false"><span>Experience</span><span><i className="ri-arrow-down-s-line"></i></span></button></h2>
                    <div id="collapseExperience" className="accordion-collapse collapse" data-bs-parent="#filterAccordion">
                        <div className="accordion-body px-0 pt-2 pb-0">
                            <ul className="list-unstyled mb-0">
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="experience" value="fresh" checked={filters.experience === 'fresh'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Fresh
                                    </label>
                                    <span className="item-count">{getCount('experience', 'fresh')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="experience" value="less-than-1" checked={filters.experience === 'less-than-1'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Less than 1 year {/* The label can be different from the value */}
                                    </label>
                                    <span className="item-count">{getCount('experience', 'less-than-1')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="experience" value="2-years" checked={filters.experience === '2-years'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        2 years
                                    </label>
                                    <span className="item-count">{getCount('experience', '2-years')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="experience" value="3-years" checked={filters.experience === '3-years'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        3 years
                                    </label>
                                    <span className="item-count">{getCount('experience', '3-years')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="experience" value="4-years" checked={filters.experience === '4-years'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        4 years
                                    </label>
                                    <span className="item-count">{getCount('experience', '4-years')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="experience" value="5-years" checked={filters.experience === '5-years'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        5 years
                                    </label>
                                    <span className="item-count">{getCount('experience', '5-years')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="experience" value="5-years+" checked={filters.experience === '5-years+'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        5 years+
                                    </label>
                                    <span className="item-count">{getCount('experience', '5-years+')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;