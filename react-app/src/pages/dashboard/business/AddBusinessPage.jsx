// src/pages/dashboard/business/AddBusinessPage.jsx (আপনার ফাইল পাথ অনুযায়ী)

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LocationMap from '../components/LocationMap';
import { businessCategories } from '../../../data/businessCategories'; 
import { businessStatuses } from '../../../data/businessStatuses';
const AddBusinessPage = () => {
    // Main form state
    const [formData, setFormData] = useState({
        logoUrl: '',
        title: '',
        tagline: '',
        industry: '',
         category: '',
        details: '',
        countryCode: 'USA', // ডিফল্ট ভ্যালু
        city: '',
        address: '',
        zipCode: '',
        websiteUrl: '',
        phoneCode: '+1', // ডিফল্ট ভ্যালু
        phoneNumber: '',
        foundedYear: '',
        certifications: '',
        services: '',
        businessHours: [],
        socialProfiles: [],
        mapLocation: null, // ম্যাপের জন্য পরে যোগ করা যাবে
    });
    
    // UI state for logo preview
    const [logoPreview, setLogoPreview] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    
    // UI state for business hours repeater
    const [currentHour, setCurrentHour] = useState({ day: '', startTime: '', endTime: '', fullDay: false });

    // UI state for social profiles repeater
    const [currentSocial, setCurrentSocial] = useState({ platform: '', url: '' });

    // General UI states
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { api_base_url } = window.jpbd_object || {};
    const token = localStorage.getItem('authToken');

    // ===================================================================
    // Handlers
    // ===================================================================

    // Handles changes for simple input fields
    const handleChange = e => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    // Handles logo file upload and preview
    const handleLogoUpload = async e => {
        const file = e.target.files[0];
        if (!file) return;

        setLogoPreview(URL.createObjectURL(file));
        setUploadingLogo(true);
        const uploadData = new FormData();
        uploadData.append('logo_file', file);

        try {
            const response = await axios.post(`${api_base_url}businesses/upload-logo`, uploadData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, logoUrl: response.data.url }));
            alert('Logo uploaded successfully!');
        } catch (error) {
            alert('Logo upload failed!');
            setLogoPreview('');
        } finally {
            setUploadingLogo(false);
        }
    };

    // Handles Business Hours repeater
    const handleAddHour = () => {
        if (!currentHour.day || (!currentHour.fullDay && (!currentHour.startTime || !currentHour.endTime))) {
            alert('Please select a day and specify the hours.');
            return;
        }
        setFormData(prev => ({ ...prev, businessHours: [...prev.businessHours, currentHour] }));
        setCurrentHour({ day: '', startTime: '', endTime: '', fullDay: false });
    };

    const handleRemoveHour = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            businessHours: prev.businessHours.filter((_, index) => index !== indexToRemove)
        }));
    };
    
    // Handles Social Profiles repeater
    const handleAddSocial = (platform) => {
        if (!platform) return;
        // চেক করা হচ্ছে যে এই প্ল্যাটফর্মটি ইতিমধ্যে যোগ করা হয়েছে কিনা
        if (formData.socialProfiles.some(p => p.platform === platform)) {
            alert(`${platform} profile already added.`);
            return;
        }
        setFormData(prev => ({ ...prev, socialProfiles: [...prev.socialProfiles, { platform, url: '' }] }));
    };

    const handleSocialUrlChange = (index, url) => {
        const updatedProfiles = [...formData.socialProfiles];
        updatedProfiles[index].url = url;
        setFormData(prev => ({...prev, socialProfiles: updatedProfiles}));
    };
    
    const handleRemoveSocial = (platformToRemove) => {
         setFormData(prev => ({
            ...prev,
            socialProfiles: prev.socialProfiles.filter(p => p.platform !== platformToRemove)
        }));
    };

     // ম্যাপ থেকে লোকেশন সিলেক্ট হলে এই handler টি কল হবে
    const handleMapSelect = (coords) => {
        setFormData(prev => ({
            ...prev,
            mapLocation: { lat: coords.lat, lng: coords.lng }
        }));
    };


    // Handles final form submission
    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${api_base_url}businesses`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Business added successfully!');
            navigate('/dashboard'); // অথবা অন্য কোনো পেইজে
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add business.');
        } finally {
            setLoading(false);
        }
    };

    // ===================================================================
    // JSX Rendering
    // ===================================================================

    return (
        <div className="business-add" data-simplebar="">
            <form onSubmit={handleSubmit}>
                <div className="i-card-md radius-30 mb-3">
                    <div className="card-body">
                        <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-5">
                            <div className="flex-grow-1 d-flex justify-content-start align-items-center gap-2">
                                <button type="button" onClick={() => navigate(-1)} className="icon-btn-lg"><i className="ri-arrow-left-s-line"></i></button>
                                <h3>Add Your Business</h3>
                            </div>
                        </div>
                        
                        {/* Basic Information Section */}
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label className="form-label">Business Logo</label></div><div className="col-lg-9"><div className="business-logo"><div className="logo">{logoPreview && <img src={logoPreview} alt="Logo Preview" />}</div><label htmlFor="logoUpload" className="upload-btn">Change</label><input type="file" id="logoUpload" className="file-input" accept="image/*" onChange={handleLogoUpload} />{uploadingLogo && <small className="text-muted d-block mt-1">Uploading...</small>}</div></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="title" className="form-label">Business Title</label></div><div className="col-lg-9"><input type="text" id="title" className="form-control" placeholder="Enter business title" value={formData.title} onChange={handleChange} required /></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="tagline" className="form-label">Tagline</label></div><div className="col-lg-9"><input type="text" id="tagline" className="form-control" placeholder="Enter business tagline" value={formData.tagline} onChange={handleChange} /></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="industry" className="form-label">Industry</label></div><div className="col-lg-9"><select id="industry" className="form-select bg-transparent" value={formData.industry} onChange={handleChange}><option value="">Select industry</option><option value="IT">IT</option><option value="Design">Design</option></select></div></div>
                        <div className="row align-items-start mb-3">
                            <div className="col-lg-3 d-lg-block d-none">
                                <label htmlFor="category" className="form-label">Category</label>
                            </div>
                            <div className="col-lg-9 col-12">
                                <select id="category" className="form-select bg-transparent" value={formData.category} onChange={handleChange} required>
                                    <option value="">Select category</option>
                                    {businessCategories.filter(cat => cat.slug !== 'all').map(category => (
                                        <option key={category.slug} value={category.slug}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="row align-items-start mb-3">
                        <div className="col-lg-3"><label htmlFor="status" className="form-label">Business Status</label></div>
                        <div className="col-lg-9">
                            <select id="status" className="form-select bg-transparent" value={formData.status} onChange={handleChange}>
                                <option value="">Select Status</option>
                                {businessStatuses.filter(s => s.value !== 'all').map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="details" className="form-label">Business Details</label></div><div className="col-lg-9"><textarea id="details" className="form-control" rows="3" placeholder="Enter business details" value={formData.details} onChange={handleChange}></textarea></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="city" className="form-label">City</label></div><div className="col-lg-9"><div className="d-flex flex-row gap-0"><div className="small-select"><select id="countryCode" className="form-select bg-transparent rounded-end-0" value={formData.countryCode} onChange={handleChange}><option>USA</option><option>UK</option></select></div><div className="w-100 grow-1"><input type="text" id="city" className="form-control rounded-start-0" placeholder="Select City" value={formData.city} onChange={handleChange} /></div></div></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="address" className="form-label">Address</label></div><div className="col-lg-9"><input type="text" id="address" className="form-control" placeholder="Enter address" value={formData.address} onChange={handleChange} /></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="zipCode" className="form-label">Zip</label></div><div className="col-lg-9"><input type="text" id="zipCode" className="form-control" placeholder="Enter zip" value={formData.zipCode} onChange={handleChange} /></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="websiteUrl" className="form-label">Website</label></div><div className="col-lg-9"><input type="url" id="websiteUrl" className="form-control" placeholder="https://example.com" value={formData.websiteUrl} onChange={handleChange} /></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="phoneNumber" className="form-label">Mobile</label></div><div className="col-lg-9"><div className="d-flex flex-row gap-0"><div className="small-select"><select id="phoneCode" className="form-select bg-transparent rounded-end-0" value={formData.phoneCode} onChange={handleChange}><option>+1</option><option>+880</option></select></div><div className="w-100 grow-1"><input type="tel" id="phoneNumber" className="form-control rounded-start-0" placeholder="Enter Number" value={formData.phoneNumber} onChange={handleChange} /></div></div></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="foundedYear" className="form-label">Founded</label></div><div className="col-lg-9"><select id="foundedYear" className="form-select bg-transparent" value={formData.foundedYear} onChange={handleChange}><option value="">Select year</option><option>2025</option><option>2024</option></select></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="certifications" className="form-label">Certifications/License</label></div><div className="col-lg-9"><input type="text" id="certifications" className="form-control" placeholder="Enter certification (Comma separated)" value={formData.certifications} onChange={handleChange} /></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="services" className="form-label">Services</label></div><div className="col-lg-9"><textarea id="services" className="form-control" rows="3" placeholder="Enter services" value={formData.services} onChange={handleChange}></textarea></div></div>
                    </div>
                </div>

                {/* Business Hour Section */}
                <div className="i-card-md radius-30 mb-3">
                    <div className="card-body">
                         <h3 className="mb-4">Business Hour</h3>
                         <div className="business-hour mb-4">
                            {formData.businessHours.map((hour, index) => (
                                <div key={index} className="repeater-item-box mb-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span><strong>{hour.day}:</strong> {hour.fullDay ? 'Open 24 Hours' : `${hour.startTime} - ${hour.endTime}`}</span>
                                        <button type="button" className="btn-icon-danger" onClick={() => handleRemoveHour(index)}><i className="ri-delete-bin-line"></i></button>
                                    </div>
                                </div>
                            ))}
                         </div>
                         <div className="row align-items-center g-3">
                              <div className="col-lg-2 col-12"><select className="form-select bg-transparent" value={currentHour.day} onChange={e => setCurrentHour({...currentHour, day: e.target.value})}><option value="">Select day</option><option>Sunday</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select></div>
                              <div className="col-lg-2 col-6"><input type="time" className="form-control bg-transparent" value={currentHour.startTime} onChange={e => setCurrentHour({...currentHour, startTime: e.target.value})} disabled={currentHour.fullDay} /></div>
                              <div className="col-lg-2 col-6"><input type="time" className="form-control bg-transparent" value={currentHour.endTime} onChange={e => setCurrentHour({...currentHour, endTime: e.target.value})} disabled={currentHour.fullDay} /></div>
                              <div className="col-lg-3 col-6 d-flex align-items-center"><div className="form-check d-flex align-items-center gap-1"><input className="form-check-input" type="checkbox" id="fullDayCheckbox" checked={currentHour.fullDay} onChange={e => setCurrentHour({...currentHour, fullDay: e.target.checked})} /><label className="form-check-label fs-18 mb-0" htmlFor="fullDayCheckbox">Open 24 Hours</label></div></div>
                              <div className="col-lg-3 col-6"><button type="button" className="i-btn btn--xl btn--dark rounded-pill px-4" onClick={handleAddHour}><i className="ri-add-circle-line me-2 fs-18"></i>Add Hour</button></div>
                         </div>
                    </div>
                </div>

                {/* Social Profiles Section */}
                <div className="i-card-md radius-30 mb-3">
                    <div className="card-body">
                         <h3 className="mb-4">Social Profiles</h3>
                         <div className="mb-4">
                             {formData.socialProfiles.map((profile, index) => (
                                <div key={index} className="repeater-item-box mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="flex-shrink-0 fw-bold">{profile.platform}</div>
                                        <div className="flex-grow-1"><input type="url" className="form-control" placeholder={`Enter ${profile.platform} URL`} value={profile.url} onChange={e => handleSocialUrlChange(index, e.target.value)} /></div>
                                        <button type="button" className="btn-icon-danger" onClick={() => handleRemoveSocial(profile.platform)}><i className="ri-delete-bin-line"></i></button>
                                    </div>
                                </div>
                             ))}
                         </div>
                         <div className="row align-items-center g-3">
                              <div className="col-lg-2"><h6>Add Profile</h6></div>
                              <div className="col-lg-10">
                                   <select className="form-select bg-transparent" onChange={e => handleAddSocial(e.target.value)} value="">
                                        <option value="">Select a social media</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="Twitter">Twitter</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="YouTube">YouTube</option>
                                   </select>
                              </div>
                         </div>
                    </div>
                </div>

                {/* Map Section (UI Only) */}
                <div className="i-card-md radius-30 mb-3">
                    <div className="card-body">
                         <h3 className="mb-4">Mapss</h3>
                         {/* ম্যাপ ইন্টিগ্রেশনের জন্য আলাদা লাইব্রেরি প্রয়োজন হবে (e.g., react-leaflet) */}
                           <LocationMap onLocationSelect={handleMapSelect} />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="text-end d-flex justify-content-end align-items-center gap-3 pb-4">
                    <button type="button" className="i-btn btn--xl btn--outline rounded-pill px-4" onClick={() => navigate(-1)}>Cancel</button>
                    <button type="submit" className="i-btn btn--xl btn--primary rounded-pill px-4" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </div>
    );
};

export default AddBusinessPage;