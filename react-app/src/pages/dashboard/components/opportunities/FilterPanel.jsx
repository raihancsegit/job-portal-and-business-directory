import React from 'react';
import { Link } from 'react-router-dom';

const FilterPanel = () => {
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
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="date-posted" value="all" defaultChecked className="form-check-input me-2" />All</label><span className="item-count">512</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="date-posted" value="last-hour" className="form-check-input me-2" />Last hour</label><span className="item-count">34</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="date-posted" value="last-24-hours" className="form-check-input me-2" />Last 24 hours</label><span className="item-count">23</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="date-posted" value="last-week" className="form-check-input me-2" />Last week</label><span className="item-count">12</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="date-posted" value="last-2-weeks" className="form-check-input me-2" />Last 2 weeks</label><span className="item-count">31</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="date-posted" value="last-month" className="form-check-input me-2" />Last month</label><span className="item-count">234</span></li>
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
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="job-type" value="full-time" defaultChecked className="form-check-input me-2" />Full-time</label><span className="item-count">124</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="job-type" value="part-time" className="form-check-input me-2" />Part-time</label><span className="item-count">45</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="job-type" value="contract" className="form-check-input me-2" />Contract</label><span className="item-count">06</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="job-type" value="freelance" className="form-check-input me-2" />Freelance</label><span className="item-count">21</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="job-type" value="intern" className="form-check-input me-2" />Intern</label><span className="item-count">14</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="job-type" value="temporary" className="form-check-input me-2" />Temporary</label><span className="item-count">0</span></li>
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
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="workplace" value="on-site" defaultChecked className="form-check-input me-2" />On-site</label><span className="item-count">232</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="workplace" value="hybrid" className="form-check-input me-2" />Hybrid</label><span className="item-count">42</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="workplace" value="remote" className="form-check-input me-2" />Remote</label><span className="item-count">23</span></li>
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
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="industry" value="all" defaultChecked className="form-check-input me-2" />All</label><span className="item-count">114</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="industry" value="accounting" className="form-check-input me-2" />Accounting/Finance</label><span className="item-count">18</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="industry" value="automotive" className="form-check-input me-2" />Automotive</label><span className="item-count">12</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="industry" value="construction" className="form-check-input me-2" />Construction</label><span className="item-count">14</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="industry" value="education" className="form-check-input me-2" />Education</label><span className="item-count">25</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="industry" value="healthcare" className="form-check-input me-2" />Healthcare</label><span className="item-count">08</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="industry" value="restaurant" className="form-check-input me-2" />Restaurant/Food</label><span className="item-count">12</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="industry" value="sales-marketing" className="form-check-input me-2" />Sales & Marketing</label><span className="item-count">09</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="industry" value="development" className="form-check-input me-2" />Development</label><span className="item-count">14</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="industry" value="telecom" className="form-check-input me-2" />Telecommunications</label><span className="item-count">02</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Salary Range */}
                <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header" id="headingSalary"><button className="accordion-button fw-semibold px-0 bg-transparent shadow-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSalary" aria-expanded="false"><span>Salary Range</span><span><i className="ri-arrow-down-s-line"></i></span></button></h2>
                    <div id="collapseSalary" className="accordion-collapse collapse" data-bs-parent="#filterAccordion">
                        <div className="accordion-body px-0 pt-2 pb-0">
                            <div className="histogram-container"><canvas id="priceHistogram"></canvas></div>
                            <div className="slider-container"><div id="priceSlider"></div></div>
                            <div className="input-container"><input type="number" id="minPriceInput" min="100" max="500" defaultValue="100" /><input type="number" id="maxPriceInput" min="100" max="500" defaultValue="500" /></div>
                        </div>
                    </div>
                </div>

                {/* Experience */}
                <div className="accordion-item border-0 mb-40">
                    <h2 className="accordion-header" id="headingExperience"><button className="accordion-button fw-semibold px-0 bg-transparent shadow-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExperience" aria-expanded="false"><span>Experience</span><span><i className="ri-arrow-down-s-line"></i></span></button></h2>
                    <div id="collapseExperience" className="accordion-collapse collapse" data-bs-parent="#filterAccordion">
                        <div className="accordion-body px-0 pt-2 pb-0">
                            <ul className="list-unstyled mb-0">
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="experience" value="fresh" defaultChecked className="form-check-input me-2" />Fresh</label><span className="item-count">114</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="experience" value="less-than-1" className="form-check-input me-2" />Less than 1 year</label><span className="item-count">18</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="experience" value="2-years" className="form-check-input me-2" />2 years</label><span className="item-count">12</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="experience" value="3-years" className="form-check-input me-2" />3 years</label><span className="item-count">14</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="experience" value="4-years" className="form-check-input me-2" />4 years</label><span className="item-count">25</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="experience" value="5-years" className="form-check-input me-2" />5 years</label><span className="item-count">08</span></li>
                                <li className="d-flex align-items-center justify-content-between cursor-pointer mb-2"><label className="d-flex align-items-center text-secondary small"><input type="radio" name="experience" value="5-years+" className="form-check-input me-2" />5 years+</label><span className="item-count">12</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;