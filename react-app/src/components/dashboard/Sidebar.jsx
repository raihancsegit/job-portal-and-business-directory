import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Sidebar() {
    const { assets_url } = window.jpbd_object;

    const { user } = useAuth(); // ২. AuthContext থেকে ইউজার নিন

    // ৩. ব্যবহারকারীর রোল থেকে একটি সুন্দর নাম তৈরি করার জন্য হেল্পার ফাংশন
    const getRoleDisplayName = () => {
        if (!user || !user.roles || user.roles.length === 0) {
            return 'User';
        }
        // আমরা প্রথম রোলটিকেই প্রধান রোল হিসেবে ধরব
        const role = user.roles[0];
        // 'job_seeker'-কে 'Job Seeker'-এ রূপান্তর করা
        return role.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
    };

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <NavLink to="/dashboard">
                    <img src={`${assets_url}images/icons/logo/logo.svg`} alt="Logo" />
                </NavLink>
            </div>
            <div className="sidebar-menu-container" data-simplebar>
                <div className="sidebar-profile">
                    <div className="image">
                        {/* ডাইনামিক প্রোফাইল ছবি */}
                        <img 
                            src={user?.avatar_url || `${assets_url}images/bg/sidebar-profile.png`} 
                            alt="sidebar-profile" 
                        />
                    </div>
                    <div className="content">
                        {/* ডাইনামিক রোল */}
                        <h4>{getRoleDisplayName()}</h4>
                        <span>Current Profile</span>
                    </div>
                </div>
                <ul className="sidebar-menu">
                    <li className="sidebar-menu-item">
                        <NavLink className="sidebar-menu-link" to="/dashboard" end>
                            <span><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.3994 15H16.1996" strokeWidth="1.25" strokeLinecap="round" /><path d="M11.3994 11.8008H16.1996" strokeWidth="1.25" strokeLinecap="round" /><path d="M7.80031 15.2155V11.9833C7.80031 10.7112 7.28829 10.1992 6.01623 10.1992H2.78408C1.51202 10.1992 1 10.7112 1 11.9833V15.2155C1 16.4875 1.51202 16.9995 2.78408 16.9995H6.01623C7.28829 16.9995 7.80031 16.4875 7.80031 15.2155Z" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.80031 6.21624V2.58407C7.80031 1.45602 7.28829 1 6.01623 1H2.78408C1.51202 1 1 1.45602 1 2.58407V6.20824C1 7.34429 1.51202 7.79231 2.78408 7.79231H6.01623C7.28829 7.80031 7.80031 7.34429 7.80031 6.21624Z" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.9995 6.01623V2.78408C16.9995 1.51202 16.4875 1 15.2155 1H11.9833C10.7112 1 10.1992 1.51202 10.1992 2.78408V6.01623C10.1992 7.28829 10.7112 7.80031 11.9833 7.80031H15.2155C16.4875 7.80031 16.9995 7.28829 16.9995 6.01623Z" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                            <p>Dashboard</p>
                        </NavLink>
                    </li>
                    <li className="sidebar-menu-item">
                        <NavLink className="sidebar-menu-link" to="/dashboard/opportunities">
                            <span><svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.999756 6.00018C0.999756 4.89562 1.89519 4.00018 2.99976 4.00018H16.9998C18.1043 4.00018 18.9998 4.89561 18.9998 6.00018V8.28982C18.9998 9.12774 18.4774 9.87683 17.6912 10.1665L11.3826 12.4907C10.49 12.8196 9.50949 12.8196 8.61693 12.4907L2.30835 10.1665C1.52209 9.87683 0.999756 9.12774 0.999756 8.28982V6.00018Z" strokeWidth="1.25" /><path d="M9.99976 9.56993L9.99976 7.85565" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /><path d="M0.999756 8.00018L0.999756 14.0002C0.999756 16.2093 2.79062 18.0002 4.99976 18.0002H14.9998C17.2089 18.0002 18.9998 16.2093 18.9998 14.0002V8.00018" strokeWidth="1.25" /><path d="M13.3334 4.42873V3.00018C13.3334 1.89561 12.438 1.00018 11.3334 1.00018H8.66675C7.56218 1.00018 6.66675 1.89561 6.66675 3.00018L6.66675 4.42873" strokeWidth="1.25" /></svg></span>
                            <p>Opportunities</p>
                        </NavLink>
                    </li>
                    <li className="sidebar-menu-item">
                        <NavLink className="sidebar-menu-link" to="/dashboard/settings">
                             <span><svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 6.66228V11.3296C1 13.0445 1 13.0445 2.55556 14.1365L6.83333 16.7088C7.47889 17.0971 8.52889 17.0971 9.16667 16.7088L13.4444 14.1365C15 13.0445 15 13.0445 15 11.3377V6.66228C15 4.95551 15 4.95551 13.4444 3.8635L9.16667 1.2912C8.52889 0.902932 7.47889 0.902932 6.83333 1.2912L2.55556 3.8635C1 4.95551 1 4.95551 1 6.66228Z" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 11C9.10457 11 10 10.1046 10 9C10 7.89543 9.10457 7 8 7C6.89543 7 6 7.89543 6 9C6 10.1046 6.89543 11 8 11Z" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                             <p>Settings</p>
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;