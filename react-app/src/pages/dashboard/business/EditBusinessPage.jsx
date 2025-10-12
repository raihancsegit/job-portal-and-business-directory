// src/pages/dashboard/business/EditBusinessPage.jsx
// THIS IS THE COMPLETE AND FINAL CODE

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import LocationMap from '../components/LocationMap';
import { businessCategories } from '../../../data/businessCategories'; 
import { businessStatuses } from '../../../data/businessStatuses';

const EditBusinessPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { api_base_url } = window.jpbd_object || {};
    const token = localStorage.getItem('authToken');

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    // States for UI elements
    const [logoPreview, setLogoPreview] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [currentHour, setCurrentHour] = useState({ day: '', startTime: '', endTime: '', fullDay: false });
    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [searchingLocation, setSearchingLocation] = useState(false);
    const [searchedPosition, setSearchedPosition] = useState(null);

    // Fetch existing business data
    useEffect(() => {
        const fetchBusinessData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${api_base_url}businesses/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setFormData(response.data);
                if (response.data.logo_url) {
                    setLogoPreview(response.data.logo_url);
                }
                if (response.data.mapLocation) {
                    setSearchedPosition(response.data.mapLocation);
                }
            } catch (error) {
                console.error("Failed to fetch business data", error);
                alert("Could not load the business data for editing.");
                navigate('/dashboard/business-directory');
            } finally {
                setLoading(false);
            }
        };
        fetchBusinessData();
    }, [id, api_base_url, token, navigate]);

    // Handlers
    const handleChange = e => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

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
        } catch (error) {
            alert('Logo upload failed!');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleAddHour = () => {
        if (!currentHour.day) { alert('Please select a day.'); return; }
        setFormData(prev => ({ ...prev, businessHours: [...(prev.businessHours || []), currentHour] }));
        setCurrentHour({ day: '', startTime: '', endTime: '', fullDay: false });
    };

    const handleRemoveHour = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            businessHours: prev.businessHours.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleAddSocial = (platform) => {
        if (!platform) return;
        if (formData.socialProfiles?.some(p => p.platform === platform)) {
            alert(`${platform} profile already added.`);
            return;
        }
        setFormData(prev => ({ ...prev, socialProfiles: [...(prev.socialProfiles || []), { platform, url: '' }] }));
    };

    const handleSocialUrlChange = (index, url) => {
        const updatedProfiles = [...(formData.socialProfiles || [])];
        updatedProfiles[index].url = url;
        setFormData(prev => ({...prev, socialProfiles: updatedProfiles}));
    };
    
    const handleRemoveSocial = (platformToRemove) => {
         setFormData(prev => ({
            ...prev,
            socialProfiles: prev.socialProfiles.filter(p => p.platform !== platformToRemove)
        }));
    };

    const handleMapSelect = (coords) => {
        setFormData(prev => ({
            ...prev,
            mapLocation: { lat: coords.lat, lng: coords.lng }
        }));
    };
    
    const handleMapSearch = async (e) => {
        e.preventDefault();
        if (!mapSearchQuery) return;
        setSearchingLocation(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(mapSearchQuery)}&format=json&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setSearchedPosition(newPos); 
                handleMapSelect(newPos);
            } else {
                alert('Location not found!');
            }
        } catch (error) {
            console.error("Geocoding API error:", error);
            alert('Failed to search for location.');
        } finally {
            setSearchingLocation(false);
        }
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const { user_id, is_saved, created_at, ...updateData } = formData;
            await axios.post(`${api_base_url}businesses/${id}`, updateData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Business updated successfully!');
            navigate('/dashboard/business-directory');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update business.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !formData) {
        return <div className="p-5 text-center">Loading Business Data for Editing...</div>;
    }

    return (
        <div className="business-add" data-simplebar="">
            <form onSubmit={handleSubmit}>
                <div className="i-card-md radius-30 mb-3">
                    <div className="card-body">
                        <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-5">
                            <div className="flex-grow-1 d-flex justify-content-start align-items-center gap-2">
                                <button type="button" onClick={() => navigate(-1)} className="icon-btn-lg"><i className="ri-arrow-left-s-line"></i></button>
                                <h3>Edit Business: {formData.title}</h3>
                            </div>
                        </div>
                        
                        {/* Basic Information Section */}
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label>Business Logo</label></div><div className="col-lg-9"><div className="business-logo"><div className="logo">{logoPreview && <img src={logoPreview} alt="Logo Preview" />}</div><label htmlFor="logoUpload" className="upload-btn">Change</label><input type="file" id="logoUpload" className="file-input" accept="image/*" onChange={handleLogoUpload} />{uploadingLogo && <small>Uploading...</small>}</div></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="title">Business Title</label></div><div className="col-lg-9"><input type="text" id="title" className="form-control" value={formData.title || ''} onChange={handleChange} required /></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="tagline">Tagline</label></div><div className="col-lg-9"><input type="text" id="tagline" className="form-control" value={formData.tagline || ''} onChange={handleChange} /></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="industry">Industry</label></div><div className="col-lg-9"><select id="industry" className="form-select" value={formData.industry || ''} onChange={handleChange}><option value="">Select industry</option><option value="IT">IT</option><option value="Design">Design</option></select></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="category">Category</label></div><div className="col-lg-9"><select id="category" className="form-select" value={formData.category || ''} onChange={handleChange} required><option value="">Select category</option>{businessCategories.filter(cat => cat.slug !== 'all').map(category => (<option key={category.slug} value={category.slug}>{category.name}</option>))}</select></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="status">Business Status</label></div><div className="col-lg-9"><select id="status" className="form-select" value={formData.status || ''} onChange={handleChange}><option value="">Select Status</option>{businessStatuses.filter(s => s.value !== 'all').map(status => (<option key={status.value} value={status.value}>{status.label}</option>))}</select></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="details">Business Details</label></div><div className="col-lg-9"><textarea id="details" className="form-control" rows="3" value={formData.details || ''} onChange={handleChange}></textarea></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="city">City</label></div><div className="col-lg-9"><div className="d-flex"><select id="countryCode" className="form-select small-select" value={formData.countryCode || 'USA'} onChange={handleChange}><option>USA</option><option>UK</option></select><input type="text" id="city" className="form-control" value={formData.city || ''} onChange={handleChange} /></div></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="address">Address</label></div><div className="col-lg-9"><input type="text" id="address" className="form-control" value={formData.address || ''} onChange={handleChange} /></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="zipCode">Zip</label></div><div className="col-lg-9"><input type="text" id="zipCode" className="form-control" value={formData.zipCode || ''} onChange={handleChange} /></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="websiteUrl">Website</label></div><div className="col-lg-9"><input type="url" id="websiteUrl" className="form-control" value={formData.websiteUrl || ''} onChange={handleChange} /></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="phoneNumber">Mobile</label></div><div className="col-lg-9"><div className="d-flex"><select id="phoneCode" className="form-select small-select" value={formData.phoneCode || '+1'} onChange={handleChange}><option>+1</option><option>+880</option></select><input type="tel" id="phoneNumber" className="form-control" value={formData.phoneNumber || ''} onChange={handleChange} /></div></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="foundedYear">Founded</label></div><div className="col-lg-9"><select id="foundedYear" className="form-select" value={formData.foundedYear || ''} onChange={handleChange}><option value="">Select year</option><option>2025</option><option>2024</option></select></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="certifications">Certifications</label></div><div className="col-lg-9"><input type="text" id="certifications" className="form-control" value={formData.certifications || ''} onChange={handleChange} /></div></div>
                        <div className="row align-items-start mb-3"><div className="col-lg-3"><label htmlFor="services">Services</label></div><div className="col-lg-9"><textarea id="services" className="form-control" rows="3" value={formData.services || ''} onChange={handleChange}></textarea></div></div>
                    </div>
                </div>

                {/* Business Hour Section */}
                {/* ================== Business Hour Section (for Edit Page) ================== */}
                <div className="i-card-md radius-30 mb-3">
                    <div className="card-body">
                         <h3 className="mb-4">Business Hour</h3>
                         <div className="business-hour">
                              <div id="businessHourList" className="mb-4">
                                {formData.businessHours?.map((hour, index) => (
                                    <div key={index} className="list-item">
                                        <div className="day-name">{hour.day}</div>
                                        <div className="time-text">{hour.fullDay ? 'Open 24 Hours' : `${hour.startTime || 'N/A'} - ${hour.endTime || 'N/A'}`}</div>
                                        <button type="button" className="remove-btn" onClick={() => handleRemoveHour(index)}>×</button>
                                    </div>
                                ))}
                              </div>
                         </div>
                         <div className="row align-items-center g-3">
                              <div className="col-lg-2 col-6"><h6>Select</h6></div>
                              <div className="col-lg-2 col-12">
                                   <select id="daySelect" className="form-select bg-transparent" value={currentHour.day} onChange={e => setCurrentHour({...currentHour, day: e.target.value})}>
                                        <option value="">Select day</option>
                                        <option>Sunday</option><option>Monday</option><option>Tuesday</option>
                                        <option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option>
                                   </select>
                              </div>
                              <div className="col-lg-2 col-6"><input type="time" id="startTime" className="form-control bg-transparent" value={currentHour.startTime} onChange={e => setCurrentHour({...currentHour, startTime: e.target.value})} disabled={currentHour.fullDay} /></div>
                              <div className="col-lg-2 col-6"><input type="time" id="endTime" className="form-control bg-transparent" value={currentHour.endTime} onChange={e => setCurrentHour({...currentHour, endTime: e.target.value})} disabled={currentHour.fullDay} /></div>
                              <div className="col-lg-2 col-6 d-flex align-items-center">
                                   <div className="form-check d-flex align-items-center gap-1">
                                        <input className="form-check-input" type="checkbox" id="editFullDay" checked={currentHour.fullDay} onChange={e => setCurrentHour({...currentHour, fullDay: e.target.checked})} />
                                        <label className="form-check-label fs-18 mb-0" htmlFor="editFullDay">Full Day</label>
                                   </div>
                              </div>
                              <div className="col-lg-2 col-6">
                                   <button id="addHour" type="button" className="i-btn btn--xl btn--dark rounded-pill px-4" onClick={handleAddHour}>
                                        <i className="ri-add-circle-line me-2 fs-18"></i>Add Another
                                   </button>
                              </div>
                         </div>
                    </div>
                </div>

                {/* ================== Social Profiles Section (for Edit Page) ================== */}
                <div className="i-card-md radius-30 mb-3">
                    <div className="card-body">
                         <h3 className="mb-4">Social Profiles</h3>
                         <div id="socialProfileList" className="mb-4">
                            {formData.socialProfiles?.map((profile, index) => (
                                <div key={index} className="list-item row align-items-center g-3">
                                    <div className="col-lg-2 col-12 social-name">{profile.platform}</div>
                                    <div className="col-lg-10 col-12 d-flex align-items-center gap-2">
                                        <input 
                                            type="url"
                                            placeholder={`Enter ${profile.platform} URL`} 
                                            className="form-control bg-transparent" 
                                            value={profile.url} 
                                            onChange={e => handleSocialUrlChange(index, e.target.value)} 
                                        />
                                        <button 
                                            type="button" 
                                            className="remove-btn" 
                                            onClick={() => handleRemoveSocial(profile.platform)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                         </div>
                         <div className="row align-items-center g-3">
                              <div className="col-lg-2 col-6"><h6>Select Another</h6></div>
                              <div className="col-lg-10 col-12">
                                   <select 
                                        id="socialSelect" 
                                        className="form-select bg-transparent" 
                                        onChange={e => { 
                                            handleAddSocial(e.target.value); 
                                            e.target.value = '';
                                        }} 
                                        value=""
                                   >
                                        <option value="">Please Select A Social Media</option>
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

                {/* Map Section */}
                <div className="i-card-md radius-30 mb-3">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3>Map Location</h3>
                            <div className="d-flex" style={{ minWidth: '300px' }}>
                                <input type="text" className="form-control" placeholder="Search on map..." value={mapSearchQuery} onChange={e => setMapSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleMapSearch(e); }} />
                                <button type="button" className="i-btn btn--dark" onClick={handleMapSearch}>Search</button>
                            </div>
                        </div>
                        <LocationMap onLocationSelect={handleMapSelect} initialPosition={formData.mapLocation} searchResultPosition={searchedPosition} />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="text-end d-flex justify-content-end align-items-center gap-3 pb-4">
                    <button type="button" className="i-btn btn--xl btn--outline" onClick={() => navigate(-1)} disabled={updating}>Cancel</button>
                    <button type="submit" className="i-btn btn--xl btn--primary" disabled={updating}>
                        {updating ? 'Updating...' : 'Update Business'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditBusinessPage;