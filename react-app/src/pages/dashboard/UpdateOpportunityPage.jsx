import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateOpportunityPage = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState(null); // Initial state is null while loading
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const navigate = useNavigate();
    const { api_base_url } = window.jpbd_object;
    const token = localStorage.getItem('authToken');

    // Step 1: Fetch the existing opportunity data
    useEffect(() => {
        const fetchOpportunity = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${api_base_url}opportunities/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                // The API returns snake_case, but our form uses camelCase IDs. We convert them here.
                const apiData = response.data;
                setFormData({
                    jobTitle: apiData.job_title,
                    industry: apiData.industry,
                    jobType: apiData.job_type,
                    workplace: apiData.workplace,
                    location: apiData.location,
                    salaryCurrency: apiData.salary_currency,
                    salaryAmount: apiData.salary_amount,
                    salaryType: apiData.salary_type,
                    jobDetails: apiData.job_details,
                    responsibilities: apiData.responsibilities,
                    qualifications: apiData.qualifications,
                    skills: apiData.skills,
                    experience: apiData.experience,
                    educationLevel: apiData.education_level,
                    vacancyStatus: apiData.vacancy_status,
                    publishDate: apiData.publish_date,
                    endDate: apiData.end_date,
                });
            } catch (error) {
                console.error("Failed to fetch opportunity data", error);
                alert("Could not load opportunity data.");
                navigate('/dashboard/opportunities');
            } finally {
                setLoading(false);
            }
        };
        fetchOpportunity();
    }, [id, api_base_url, token, navigate]);
    
    const handleChange = e => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    // Step 2: Handle the form submission to update the data
    const handleSubmit = async e => {
        e.preventDefault();
        setUpdating(true);
        try {
            // We send the data with camelCase keys, the PHP API needs to handle this
            await axios.post(`${api_base_url}opportunities/${id}`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Opportunity updated successfully!');
            navigate(`/dashboard/opportunities/${id}`);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update opportunity.');
        } finally {
            setUpdating(false);
        }
    };
    
    if (loading || !formData) {
        return <div className="p-4">Loading opportunity data...</div>;
    }

    return (
        <div className="i-card-md radius-30">
            <div className="card-body">
                <div className="multiFormContainer py-5">
                    <h2 className="mb-4">Update Opportunity</h2>

                    <form id="updateOpportunityForm" onSubmit={handleSubmit}>
                        <div className="form-section active">
                            <h4 className="mb-35">Basic Information</h4>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="jobTitle" className="form-label">Job Title</label></div><div className="col-lg-9 col-12"><input type="text" id="jobTitle" className="form-control" placeholder="Enter job title" value={formData.jobTitle || ''} onChange={handleChange} required /></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="industry" className="form-label">Industry</label></div><div className="col-lg-9 col-12"><select id="industry" className="form-select bg-transparent" value={formData.industry || ''} onChange={handleChange} required><option value="">Select industry</option><option value="IT">IT</option><option value="Design">Design</option></select></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="jobType" className="form-label">Job Type</label></div><div className="col-lg-9 col-12"><select id="jobType" className="form-select bg-transparent" value={formData.jobType || ''} onChange={handleChange} required><option value="">Select type</option><option value="Full Time">Full Time</option><option value="Part Time">Part Time</option></select></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="workplace" className="form-label">Workplace</label></div><div className="col-lg-9 col-12"><select id="workplace" className="form-select bg-transparent" value={formData.workplace || ''} onChange={handleChange} required><option value="">Select Workplace</option><option value="Remote">Remote</option><option value="On-site">On-site</option><option value="Hybrid">Hybrid</option></select></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="location" className="form-label">Location</label></div><div className="col-lg-9 col-12"><input type="text" id="location" className="form-control" placeholder="e.g., Dhaka, Bangladesh" value={formData.location || ''} onChange={handleChange} required /></div></div>
                            <div className="row align-items-start mb-3">
                                <div className="col-lg-3 d-lg-block d-none"><label className="form-label">Salary</label></div>
                                <div className="col-lg-9 col-12">
                                    <div className="d-flex flex-row gap-0">
                                        <div className="small-select"><select id="salaryCurrency" className="form-select bg-transparent rounded-end-0" value={formData.salaryCurrency || 'USD'} onChange={handleChange}><option>USD</option><option>BDT</option><option>EUR</option></select></div>
                                        <div className="w-100 grow-1"><input type="text" id="salaryAmount" className="form-control rounded-0" placeholder="Salary" value={formData.salaryAmount || ''} onChange={handleChange} /></div>
                                        <div className="small-select"><select id="salaryType" className="form-select bg-transparent rounded-start-0" value={formData.salaryType || 'Hourly'} onChange={handleChange}><option>Hourly</option><option>Monthly</option><option>Yearly</option></select></div>
                                    </div>
                                </div>
                            </div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="jobDetails" className="form-label">Job Details</label></div><div className="col-lg-9 col-12"><textarea id="jobDetails" className="form-control" rows="3" placeholder="Enter Job Details" value={formData.jobDetails || ''} onChange={handleChange} required></textarea></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="responsibilities" className="form-label">Responsibilities</label></div><div className="col-lg-9 col-12"><textarea id="responsibilities" className="form-control" rows="3" placeholder="Enter Job Responsibilities" value={formData.responsibilities || ''} onChange={handleChange}></textarea></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="qualifications" className="form-label">Qualifications</label></div><div className="col-lg-9 col-12"><textarea id="qualifications" className="form-control" rows="3" placeholder="Enter Qualifications" value={formData.qualifications || ''} onChange={handleChange}></textarea></div></div>
                            
                            <h4 className="mb-35 mt-5">Skill & Experience</h4>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="skills" className="form-label">Skill Needed</label></div><div className="col-lg-9 col-12"><input type="text" id="skills" className="form-control" placeholder="Enter skills, comma separated" value={formData.skills || ''} onChange={handleChange} /></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="experience" className="form-label">Job Experience</label></div><div className="col-lg-9 col-12"><select id="experience" className="form-select bg-transparent" value={formData.experience || ''} onChange={handleChange}><option value="">Select Experience Level</option><option value="No experience required">No experience required</option><option value="1-2 years">1-2 years</option><option value="3-5 years">3-5 years</option><option value="5+ years">5+ years</option></select></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="educationLevel" className="form-label">Education Level</label></div><div className="col-lg-9 col-12"><select id="educationLevel" className="form-select bg-transparent" value={formData.educationLevel || ''} onChange={handleChange}><option value="">Select Education Level</option><option value="High School">High School</option><option value="Bachelor's Degree">Bachelor's Degree</option><option value="Master's Degree">Master's Degree</option><option value="PhD">PhD</option></select></div></div>

                            <h4 className="mb-35 mt-5">Publish Opportunity</h4>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="vacancyStatus" className="form-label">Vacancy Status</label></div><div className="col-lg-9 col-12"><select id="vacancyStatus" className="form-select bg-transparent" value={formData.vacancyStatus || ''} onChange={handleChange} required><option value="">Select Status</option><option value="Open">Open</option><option value="Closed">Closed</option></select></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="publishDate" className="form-label">Publish Date</label></div><div className="col-lg-9 col-12"><input type="date" id="publishDate" className="form-control" value={formData.publishDate || ''} onChange={handleChange} /></div></div>
                            <div className="row align-items-start mb-3"><div className="col-lg-3 d-lg-block d-none"><label htmlFor="endDate" className="form-label">End Date</label></div><div className="col-lg-9 col-12"><input type="date" id="endDate" className="form-control" value={formData.endDate || ''} onChange={handleChange} /></div></div>
                            
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button type="button" className="i-btn btn--lg btn--outline" onClick={() => navigate(-1)}>Cancel</button>
                                <button type="submit" className="i-btn btn--lg btn--primary" disabled={updating}>{updating ? 'Updating...' : 'Update Opportunity'}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateOpportunityPage;