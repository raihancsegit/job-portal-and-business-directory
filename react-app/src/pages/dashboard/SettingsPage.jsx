import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CandidateProfileTab from '../dashboard/components/settings/CandidateProfileTab';
import { useAuth } from '../../context/AuthContext';
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
                            <div className="input-wrapper ps-0">
                                    <select name="phone_code" className="form-select" style={{ maxWidth: '120px' }} value={profile.phone_code || 'us'} onChange={handleChange}>
                                        <option value="bd">🇧🇩 +880</option>
                                        <option value="us">🇺🇸 +1</option>
                                        <option value="in">🇮🇳 +91</option>
                                        <option value="gb">🇬🇧 +44</option>
                                        <option value="ca">🇨🇦 +1</option>
                                        <option value="au">🇦🇺 +61</option>
                                        <option value="de">🇩🇪 +49</option>
                                        <option value="jp">🇯🇵 +81</option>
                                        <option value="cn">🇨🇳 +86</option>
                                        <option value="sa">🇸🇦 +966</option>
                                        <option value="ae">🇦🇪 +971</option>
                                        <option value="my">🇲🇾 +60</option>
                                        <option value="sg">🇸🇬 +65</option>
                                    </select>
                                <input type="text" name="phone_number" className="form-control d-inline-block" style={{ width: 'calc(100% - 120px)' }} value={profile.phone_number || ''} onChange={handleChange} /></div>
                        </div>
                    </div>
                </div>
                {/* Location */}
                <div className="form-block">
                     <div className="row align-items-start">
                        <div className="col-lg-3 d-lg-block d-none"><h6>Location</h6><p>Select your global location.</p></div>
                        <div className="col-lg-9 col-12">
                            <div className="row">
                                <div className="col-md-6 mb-3"><label className="form-label">Country</label><select name="country" className="form-select" value={profile.country || ''} onChange={handleChange}>
                                        <option value="">Select Country</option>
                                        <option value="Afghanistan">Afghanistan</option>
                                        <option value="Albania">Albania</option>
                                        <option value="Algeria">Algeria</option>
                                        <option value="Andorra">Andorra</option>
                                        <option value="Angola">Angola</option>
                                        <option value="Argentina">Argentina</option>
                                        <option value="Armenia">Armenia</option>
                                        <option value="Australia">Australia</option>
                                        <option value="Austria">Austria</option>
                                        <option value="Azerbaijan">Azerbaijan</option>
                                        <option value="Bahamas">Bahamas</option>
                                        <option value="Bahrain">Bahrain</option>
                                        <option value="Bangladesh">Bangladesh</option>
                                        <option value="Barbados">Barbados</option>
                                        <option value="Belarus">Belarus</option>
                                        <option value="Belgium">Belgium</option>
                                        <option value="Belize">Belize</option>
                                        <option value="Benin">Benin</option>
                                        <option value="Bhutan">Bhutan</option>
                                        <option value="Bolivia">Bolivia</option>
                                        <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                                        <option value="Botswana">Botswana</option>
                                        <option value="Brazil">Brazil</option>
                                        <option value="Brunei">Brunei</option>
                                        <option value="Bulgaria">Bulgaria</option>
                                        <option value="Burkina Faso">Burkina Faso</option>
                                        <option value="Burundi">Burundi</option>
                                        <option value="Cambodia">Cambodia</option>
                                        <option value="Cameroon">Cameroon</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Cape Verde">Cape Verde</option>
                                        <option value="Central African Republic">Central African Republic</option>
                                        <option value="Chad">Chad</option>
                                        <option value="Chile">Chile</option>
                                        <option value="China">China</option>
                                        <option value="Colombia">Colombia</option>
                                        <option value="Comoros">Comoros</option>
                                        <option value="Congo, Democratic Republic of the">Congo, Democratic Republic of the</option>
                                        <option value="Congo, Republic of the">Congo, Republic of the</option>
                                        <option value="Costa Rica">Costa Rica</option>
                                        <option value="Croatia">Croatia</option>
                                        <option value="Cuba">Cuba</option>
                                        <option value="Cyprus">Cyprus</option>
                                        <option value="Czech Republic">Czech Republic</option>
                                        <option value="Denmark">Denmark</option>
                                        <option value="Djibouti">Djibouti</option>
                                        <option value="Dominica">Dominica</option>
                                        <option value="Dominican Republic">Dominican Republic</option>
                                        <option value="East Timor">East Timor</option>
                                        <option value="Ecuador">Ecuador</option>
                                        <option value="Egypt">Egypt</option>
                                        <option value="El Salvador">El Salvador</option>
                                        <option value="Equatorial Guinea">Equatorial Guinea</option>
                                        <option value="Eritrea">Eritrea</option>
                                        <option value="Estonia">Estonia</option>
                                        <option value="Eswatini">Eswatini</option>
                                        <option value="Ethiopia">Ethiopia</option>
                                        <option value="Fiji">Fiji</option>
                                        <option value="Finland">Finland</option>
                                        <option value="France">France</option>
                                        <option value="Gabon">Gabon</option>
                                        <option value="Gambia">Gambia</option>
                                        <option value="Georgia">Georgia</option>
                                        <option value="Germany">Germany</option>
                                        <option value="Ghana">Ghana</option>
                                        <option value="Greece">Greece</option>
                                        <option value="Grenada">Grenada</option>
                                        <option value="Guatemala">Guatemala</option>
                                        <option value="Guinea">Guinea</option>
                                        <option value="Guinea-Bissau">Guinea-Bissau</option>
                                        <option value="Guyana">Guyana</option>
                                        <option value="Haiti">Haiti</option>
                                        <option value="Honduras">Honduras</option>
                                        <option value="Hungary">Hungary</option>
                                        <option value="Iceland">Iceland</option>
                                        <option value="India">India</option>
                                        <option value="Indonesia">Indonesia</option>
                                        <option value="Iran">Iran</option>
                                        <option value="Iraq">Iraq</option>
                                        <option value="Ireland">Ireland</option>
                                        <option value="Israel">Israel</option>
                                        <option value="Italy">Italy</option>
                                        <option value="Ivory Coast">Ivory Coast</option>
                                        <option value="Jamaica">Jamaica</option>
                                        <option value="Japan">Japan</option>
                                        <option value="Jordan">Jordan</option>
                                        <option value="Kazakhstan">Kazakhstan</option>
                                        <option value="Kenya">Kenya</option>
                                        <option value="Kiribati">Kiribati</option>
                                        <option value="Kosovo">Kosovo</option>
                                        <option value="Kuwait">Kuwait</option>
                                        <option value="Kyrgyzstan">Kyrgyzstan</option>
                                        <option value="Laos">Laos</option>
                                        <option value="Latvia">Latvia</option>
                                        <option value="Lebanon">Lebanon</option>
                                        <option value="Lesotho">Lesotho</option>
                                        <option value="Liberia">Liberia</option>
                                        <option value="Libya">Libya</option>
                                        <option value="Liechtenstein">Liechtenstein</option>
                                        <option value="Lithuania">Lithuania</option>
                                        <option value="Luxembourg">Luxembourg</option>
                                        <option value="Madagascar">Madagascar</option>
                                        <option value="Malawi">Malawi</option>
                                        <option value="Malaysia">Malaysia</option>
                                        <option value="Maldives">Maldives</option>
                                        <option value="Mali">Mali</option>
                                        <option value="Malta">Malta</option>
                                        <option value="Marshall Islands">Marshall Islands</option>
                                        <option value="Mauritania">Mauritania</option>
                                        <option value="Mauritius">Mauritius</option>
                                        <option value="Mexico">Mexico</option>
                                        <option value="Micronesia">Micronesia</option>
                                        <option value="Moldova">Moldova</option>
                                        <option value="Monaco">Monaco</option>
                                        <option value="Mongolia">Mongolia</option>
                                        <option value="Montenegro">Montenegro</option>
                                        <option value="Morocco">Morocco</option>
                                        <option value="Mozambique">Mozambique</option>
                                        <option value="Myanmar (Burma)">Myanmar (Burma)</option>
                                        <option value="Namibia">Namibia</option>
                                        <option value="Nauru">Nauru</option>
                                        <option value="Nepal">Nepal</option>
                                        <option value="Netherlands">Netherlands</option>
                                        <option value="New Zealand">New Zealand</option>
                                        <option value="Nicaragua">Nicaragua</option>
                                        <option value="Niger">Niger</option>
                                        <option value="Nigeria">Nigeria</option>
                                        <option value="North Korea">North Korea</option>
                                        <option value="North Macedonia">North Macedonia</option>
                                        <option value="Norway">Norway</option>
                                        <option value="Oman">Oman</option>
                                        <option value="Pakistan">Pakistan</option>
                                        <option value="Palau">Palau</option>
                                        <option value="Palestine">Palestine</option>
                                        <option value="Panama">Panama</option>
                                        <option value="Papua New Guinea">Papua New Guinea</option>
                                        <option value="Paraguay">Paraguay</option>
                                        <option value="Peru">Peru</option>
                                        <option value="Philippines">Philippines</option>
                                        <option value="Poland">Poland</option>
                                        <option value="Portugal">Portugal</option>
                                        <option value="Qatar">Qatar</option>
                                        <option value="Romania">Romania</option>
                                        <option value="Russia">Russia</option>
                                        <option value="Rwanda">Rwanda</option>
                                        <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                                        <option value="Saint Lucia">Saint Lucia</option>
                                        <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                                        <option value="Samoa">Samoa</option>
                                        <option value="San Marino">San Marino</option>
                                        <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                                        <option value="Saudi Arabia">Saudi Arabia</option>
                                        <option value="Senegal">Senegal</option>
                                        <option value="Serbia">Serbia</option>
                                        <option value="Seychelles">Seychelles</option>
                                        <option value="Sierra Leone">Sierra Leone</option>
                                        <option value="Singapore">Singapore</option>
                                        <option value="Slovakia">Slovakia</option>
                                        <option value="Slovenia">Slovenia</option>
                                        <option value="Solomon Islands">Solomon Islands</option>
                                        <option value="Somalia">Somalia</option>
                                        <option value="South Africa">South Africa</option>
                                        <option value="South Korea">South Korea</option>
                                        <option value="South Sudan">South Sudan</option>
                                        <option value="Spain">Spain</option>
                                        <option value="Sri Lanka">Sri Lanka</option>
                                        <option value="Sudan">Sudan</option>
                                        <option value="Suriname">Suriname</option>
                                        <option value="Sweden">Sweden</option>
                                        <option value="Switzerland">Switzerland</option>
                                        <option value="Syria">Syria</option>
                                        <option value="Taiwan">Taiwan</option>
                                        <option value="Tajikistan">Tajikistan</option>
                                        <option value="Tanzania">Tanzania</option>
                                        <option value="Thailand">Thailand</option>
                                        <option value="Togo">Togo</option>
                                        <option value="Tonga">Tonga</option>
                                        <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                                        <option value="Tunisia">Tunisia</option>
                                        <option value="Turkey">Turkey</option>
                                        <option value="Turkmenistan">Turkmenistan</option>
                                        <option value="Tuvalu">Tuvalu</option>
                                        <option value="Uganda">Uganda</option>
                                        <option value="Ukraine">Ukraine</option>
                                        <option value="United Arab Emirates">United Arab Emirates</option>
                                        <option value="United Kingdom">United Kingdom</option>
                                        <option value="United States">United States</option>
                                        <option value="Uruguay">Uruguay</option>
                                        <option value="Uzbekistan">Uzbekistan</option>
                                        <option value="Vanuatu">Vanuatu</option>
                                        <option value="Vatican City">Vatican City</option>
                                        <option value="Venezuela">Venezuela</option>
                                        <option value="Vietnam">Vietnam</option>
                                        <option value="Yemen">Yemen</option>
                                        <option value="Zambia">Zambia</option>
                                        <option value="Zimbabwe">Zimbabwe</option>
                                    </select>
                                    </div>
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


     const { user } = useAuth(); // Get the current user
     const isCandidate = user?.roles?.includes('candidate'); // Check if user has 'candidate' role

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
                            {isCandidate && (
                                <li className="nav-item candidate-tab">
                                    <button className={`nav-link ${activeTab === 'candidate' ? 'active' : ''}`} onClick={() => setActiveTab('candidate')}>Candidate Profile</button>
                                </li>
                            )}

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

                                    {isCandidate && activeTab === 'candidate' && (
                                        <CandidateProfileTab showNotice={showNotice} notice={notice} />
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