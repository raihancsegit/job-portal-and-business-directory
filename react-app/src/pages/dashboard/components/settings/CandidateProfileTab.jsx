// src/components/dashboard/tabs/CandidateProfileTab.jsx (আপনার ফাইল পাথ অনুযায়ী)

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Stepper Component
const Stepper = ({ currentStep }) => (
    <div className="stepper mb-5">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="circle">01</div>
            <h6>Basic Information</h6>
            <div className="line"></div>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="circle">02</div>
            <h6>Experience & Education</h6>
            <div className="line"></div>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="circle">03</div>
            <h6>CV / Resume</h6>
        </div>
    </div>
);

// Main Component
const CandidateProfileTab = ({ showNotice, notice }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [profile, setProfile] = useState({
        about: '',
        skills: '',
        education: [{ institution: '', degree: '', startYear: '', endYear: '', description: '' }],
        experience: [{ title: '', company: '', startYear: '', endYear: '', location: '', description: '' }],
        cvs: [{ name: '', file_url: '', attachment_id: '' }],
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(null);
    const { api_base_url } = window.jpbd_object || {};
    const token = localStorage.getItem('authToken');
    
    // Fetch Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${api_base_url}candidate/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = response.data;
                const safeData = {
                    about: data.about || '',
                    skills: data.skills || '',
                    education: (Array.isArray(data.education) && data.education.length > 0) ? data.education : [{ institution: '', degree: '', startYear: '', endYear: '', description: '' }],
                    experience: (Array.isArray(data.experience) && data.experience.length > 0) ? data.experience : [{ title: '', company: '', startYear: '', endYear: '', location: '', description: '' }],
                    cvs: (Array.isArray(data.cvs) && data.cvs.length > 0) ? data.cvs : [{ name: '', file_url: '', attachment_id: '' }],
                };
                setProfile(safeData);
            } catch (error) {
                console.error("Failed to fetch candidate profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [api_base_url, token]);

    // Handlers
    const handleRepeaterChange = (e, index, section) => {
        const { name, value } = e.target;
        const list = [...profile[section]];
        list[index][name] = value;
        setProfile({ ...profile, [section]: list });
    };

    const handleAddItem = (section) => {
        if (section === 'education') setProfile(prev => ({ ...prev, education: [...prev.education, { institution: '', degree: '', startYear: '', endYear: '', description: '' }] }));
        if (section === 'experience') setProfile(prev => ({ ...prev, experience: [...prev.experience, { title: '', company: '', startYear: '', endYear: '', location: '', description: '' }] }));
        if (section === 'cvs' && profile.cvs.length < 4) setProfile(prev => ({ ...prev, cvs: [...prev.cvs, { name: '', file_url: '', attachment_id: '' }] }));
    };

    const handleRemoveItem = (index, section) => {
        if (profile[section].length <= 1) return;
        const list = [...profile[section]];
        list.splice(index, 1);
        setProfile({ ...profile, [section]: list });
    };

    const handleCvFileUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(index);
        const formData = new FormData();
        formData.append('cv_file', file);
        try {
            const response = await axios.post(`${api_base_url}candidate/upload-cv`, formData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            const list = [...profile.cvs];
            list[index]['file_url'] = response.data.file_url;
            list[index]['attachment_id'] = response.data.attachment_id;
            setProfile({ ...profile, cvs: list });
            showNotice('CV uploaded successfully!', 'success', 'candidate');
        } catch (error) {
            console.error("CV upload failed", error);
            showNotice(error.response?.data?.message || 'CV upload failed.', 'danger', 'candidate');
        } finally {
            setUploading(null);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await axios.post(`${api_base_url}candidate/profile`, profile, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotice(response.data.message, 'success', 'candidate');
        } catch (error) {
            showNotice(error.response?.data?.message || 'Failed to save profile.', 'danger', 'candidate');
        } finally {
            setSaving(false);
        }
    };
    
    // Stepper Navigation
    const nextStep = () => setCurrentStep(prev => (prev < 3 ? prev + 1 : prev));
    const prevStep = () => setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));

    if (loading) return <div>Loading Profile...</div>;

    return (
        <div className="candidate-profile">
            <div className="mb-30">
                <h2 className="section-title">Candidate Profile</h2>
                <p className="section-subtitle">Complete your profile to attract employers.</p>
            </div>

            {notice && notice.type === 'candidate' && (
                <div className={`alert alert-${notice.status} mb-3`}>{notice.message}</div>
            )}

            <div className="multiFormContainer py-4">
                <Stepper currentStep={currentStep} />
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                    <form onSubmit={handleSave}>
                        {/* Step 1: Basic Information */}
                        <div className={`form-section ${currentStep === 1 ? 'active' : ''}`}>
                            <div className="form-block">
                                <h4 className="form-block-title">About Me</h4>
                                <textarea className="form-control" rows="5" placeholder="Tell us about yourself..." value={profile.about || ''} onChange={(e) => setProfile({ ...profile, about: e.target.value })}></textarea>
                            </div>
                            <div className="form-block">
                                <h4 className="form-block-title">Skills</h4>
                                <input type="text" className="form-control" placeholder="Enter skills, separated by commas (e.g., React, PHP, CSS)" value={profile.skills || ''} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} />
                            </div>
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button type="button" className="i-btn btn--lg btn--primary" onClick={nextStep}>Next</button>
                            </div>
                        </div>

                        {/* Step 2: Experience & Education */}
                        <div className={`form-section ${currentStep === 2 ? 'active' : ''}`}>
                            <div className="form-block">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="form-block-title mb-0">Experience</h4>
                                    <button type="button" className="i-btn btn--sm btn--primary" onClick={() => handleAddItem('experience')}>+ Add Experience</button>
                                </div>
                                {profile.experience.map((item, index) => (
                                    <div key={index} className="repeater-item-box mb-3">
                                        <div className="row g-3">
                                            <div className="col-md-6"><label className="form-label">Job Title</label><input type="text" name="title" placeholder="e.g., Product Designer" value={item.title || ''} onChange={e => handleRepeaterChange(e, index, 'experience')} className="form-control" /></div>
                                            <div className="col-md-6"><label className="form-label">Company</label><input type="text" name="company" placeholder="e.g., Twitter" value={item.company || ''} onChange={e => handleRepeaterChange(e, index, 'experience')} className="form-control" /></div>
                                            <div className="col-md-6"><label className="form-label">Start Year</label><input type="text" name="startYear" placeholder="e.g., Jun 2022" value={item.startYear || ''} onChange={e => handleRepeaterChange(e, index, 'experience')} className="form-control" /></div>
                                            <div className="col-md-6"><label className="form-label">End Year</label><input type="text" name="endYear" placeholder="e.g., Present" value={item.endYear || ''} onChange={e => handleRepeaterChange(e, index, 'experience')} className="form-control" /></div>
                                            <div className="col-12"><label className="form-label">Location</label><input type="text" name="location" placeholder="e.g., Manchester, UK" value={item.location || ''} onChange={e => handleRepeaterChange(e, index, 'experience')} className="form-control" /></div>
                                            <div className="col-12"><label className="form-label">Description</label><textarea name="description" rows="3" placeholder="Description..." value={item.description || ''} onChange={e => handleRepeaterChange(e, index, 'experience')} className="form-control"></textarea></div>
                                        </div>
                                        {profile.experience.length > 1 && <button type="button" className="btn-icon-danger mt-2" onClick={() => handleRemoveItem(index, 'experience')}><i className="ri-delete-bin-line"></i></button>}
                                    </div>
                                ))}
                            </div>
                            <div className="form-block">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="form-block-title mb-0">Education</h4>
                                    <button type="button" className="i-btn btn--sm btn--primary" onClick={() => handleAddItem('education')}>+ Add Education</button>
                                </div>
                                {profile.education.map((item, index) => (
                                    <div key={index} className="repeater-item-box mb-3">
                                        <div className="row g-3">
                                            <div className="col-md-6"><label className="form-label">Institution</label><input type="text" name="institution" placeholder="e.g., Harvard University" value={item.institution || ''} onChange={e => handleRepeaterChange(e, index, 'education')} className="form-control" /></div>
                                            <div className="col-md-6"><label className="form-label">Degree</label><input type="text" name="degree" placeholder="e.g., Postgraduate degree" value={item.degree || ''} onChange={e => handleRepeaterChange(e, index, 'education')} className="form-control" /></div>
                                            <div className="col-md-6"><label className="form-label">Start Year</label><input type="text" name="startYear" placeholder="e.g., 2014" value={item.startYear || ''} onChange={e => handleRepeaterChange(e, index, 'education')} className="form-control" /></div>
                                            <div className="col-md-6"><label className="form-label">End Year</label><input type="text" name="endYear" placeholder="e.g., 2016 or Present" value={item.endYear || ''} onChange={e => handleRepeaterChange(e, index, 'education')} className="form-control" /></div>
                                            <div className="col-12"><label className="form-label">Description</label><textarea name="description" rows="3" placeholder="Description..." value={item.description || ''} onChange={e => handleRepeaterChange(e, index, 'education')} className="form-control"></textarea></div>
                                        </div>
                                        {profile.education.length > 1 && <button type="button" className="btn-icon-danger mt-2" onClick={() => handleRemoveItem(index, 'education')}><i className="ri-delete-bin-line"></i></button>}
                                    </div>
                                ))}
                            </div>
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button type="button" className="i-btn btn--lg btn--outline" onClick={prevStep}>Back</button>
                                <button type="button" className="i-btn btn--lg btn--primary" onClick={nextStep}>Next</button>
                            </div>
                        </div>

                        {/* Step 3: CV / Resume */}
                        <div className={`form-section ${currentStep === 3 ? 'active' : ''}`}>
                            <div className="form-block">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="form-block-title mb-0">Manage Resumes/CVs</h4>
                                    {Array.isArray(profile.cvs) && profile.cvs.length < 4 && (
                                        <button type="button" className="i-btn btn--sm btn--primary" onClick={() => handleAddItem('cvs')}>+ Add CV</button>
                                    )}
                                </div>
                                {Array.isArray(profile.cvs) && profile.cvs.map((cv, index) => (
                                    <div key={index} className="repeater-item-box mb-3">
                                        <div className="row g-3 align-items-center">
                                            <div className="col-md-5"><label className="form-label">CV Name</label><input type="text" name="name" placeholder="e.g., My Main CV" value={cv.name || ''} onChange={e => handleRepeaterChange(e, index, 'cvs')} className="form-control" /></div>
                                            <div className="col-md-5"><label className="form-label">Upload File</label><input type="file" className="form-control" onChange={e => handleCvFileUpload(e, index)} />{uploading === index && <small className="text-muted d-block mt-1">Uploading...</small>}</div>
                                            <div className="col-md-2 d-flex justify-content-end">{profile.cvs.length > 1 && <button type="button" className="btn-icon-danger mt-4" onClick={() => handleRemoveItem(index, 'cvs')}><i className="ri-delete-bin-line"></i></button>}</div>
                                        </div>
                                        {cv.file_url && <div className="mt-2"><small>Current file: <a href={cv.file_url} target="_blank" rel="noopener noreferrer">{cv.file_url.split('/').pop()}</a></small></div>}
                                    </div>
                                ))}
                            </div>
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <button type="button" className="i-btn btn--lg btn--outline" onClick={prevStep}>Back</button>
                                <button type="submit" className="i-btn btn--lg btn--primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
                            </div>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateProfileTab;