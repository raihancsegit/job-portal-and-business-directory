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
        const priceHistogramCanvas = priceHistogramCanvasRef.current;
        const priceSlider = priceSliderRef.current;
        const minPriceInput = minPriceInputRef.current;
        const maxPriceInput = maxPriceInputRef.current;

        if (!priceSlider || typeof noUiSlider === 'undefined' || !priceHistogramCanvas) {
            return;
        }

        if (priceSlider.noUiSlider) {
            priceSlider.noUiSlider.destroy();
        }
        
        noUiSlider.create(priceSlider, {
            start: [100, 500],
            connect: true,
            range: { 'min': 100, 'max': 500 },
            step: 1,
        });

        const ctx = priceHistogramCanvas.getContext('2d');
        if (!ctx) return;

        // Histogram and slider logic from your original HTML file
        function generateNormalData(count, mean, stdDev, minValue, maxValue) {
            const data = [];
            for (let i = 0; i < count; i++) {
                let value;
                do {
                    const u1 = Math.random(); const u2 = Math.random();
                    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                    value = mean + z * stdDev;
                } while (value < minValue || value > maxValue);
                data.push(value);
            }
            return data;
        }

        const binCount = 42, minValue = 100, maxValue = 500;
        const binWidth = (maxValue - minValue) / binCount;
        const histogramData = Array(binCount).fill(0);
        const rawData = generateNormalData(1000, 300, 80, minValue, maxValue);
        for (let i = 0; i < rawData.length; i++) {
            const binIndex = Math.floor((rawData[i] - minValue) / binWidth);
            histogramData[Math.min(binIndex, binCount - 1)]++;
        }

        function drawAreaChart(minPrice, maxPrice) {
            ctx.clearRect(0, 0, priceHistogramCanvas.width, priceHistogramCanvas.height);
            const pointSpacing = priceHistogramCanvas.width / (binCount - 1);
            const maxY = Math.max(...histogramData);
            const minBinIndex = Math.max(0, Math.floor((minPrice - minValue) / binWidth));
            const maxBinIndex = Math.min(binCount - 1, Math.floor((maxPrice - minValue) / binWidth));

            ctx.beginPath();
            ctx.moveTo(0, priceHistogramCanvas.height);
            for (let i = 0; i < histogramData.length; i++) { ctx.lineTo(i * pointSpacing, priceHistogramCanvas.height - (histogramData[i] / maxY) * priceHistogramCanvas.height); }
            ctx.lineTo(priceHistogramCanvas.width, priceHistogramCanvas.height);
            ctx.closePath();
            const bgGradient = ctx.createLinearGradient(0, 0, 0, priceHistogramCanvas.height);
            bgGradient.addColorStop(0, 'rgba(41, 44, 45, 0.3)'); bgGradient.addColorStop(1, 'rgba(41, 44, 45, 0)');
            ctx.fillStyle = bgGradient; ctx.fill();

            ctx.beginPath();
            ctx.moveTo(minBinIndex * pointSpacing, priceHistogramCanvas.height);
            for (let i = minBinIndex; i <= maxBinIndex; i++) { ctx.lineTo(i * pointSpacing, priceHistogramCanvas.height - (histogramData[i] / maxY) * priceHistogramCanvas.height); }
            ctx.lineTo(maxBinIndex * pointSpacing, priceHistogramCanvas.height);
            ctx.closePath();
            const fgGradient = ctx.createLinearGradient(0, 0, 0, priceHistogramCanvas.height);
            fgGradient.addColorStop(0, '#86562B'); fgGradient.addColorStop(1, '#86562B');
            ctx.fillStyle = fgGradient; ctx.fill();
        }

        function updateOnSliderMove() {
            const [minPrice, maxPrice] = priceSlider.noUiSlider.get().map(Number);
            minPriceInput.value = Math.round(minPrice);
            maxPriceInput.value = Math.round(maxPrice);
            drawAreaChart(minPrice, maxPrice);
        }

        priceSlider.noUiSlider.on('update', updateOnSliderMove);
        const minChangeHandler = function () { priceSlider.noUiSlider.set([this.value, null]); };
        const maxChangeHandler = function () { priceSlider.noUiSlider.set([null, this.value]); };
        minPriceInput.addEventListener('change', minChangeHandler);
        maxPriceInput.addEventListener('change', maxChangeHandler);
        
        updateOnSliderMove();

        return () => {
            if (priceSlider.noUiSlider) { priceSlider.noUiSlider.destroy(); }
            minPriceInput.removeEventListener('change', minChangeHandler);
            maxPriceInput.removeEventListener('change', maxChangeHandler);
        };
    }, []);

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
                                        <input type="radio" name="industry" value="Accounting/Finance" checked={filters.industry === 'Accounting/Finance'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Accounting/Finance
                                    </label>
                                    <span className="item-count">{getCount('industry', 'Accounting/Finance')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="Automotive" checked={filters.industry === 'Automotive'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Automotive
                                    </label>
                                    <span className="item-count">{getCount('industry', 'Automotive')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="Construction" checked={filters.industry === 'Construction'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Construction
                                    </label>
                                    <span className="item-count">{getCount('industry', 'Construction')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="Education" checked={filters.industry === 'Education'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Education
                                    </label>
                                    <span className="item-count">{getCount('industry', 'Education')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="Healthcare" checked={filters.industry === 'Healthcare'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Healthcare
                                    </label>
                                    <span className="item-count">{getCount('industry', 'Healthcare')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="Restaurant/Food" checked={filters.industry === 'Restaurant/Food'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Restaurant/Food
                                    </label>
                                    <span className="item-count">{getCount('industry', 'Restaurant/Food')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="Sales & Marketing" checked={filters.industry === 'Sales & Marketing'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Sales & Marketing
                                    </label>
                                    <span className="item-count">{getCount('industry', 'Sales & Marketing')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="Development" checked={filters.industry === 'Development'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Development
                                    </label>
                                    <span className="item-count">{getCount('industry', 'Development')}</span>
                                </li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2">
                                    <label className="d-flex align-items-center text-secondary small">
                                        <input type="radio" name="industry" value="Telecommunications" checked={filters.industry === 'Telecommunications'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Telecommunications
                                    </label>
                                    <span className="item-count">{getCount('industry', 'Telecommunications')}</span>
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
                                        <input type="radio" name="industry" value="Design" checked={filters.industry === 'Design'} onChange={handleRadioChange} className="form-check-input me-2" />
                                        Design
                                    </label>
                                    <span className="item-count">{getCount('industry', 'Design')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Salary Range */}
                <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header" id="headingSalary"><button className="accordion-button fw-semibold px-0 bg-transparent shadow-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSalary" aria-expanded="false"><span>Salary Range</span><span><i className="ri-arrow-down-s-line"></i></span></button></h2>
                    <div id="collapseSalary" className="accordion-collapse collapse" data-bs-parent="#filterAccordion">
                        <div className="accordion-body px-0 pt-2 pb-0">
                            <div className="histogram-container"><canvas ref={priceHistogramCanvasRef} id="priceHistogram"></canvas></div>
                            <div className="slider-container"><div ref={priceSliderRef} id="priceSlider"></div></div>
                            <div className="input-container"><input ref={minPriceInputRef} type="number" id="minPriceInput" /><input ref={maxPriceInputRef} type="number" id="maxPriceInput" /></div>
                        </div>
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