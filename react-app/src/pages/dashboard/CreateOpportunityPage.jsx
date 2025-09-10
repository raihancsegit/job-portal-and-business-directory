import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Stepper Component - No changes needed
const Stepper = ({ currentStep }) => (
    <div className="stepper">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="circle">01</div>
            <h6>Basic Information</h6>
            <div className="line"></div>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="circle">02</div>
            <h6>Skill & Experience</h6>
            <div className="line"></div>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="circle">03</div>
            <h6>Publish Opportunity</h6>
        </div>
    </div>
);

// Main Component - This is the complete and corrected version
const CreateOpportunityPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        jobTitle: '',
        industry: '',
        jobType: '',
        workplace: '',
        location: '',
        salaryCurrency: 'USD',
        salaryAmount: '',
        salaryType: 'Hourly',
        jobDetails: '',
        responsibilities: '',
        qualifications: '',
        skills: '',
        experience: 'No experience required',
        educationLevel: '',
        vacancyStatus: '',
        publishDate: '',
        endDate: '',
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
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${api_base_url}opportunities`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Opportunity posted successfully!');
            navigate('/dashboard'); 
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to post opportunity.');
        } finally {
            setLoading(false);
        }
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
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="industry" className="form-label">Industry</label></div><div className="col-lg-9 col-12"><select id="industry" className="form-select bg-transparent" value={formData.industry} onChange={handleChange}>
                                <option value="">Select industry</option>
                                <option value="accounting">Accounting</option>
                                <option value="automotive">Automotive</option>
                                <option value="construction">Construction</option>
                                <option value="education">Education</option>
                                <option value="healthcare">Healthcare</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="sales-marketing">Sales Marketing</option>
                                <option value="development">Development</option>
                                <option value="design">Design</option>
                                <option value="telecom">Telecommunications</option>
                                <option value="IT">IT</option>
                                </select></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="jobType" className="form-label">Job Type</label></div><div className="col-lg-9 col-12"><select id="jobType" className="form-select bg-transparent" value={formData.jobType} onChange={handleChange}>
                                <option value="">Select type</option>
                                <option value="Full Time">Full Time</option>
                                <option value="Part Time">Part Time</option>
                                <option value="Contract">Contract</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Intern">Intern</option>
                                <option value="Temporary">Temporary</option>
                                </select></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="workplace" className="form-label">Workplace</label></div><div className="col-lg-9 col-12"><select id="workplace" className="form-select bg-transparent" value={formData.workplace} onChange={handleChange}><option value="">Select Workplace</option>
                            <option value="On-site">On-site</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Remote">Remote</option>
                            </select></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="location" className="form-label">Location</label></div><div className="col-lg-9 col-12"><input type="text" id="location" className="form-control" placeholder="Enter location" value={formData.location} onChange={handleChange} /></div></div>
                            <div className="row align-items-start mb-3">
                                <div className="col-lg-3 d-lg-block d-none"><label className="form-label">Salary</label></div>
                                <div className="col-lg-9 col-12">
                                    <div className="d-flex flex-row gap-0">
                                        <div className="small-select"><select id="salaryCurrency" className="form-select bg-transparent rounded-end-0" value={formData.salaryCurrency} onChange={handleChange}><option>USD</option><option>BDT</option></select></div>
                                        <div className="w-100 grow-1"><input type="text" id="salaryAmount" className="form-control rounded-0" placeholder="Salary" value={formData.salaryAmount} onChange={handleChange} /></div>
                                        <div className="small-select"><select id="salaryType" className="form-select bg-transparent rounded-start-0" value={formData.salaryType} onChange={handleChange}><option>Hourly</option><option>Monthly</option></select></div>
                                    </div>
                                </div>
                            </div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="jobDetails" className="form-label">Job Details</label></div><div className="col-lg-9 col-12"><textarea id="jobDetails" className="form-control" rows="3" placeholder="Enter Job Details" value={formData.jobDetails} onChange={handleChange}></textarea></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="responsibilities" className="form-label">Responsibilities</label></div><div className="col-lg-9 col-12"><textarea id="responsibilities" className="form-control" rows="3" placeholder="Enter Job Responsibilities" value={formData.responsibilities} onChange={handleChange}></textarea></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="qualifications" className="form-label">Qualifications</label></div><div className="col-lg-9 col-12"><textarea id="qualifications" className="form-control" rows="3" placeholder="Enter Qualifications" value={formData.qualifications} onChange={handleChange}></textarea></div></div>
                            
                            {/* === NEXT BUTTON FOR STEP 1 === */}
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="i-btn btn--lg btn--primary" onClick={nextStep}>Next</button>
                            </div>
                        </div>

                        {/* Step 2: Skill & Experience */}
                        <div className={`form-section ${currentStep === 2 ? 'active' : ''}`}>
                            <h4 className="mb-35">Skill & Experience</h4>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="skills" className="form-label">Skill Needed</label></div><div className="col-lg-9 col-12"><input type="text" id="skills" className="form-control" placeholder="Enter Skill (Comma separated)" value={formData.skills} onChange={handleChange} /></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="experience" className="form-label">Job Experience</label></div><div className="col-lg-9 col-12"><select id="experience" className="form-select bg-transparent" value={formData.experience} onChange={handleChange}>
                                <option value="fresh">Fresh</option>
                                <option value="less-than-1">Less Than 1</option>
                                <option value="2-years">2 Years</option>
                                <option value="3-years">3 Years</option>
                                <option value="4-years">4 Years</option>
                                <option value="5-years">5 Years</option>
                                <option value="5-years+">5 Years+</option>
                                </select>
                                </div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="educationLevel" className="form-label">Education Level</label></div><div className="col-lg-9 col-12"><select id="educationLevel" className="form-select bg-transparent" value={formData.educationLevel} onChange={handleChange}>
                                <option value="">Select Education Level</option>
                                <option>High School</option>
                                <option>Bachelor's</option>
                                </select></div></div>
                            
                            {/* === NAVIGATION BUTTONS FOR STEP 2 === */}
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="i-btn btn--lg btn--outline" onClick={prevStep}>Back</button>
                                <button type="button" className="i-btn btn--lg btn--primary" onClick={nextStep}>Next</button>
                            </div>
                        </div>

                        {/* Step 3: Publish Opportunity */}
                        <div className={`form-section ${currentStep === 3 ? 'active' : ''}`}>
                            <h4 className="mb-35">Publish Opportunity</h4>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="vacancyStatus" className="form-label">Vacancy Status</label></div><div className="col-lg-9 col-12"><select id="vacancyStatus" className="form-select bg-transparent" value={formData.vacancyStatus} onChange={handleChange}><option value="">Select Status</option><option>Open</option><option>Closed</option></select></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="publishDate" className="form-label">Publish Date</label></div><div className="col-lg-9 col-12"><input type="date" id="publishDate" className="form-control" value={formData.publishDate} onChange={handleChange} /></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="endDate" className="form-label">End Date</label></div><div className="col-lg-9 col-12"><input type="date" id="endDate" className="form-control" value={formData.endDate} onChange={handleChange} /></div></div>
                            
                            {/* === NAVIGATION BUTTONS FOR STEP 3 === */}
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" className="i-btn btn--lg btn--outline" onClick={prevStep}>Back</button>
                                <button type="submit" className="i-btn btn--lg btn--primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateOpportunityPage;