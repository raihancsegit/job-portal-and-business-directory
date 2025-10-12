// src/pages/dashboard/CreateOpportunityPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Stepper Component
const Stepper = ({ currentStep }) => (
    <div className="stepper">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}><div className="circle">01</div><h6>Basic Information</h6><div className="line"></div></div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}><div className="circle">02</div><h6>Skill & Experience</h6><div className="line"></div></div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}><div className="circle">03</div><h6>Publish Opportunity</h6></div>
    </div>
);

// Main Component
const CreateOpportunityPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        jobTitle: '', industry: '', jobType: '', workplace: '', location: '',
        salaryCurrency: 'USD', salaryAmount: '', salaryType: 'Hourly',
        jobDetails: '', responsibilities: '', qualifications: '',
        skills: '', experience: 'fresh', educationLevel: '',
        vacancyStatus: 'Open', publishDate: '', endDate: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { api_base_url } = window.jpbd_object;
    const token = localStorage.getItem('authToken');

    const handleChange = e => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const nextStep = () => setCurrentStep(prev => (prev < 3 ? prev + 1 : prev));
    const prevStep = () => setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));

    const handleSubmit = async e => {
        e.preventDefault(); setLoading(true);
        try {
            await axios.post(`${api_base_url}opportunities`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Opportunity posted successfully!');
            navigate('/dashboard/opportunities'); 
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to post opportunity.');
        } finally { setLoading(false); }
    };

    return (
        <div className="i-card-md radius-30">
            <div className="card-body">
                <div className="multiFormContainer py-5">
                    <Stepper currentStep={currentStep} />
                    <form id="multiStepForm" onSubmit={handleSubmit}>
                        {/* Step 1: Basic Information */}
                        <div className={`form-section ${currentStep === 1 ? 'active' : ''}`}>
                            <h4 className="mb-35">Basic Information</h4>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="jobTitle" className="form-label">Job Title</label></div><div className="col-lg-9 col-12"><input type="text" id="jobTitle" className="form-control" placeholder="Enter job title" value={formData.jobTitle} onChange={handleChange} /></div></div>
                           {/* ================== Industry Dropdown ================== */}
                             <div className="row align-items-start mb-3">
                                <div className="col-lg-3 d-lg-block d-none">
                                    <label htmlFor="industry" className="form-label">Industry</label>
                                </div>
                                <div className="col-lg-9 col-12">
                                    <select id="industry" className="form-select bg-transparent" value={formData.industry} onChange={handleChange}>
                                        <option value="">Select industry</option>
                                        <option value="accounting">Accounting</option>
                                        <option value="automotive">Automotive</option>
                                        <option value="construction">Construction</option>
                                        <option value="education">Education</option>
                                        <option value="healthcare">Healthcare</option>
                                        <option value="restaurant">Restaurant</option>
                                        <option value="sales-marketing">Sales & Marketing</option>
                                        <option value="development">Development</option>
                                        <option value="design">Design</option>
                                        <option value="telecom">Telecommunications</option>
                                        <option value="it">Information Technology (IT)</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* ================== Job Type Dropdown (Final Version) ================== */}
                            <div className="row align-items-start mb-3">
                                <div className="col-lg-3 d-lg-block d-none">
                                    <label htmlFor="jobType" className="form-label">Job Type</label>
                                </div>
                                <div className="col-lg-9 col-12">
                                    <select id="jobType" className="form-select bg-transparent" value={formData.jobType} onChange={handleChange}>
                                        <option value="">Select job type</option>
                                        <option value="Full Time">Full Time</option>
                                        <option value="Part Time">Part Time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Temporary">Temporary</option>
                                    </select>
                                </div>
                            </div>

                            {/* ================== Workplace Dropdown (Final Version) ================== */}
                            <div className="row align-items-start mb-3">
                                <div className="col-lg-3 d-lg-block d-none">
                                    <label htmlFor="workplace" className="form-label">Workplace</label>
                                </div>
                                <div className="col-lg-9 col-12">
                                    <select id="workplace" className="form-select bg-transparent" value={formData.workplace} onChange={handleChange}>
                                        <option value="">Select workplace type</option>
                                        <option value="On-site">On-site</option>
                                        <option value="Hybrid">Hybrid</option>
                                        <option value="Remote">Remote</option>
                                    </select>
                                </div>
                            </div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="location" className="form-label">Location</label></div><div className="col-lg-9 col-12"><input type="text" id="location" className="form-control" placeholder="Enter location" value={formData.location} onChange={handleChange} /></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label className="form-label">Salary</label></div><div className="col-lg-9 col-12"><div className="d-flex flex-row gap-0"><div className="small-select"><select id="salaryCurrency" className="form-select bg-transparent rounded-end-0" value={formData.salaryCurrency} onChange={handleChange}><option>USD</option></select></div><div className="w-100 grow-1"><input type="text" id="salaryAmount" className="form-control rounded-0" placeholder="Salary" value={formData.salaryAmount} onChange={handleChange} /></div><div className="small-select"><select id="salaryType" className="form-select bg-transparent rounded-start-0" value={formData.salaryType} onChange={handleChange}><option>Hourly</option></select></div></div></div></div>
                            
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="jobDetails">Job Details</label></div><div className="col-lg-9 col-12"><textarea id="jobDetails" className="form-control" rows="5" placeholder="Enter Job Details" value={formData.jobDetails} onChange={handleChange}></textarea></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="responsibilities">Responsibilities</label></div><div className="col-lg-9 col-12"><textarea id="responsibilities" className="form-control" rows="5" placeholder="Enter each responsibility on a new line, starting with a hyphen (-) or asterisk (*)." value={formData.responsibilities} onChange={handleChange}></textarea></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="qualifications">Qualifications</label></div><div className="col-lg-9 col-12"><textarea id="qualifications" className="form-control" rows="5" placeholder="Enter each qualification on a new line, starting with a hyphen (-) or asterisk (*)." value={formData.qualifications} onChange={handleChange}></textarea></div></div>
                            
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="i-btn btn--lg btn--primary" onClick={nextStep}>Next</button>
                            </div>
                        </div>

                        {/* Step 2 & 3 */}
                        <div className={`form-section ${currentStep === 2 ? 'active' : ''}`}>
                             <h4 className="mb-35">Skill & Experience</h4>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="skills">Skill Needed</label></div><div className="col-lg-9 col-12"><input type="text" id="skills" className="form-control" placeholder="Enter Skill (Comma separated)" value={formData.skills} onChange={handleChange} /></div></div>
                             <div className="row align-items-start mb-3">
                                <div className="col-lg-3 d-lg-block d-none">
                                    <label htmlFor="experience" className="form-label">Job Experience</label>
                                </div>
                                <div className="col-lg-9 col-12">
                                    <select id="experience" className="form-select bg-transparent" value={formData.experience} onChange={handleChange}>
                                        <option value="">Select Experience Level</option>
                                        <option value="fresh">Fresh (No experience required)</option>
                                        <option value="less-than-1">Less Than 1 Year</option>
                                        <option value="2-years">2 Years</option>
                                        <option value="3-years">3 Years</option>
                                        <option value="4-years">4 Years</option>
                                        <option value="5-years">5 Years</option>
                                        <option value="5-years+">5+ Years</option>
                                    </select>
                                </div>
                            </div>

                            {/* ================== Education Level Dropdown (Final Version) ================== */}
                            <div className="row align-items-start mb-3">
                                <div className="col-lg-3 d-lg-block d-none">
                                    <label htmlFor="educationLevel" className="form-label">Education Level</label>
                                </div>
                                <div className="col-lg-9 col-12">
                                    <select id="educationLevel" className="form-select bg-transparent" value={formData.educationLevel} onChange={handleChange}>
                                        <option value="">Select Education Level</option>
                                        <option value="High School">High School</option>
                                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                                        <option value="Master's Degree">Master's Degree</option>
                                        <option value="PhD">PhD</option>
                                      
                                    </select>
                                </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2"><button type="button" className="i-btn btn--lg btn--outline" onClick={prevStep}>Back</button><button type="button" className="i-btn btn--lg btn--primary" onClick={nextStep}>Next</button></div>
                        </div>
                        <div className={`form-section ${currentStep === 3 ? 'active' : ''}`}>
                             <h4 className="mb-35">Publish Opportunity</h4>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="vacancyStatus">Vacancy Status</label></div><div className="col-lg-9 col-12"><select id="vacancyStatus" className="form-select bg-transparent" value={formData.vacancyStatus} onChange={handleChange}><option value="">Select Status</option><option>Open</option></select></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="publishDate">Publish Date</label></div><div className="col-lg-9 col-12"><input type="date" id="publishDate" className="form-control" value={formData.publishDate} onChange={handleChange} /></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="endDate">End Date</label></div><div className="col-lg-9 col-12"><input type="date" id="endDate" className="form-control" value={formData.endDate} onChange={handleChange} /></div></div>
                            <div className="d-flex justify-content-end gap-2"><button type="button" className="i-btn btn--lg btn--outline" onClick={prevStep}>Back</button><button type="submit" className="i-btn btn--lg btn--primary" disabled={loading}>{loading ? 'Publishing...' : 'Publish'}</button></div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default CreateOpportunityPage;