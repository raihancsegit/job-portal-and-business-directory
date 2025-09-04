import React, { useState,useEffect  } from 'react';
import './admin-style.css'; // স্টাইলিং এর জন্য CSS ফাইল
import axios from 'axios'; // axios ইম্পোর্ট করুন

// সাইডবার কম্পোনেন্ট (অপরিবর্তিত)
const Sidebar = ({ activeTab, setActiveTab }) => {
    return (
        <div className="jpbd-admin-sidebar">
            <h2 className="jpbd-sidebar-title">Settings</h2>
            <ul>
                <li className={activeTab === 'social_login' ? 'active' : ''}>
                    <a href="#social_login" onClick={(e) => { e.preventDefault(); setActiveTab('social_login'); }}>
                        Social Login
                    </a>
                </li>
                <li className={activeTab === 'backgrounds' ? 'active' : ''}>
                    <a href="#backgrounds" onClick={(e) => { e.preventDefault(); setActiveTab('backgrounds'); }}>
                        Page Backgrounds
                    </a>
                </li>
            </ul>
        </div>
    );
};

// সোশ্যাল লগইন সেটিংস কম্পোনেন্ট (উন্নত)
const SocialLoginSettings = ({ settings, setSettings, handleSave }) => {
    
    // ইনপুট ফিল্ড পরিবর্তনের জন্য একটি জেনেরিক হ্যান্ডলার
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // পেজ রিলোড বন্ধ করুন
        handleSave(settings, 'Social login settings saved successfully!');
    };

    return (
        <div>
            <h2>Social Login Settings</h2>
            <p>Configure Google and LinkedIn API keys here. Get your keys from their respective developer consoles.</p>
            <form onSubmit={handleSubmit}>
                <h3 className="jpbd-settings-subtitle">Google</h3>
                <table className="form-table">
                    <tbody>
                        <tr>
                            <th scope="row">Enable Google Login</th>
                            <td>
                                <label htmlFor="googleEnabled">
                                    <input type="checkbox" id="googleEnabled" name="googleEnabled" checked={settings.googleEnabled} onChange={handleChange} />
                                    <span>Yes</span>
                                </label>
                            </td>
                        </tr>
                        {settings.googleEnabled && (
                            <>
                                <tr>
                                    <th scope="row"><label htmlFor="googleClientId">Google Client ID</label></th>
                                    <td><input type="text" id="googleClientId" name="googleClientId" value={settings.googleClientId} onChange={handleChange} className="regular-text" placeholder="Enter your Google Client ID" /></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label htmlFor="googleClientSecret">Google Client Secret</label></th>
                                    <td><input type="password" id="googleClientSecret" name="googleClientSecret" value={settings.googleClientSecret} onChange={handleChange} className="regular-text" placeholder="Enter your Google Client Secret" /></td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>

                <h3 className="jpbd-settings-subtitle">LinkedIn</h3>
                 <table className="form-table">
                    <tbody>
                        <tr>
                            <th scope="row">Enable LinkedIn Login</th>
                            <td>
                                <label htmlFor="linkedinEnabled">
                                    <input type="checkbox" id="linkedinEnabled" name="linkedinEnabled" checked={settings.linkedinEnabled} onChange={handleChange} />
                                    <span>Yes</span>
                                </label>
                            </td>
                        </tr>
                        {settings.linkedinEnabled && (
                            <>
                                <tr>
                                    <th scope="row"><label htmlFor="linkedinClientId">LinkedIn Client ID</label></th>
                                    <td><input type="text" id="linkedinClientId" name="linkedinClientId" value={settings.linkedinClientId} onChange={handleChange} className="regular-text" placeholder="Enter your LinkedIn Client ID" /></td>
                                </tr>
                                <tr>
                                    <th scope="row"><label htmlFor="linkedinClientSecret">LinkedIn Client Secret</label></th>
                                    <td><input type="password" id="linkedinClientSecret" name="linkedinClientSecret" value={settings.linkedinClientSecret} onChange={handleChange} className="regular-text" placeholder="Enter your LinkedIn Client Secret" /></td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>

                <p className="submit">
                    <button type="submit" className="button button-primary">Save Social Login Settings</button>
                </p>
            </form>
        </div>
    );
};

// ব্যাকগ্রাউন্ড সেটিংস কম্পোনেন্ট (সম্পূর্ণ নতুন)
const BackgroundSettings = ({ settings, setSettings, handleSave }) => {
    const [activeBgTab, setActiveBgTab] = useState('login');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        handleSave(settings, 'Background settings saved successfully!');
    };

    const tabs = {
        login: { title: 'Login Page', image: 'loginBgImage', color: 'loginBgColor' },
        signup: { title: 'Signup Page', image: 'signupBgImage', color: 'signupBgColor' },
        forgot: { title: 'Forget Password Page', image: 'forgotBgImage', color: 'forgotBgColor' },
    };

    const currentTab = tabs[activeBgTab];

    return (
        <div>
            <h2>Page Background Settings</h2>
            <p>Upload or set colors for Login, Signup, and Forget Password pages.</p>
            
            <div className="jpbd-subnav-wrapper">
                {Object.keys(tabs).map(tabKey => (
                     <button 
                        key={tabKey}
                        className={`jpbd-subnav-tab ${activeBgTab === tabKey ? 'active' : ''}`}
                        onClick={() => setActiveBgTab(tabKey)}
                    >
                        {tabs[tabKey].title}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                <table className="form-table">
                    <tbody>
                        <tr>
                            <th scope="row">
                                <label htmlFor={currentTab.image}>{currentTab.title} Background Image</label>
                            </th>
                            <td>
                                <input type="text" id={currentTab.image} name={currentTab.image} value={settings[currentTab.image]} onChange={handleChange} className="regular-text" placeholder="Enter image URL or use media library" />
                                <button type="button" className="button">Upload Image</button>
                            </td>
                        </tr>
                         <tr>
                            <th scope="row">
                                <label htmlFor={currentTab.color}>{currentTab.title} Background Color</label>
                            </th>
                            <td>
                                <input type="color" id={currentTab.color} name={currentTab.color} value={settings[currentTab.color]} onChange={handleChange} className="jpbd-color-picker" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                 <p className="submit">
                    <button type="submit" className="button button-primary">Save Background Settings</button>
                </p>
            </form>
        </div>
    );
};

// মূল অ্যাডমিন পেজ কম্পোনেন্ট
// মূল অ্যাডমিন পেজ কম্পোনেন্ট
function SettingsPage() {
    const [activeTab, setActiveTab] = useState('social_login');
    const [settings, setSettings] = useState(null); // প্রাথমিক state হবে null
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState({ message: '', type: '' });

    // PHP থেকে পাঠানো আমাদের নতুন এবং নির্ভরযোগ্য অবজেক্ট
    const { api_url, nonce } = window.jpbd_admin_object || {};

    useEffect(() => {
        const fetchSettings = async () => {
            if (!nonce) {
                console.error("Nonce is missing. Cannot fetch settings.");
                setNotice({ message: 'Error: Security token is missing.', type: 'error' });
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get(`${api_url}settings`, {
                    headers: { 'X-WP-Nonce': nonce }, // আমাদের নতুন Nonce ব্যবহার করা হচ্ছে
                });
                setSettings(response.data);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                setNotice({ message: 'Error: Could not load settings.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (updatedSettings, successMessage) => {
        if (!nonce) {
            console.error("Nonce is missing. Cannot save settings.");
            setNotice({ message: 'Error: Security token is missing.', type: 'error' });
            return;
        }
        setNotice({ message: 'Saving...', type: 'info' });
        try {
            await axios.post(`${api_url}settings`, updatedSettings, {
                headers: { 'X-WP-Nonce': nonce }, // আমাদের নতুন Nonce ব্যবহার করা হচ্ছে
            });
            setNotice({ message: successMessage, type: 'success' });
        } catch (error) {
            console.error("Failed to save settings:", error);
            setNotice({ message: 'Error: Could not save settings.', type: 'error' });
        }
        setTimeout(() => setNotice({ message: '', type: '' }), 4000);
    };

    if (loading) {
        return <div className="wrap"><h1>Loading Settings...</h1></div>;
    }

    return (
        <div className="wrap jpbd-admin-wrap">
            <h1>Job Portal & Business Directory</h1>
            {notice.message && (
                <div className={`notice is-dismissible notice-${notice.type}`}>
                    <p>{notice.message}</p>
                </div>
            )}
            <div className="jpbd-admin-layout">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="jpbd-admin-content">
                    {/* settings লোড হওয়ার পরেই কম্পোনেন্ট রেন্ডার হবে */}
                    {settings && activeTab === 'social_login' && (
                        <SocialLoginSettings 
                            settings={settings} 
                            setSettings={setSettings} 
                            handleSave={handleSave} 
                        />
                    )}
                    {settings && activeTab === 'backgrounds' && (
                        <BackgroundSettings 
                            settings={settings} 
                            setSettings={setSettings} 
                            handleSave={handleSave} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
