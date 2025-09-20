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
                        <NavLink className="sidebar-menu-link" to="/dashboard/business-directory">
                            <span><svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                             <path d="M4.88889 1H15M4.88889 7H15M4.88889 13H15M1 1H1.00778M1 7H1.00778M1 13H1.00778" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                        </svg></span>
                            <p>Directory</p>
                        </NavLink>
                    </li>

                     <li className="sidebar-menu-item">
                        <NavLink className="sidebar-menu-link" to="/dashboard/community">
                            <span>
                                        <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                             <circle cx="3.0639" cy="3.0639" r="3.0639" transform="matrix(-1 0 0 1 13.2535 1)" stroke-width="1.25"></circle>
                                             <path d="M4.82703 11.674C4.82703 11.015 5.24131 10.4271 5.86193 10.2055V10.2055C8.66 9.20618 11.7177 9.20618 14.5158 10.2055V10.2055C15.1364 10.4271 15.5507 11.015 15.5507 11.674V12.6817C15.5507 13.5912 14.7451 14.2899 13.8447 14.1613L13.5445 14.1184C11.3187 13.8004 9.05901 13.8004 6.83322 14.1184L6.53301 14.1613C5.63261 14.2899 4.82703 13.5912 4.82703 12.6817V11.674Z" stroke-width="1.25"></path>
                                             <path d="M14.7859 7.21216C16.1154 7.21216 17.1932 6.13435 17.1932 4.80481C17.1932 3.47527 16.1154 2.39746 14.7859 2.39746" stroke-width="1.25" stroke-linecap="round"></path>
                                             <path d="M17.4227 12.7049L17.6586 12.7386C18.366 12.8396 18.999 12.2907 18.999 11.576V10.7843C18.999 10.2665 18.6735 9.80462 18.1858 9.63046C17.6994 9.45674 17.203 9.32146 16.701 9.22461" stroke-width="1.25" stroke-linecap="round"></path>
                                             <path d="M5.21094 7.21216C3.8814 7.21216 2.80359 6.13435 2.80359 4.80481C2.80359 3.47527 3.8814 2.39746 5.21094 2.39746" stroke-width="1.25" stroke-linecap="round"></path>
                                             <path d="M2.57317 12.7049L2.33729 12.7386C1.62983 12.8396 0.996876 12.2907 0.996876 11.576V10.7843C0.996876 10.2665 1.32238 9.80462 1.81001 9.63046C2.29643 9.45674 2.79283 9.32146 3.2948 9.22461" stroke-width="1.25" stroke-linecap="round"></path>
                                        </svg>

                                   </span>
                            <p>Community</p>
                        </NavLink>
                    </li>

                    <li className="sidebar-menu-item">
                        <NavLink className="sidebar-menu-link" to="/dashboard/event">
                            <span>
                                    <span>
                                        <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                             <path d="M15 8.39979C15 7.29579 15.896 6.39979 17 6.39979V5.59979C17 2.39979 16.2 1.59979 13 1.59979H5C1.8 1.59979 1 2.39979 1 5.59979V5.99979C2.104 5.99979 3 6.89579 3 7.99979C3 9.10379 2.104 9.99979 1 9.99979V10.3998C1 13.5998 1.8 14.3998 5 14.3998H13C16.2 14.3998 17 13.5998 17 10.3998C15.896 10.3998 15 9.50379 15 8.39979Z" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                             <path d="M7.40015 1.59979L7.40015 14.3998" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="5 5"></path>
                                        </svg>

                                   </span>

                                   </span>
                            <p>Event</p>
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