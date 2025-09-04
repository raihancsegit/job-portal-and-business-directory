import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// ======================================================
// General Tab Component
// ======================================================
const GeneralTabContent = ({ profile, setProfile, handleSaveProfile, notice, assets_url }) => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const fileInputRef = useRef(null);

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log("Selected file:", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, profile_picture_url: reader.result, newProfilePic: file }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <div className="mb-30">
                <h2 className="section-title">General</h2>
                <p className="section-subtitle">Manage general settings for your account</p>
            </div>
            {notice && notice.type === 'general' && <div className={`alert alert-${notice.status} mb-3`}>{notice.message}</div>}
            <form onSubmit={handleSaveProfile}>
                {/* Profile Picture */}
                <div className="form-block">
                    <div className="row align-items-start">
                        <div className="col-lg-3 d-lg-block d-none"><h6>Profile Picture</h6><p>Upload a profile image.</p></div>
                        <div className="col-lg-9 col-12">
                            <div className="d-flex align-items-center gap-3">
                                <img src={profile.profile_picture_url || `${assets_url}images/bg/settings-profile.png`} alt="profile" className="rounded-circle" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleProfilePicChange} />
                                <button type="button" className="i-btn btn--lg btn--outline rounded-pill px-4" onClick={() => fileInputRef.current.click()}>Change</button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Personal Info */}
                <div className="form-block">
                    <div className="row align-items-start">
                        <div className="col-lg-3 d-lg-block d-none"><h6>Personal Information</h6><p>Type your first and last name.</p></div>
                        <div className="col-lg-9 col-12">
                            <div className="row g-3">
                                <div className="col-md-6"><label className="form-label">First Name</label><div className="input-wrapper"><input type="text" name="first_name" className="form-control" placeholder="First Name" value={profile.first_name || ''} onChange={handleChange} /></div></div>
                                <div className="col-md-6"><label className="form-label">Last Name</label><div className="input-wrapper"><input type="text" name="last_name" className="form-control" placeholder="Last Name" value={profile.last_name || ''} onChange={handleChange} /></div></div>
                                <div className="col-md-6"><label className="form-label">Gender</label><select name="gender" className="form-select" value={profile.gender || ''} onChange={handleChange}><option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                                <div className="col-md-6"><label className="form-label">Birth Date</label><div className="input-wrapper"><input type="date" name="birth_date" className="form-control" value={profile.birth_date || ''} onChange={handleChange} /></div></div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Contact Info */}
                <div className="form-block">
                    <div className="row align-items-start">
                        <div className="col-lg-3 d-lg-block d-none"><h6>Contact Information</h6><p>Type your contact information.</p></div>
                        <div className="col-lg-9 col-12">
                            <div className="mb-3 input-wrapper"><i className="ri-mail-line"></i><input type="email" name="email" className="form-control" placeholder="Email Address" value={profile.email || ''} readOnly disabled /></div>
                            <div className="input-wrapper ps-0"><select name="phone_code" className="form-select" style={{ maxWidth: '120px' }} value={profile.phone_code || 'us'} onChange={handleChange}><option value="us">🇺🇸 +1</option><option value="uk">🇬🇧 +44</option><option value="in">🇮🇳 +91</option></select><input type="text" name="phone_number" className="form-control d-inline-block" style={{ width: 'calc(100% - 120px)' }} value={profile.phone_number || ''} onChange={handleChange} /></div>
                        </div>
                    </div>
                </div>
                {/* Location */}
                <div className="form-block">
                     <div className="row align-items-start">
                        <div className="col-lg-3 d-lg-block d-none"><h6>Location</h6><p>Select your global location.</p></div>
                        <div className="col-lg-9 col-12">
                            <div className="row">
                                <div className="col-md-6 mb-3"><label className="form-label">Country</label><select name="country" className="form-select" value={profile.country || ''} onChange={handleChange}><option value="">Select Country</option><option value="USA">United States</option><option value="UK">United Kingdom</option><option value="India">India</option><option value="Germany">Germany</option></select></div>
                                <div className="col-md-6 mb-3"><label className="form-label">City</label><div className='input-wrapper'><input type="text" name="city" className="form-control" placeholder="City" value={profile.city || ''} onChange={handleChange} /></div></div>
                                <div className="col-12"><div className="input-wrapper"><input type="text" name="address" className="form-control" placeholder="Enter Address" value={profile.address || ''} onChange={handleChange} /></div></div>
                            </div>
                        </div>
                     </div>
                </div>
                {/* Buttons */}
                <div className="d-flex justify-content-end gap-3">
                    <button type="button" className="i-btn btn--lg btn--outline rounded-pill px-4">Cancel</button>
                    <button type="submit" className="i-btn btn btn--primary btn--lg rounded-pill">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

// ======================================================
// Password Tab Component
// ======================================================
const PasswordTabContent = ({ handleSavePassword, notice, saving }) => {
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setPasswords(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        handleSavePassword(passwords);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear fields after submission
    };

    return (
        <div>
            <div className="mb-30">
                <h2 className="section-title">Password</h2>
                <p className="section-subtitle">Manage and change your password</p>
            </div>
            {notice && notice.type === 'password' && <div className={`alert alert-${notice.status} mb-3`}>{notice.message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="row align-items-start">
                    <div className="col-lg-3 d-lg-block d-none"><h6>Current Password</h6></div>
                    <div className="col-lg-9 col-12">
                        <div className="mb-4">
                            <label htmlFor="currentPassword" className="form-label">Current Password</label>
                            <div className="input-wrapper">
                                <i className="ri-lock-password-fill"></i>
                                <input type="password" id="currentPassword" value={passwords.currentPassword} onChange={handleChange} className="form-control" placeholder="Current Password" required />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row align-items-start">
                    <div className="col-lg-3 d-lg-block d-none"><h6>New Password</h6><p>Type your new unique password.</p></div>
                    <div className="col-lg-9 col-12">
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="form-label">New Password</label>
                            <div className="input-wrapper">
                                <i className="ri-lock-password-fill"></i>
                                <input type="password" id="newPassword" value={passwords.newPassword} onChange={handleChange} className="form-control" placeholder="New Password" required />
                            </div>
                            <div className="info-text"><i className="ri-information-line"></i> Minimum of 8 characters or more.</div>
                        </div>
                    </div>
                </div>
                <div className="row align-items-start">
                    <div className="col-lg-3 d-lg-block d-none"><h6>Confirm Password</h6><p>Re-enter your new password.</p></div>
                    <div className="col-lg-9 col-12">
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                            <div className="input-wrapper">
                                <i className="ri-lock-password-fill"></i>
                                <input type="password" id="confirmPassword" value={passwords.confirmPassword} onChange={handleChange} className="form-control" placeholder="Confirm Password" required />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-end gap-3">
                    <button type="submit" className="i-btn btn btn--primary btn--lg rounded-pill" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Password'}
                    </button>
                    <button type="button" className="i-btn btn--lg btn--outline rounded-pill px-4">Back</button>
                </div>
            </form>
        </div>
    );
};

// ======================================================
// Main Settings Page Component (Corrected Version)
// ======================================================
function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    
    // THE FIX, PART 1: Initialize profile with an empty object, not null.
    const [profile, setProfile] = useState({}); 
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState({ type: '', message: '', status: '' });
    const { assets_url, api_base_url } = window.jpbd_object;
    const token = localStorage.getItem('authToken');

    const showNotice = (message, status = 'success', type = 'general') => {
        setNotice({ message, status, type });
        setTimeout(() => setNotice({ message: '', status: '', type: '' }), 4000);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${api_base_url}profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setProfile(response.data);
            } catch (error) { 
                console.error("Failed to fetch profile", error);
                showNotice('Failed to load profile data.', 'danger', 'general');
            }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, [token, api_base_url]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await axios.post(`${api_base_url}profile`, profile, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotice(response.data.message, 'success', 'general');
        } catch (error) {
            showNotice(error.response?.data?.message || 'Failed to save profile', 'danger', 'general');
        } finally {
            setSaving(false);
        }
    };
    
    const handleSavePassword = async (passwords) => {
        setSaving(true);
        try {
            const response = await axios.post(`${api_base_url}profile/password`, passwords, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showNotice(response.data.message, 'success', 'password');
        } catch (error) {
            showNotice(error.response?.data?.message || 'Failed to save password', 'danger', 'password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="row g-3">
            <div className="col-lg-12">
                <div className="i-card-md">
                    <div className="card-body">
                        <ul className="nav nav-tabs style-4" role="tablist">
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>Password</button>
                            </li>
                        </ul>
                        <div className="tab-content pt-4">
                            {/* THE FIX, PART 2: Show loading indicator or content */}
                            {loading ? (
                                <div>Loading Profile...</div>
                            ) : (
                                <>
                                    {activeTab === 'general' && (
                                        <GeneralTabContent 
                                            profile={profile} 
                                            setProfile={setProfile} 
                                            handleSaveProfile={handleSaveProfile} 
                                            notice={notice} 
                                            assets_url={assets_url} 
                                        />
                                    )}
                                    {activeTab === 'password' && (
                                        <PasswordTabContent 
                                            handleSavePassword={handleSavePassword} 
                                            notice={notice} 
                                            saving={saving} 
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;