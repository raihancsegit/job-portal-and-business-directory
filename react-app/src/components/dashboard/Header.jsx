import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link,useLocation } from 'react-router-dom';

const getPageTitle = (pathname) => {
    // We get the last part of the URL. e.g., '/dashboard/settings' becomes 'settings'
    const lastSegment = pathname.split('/').pop();

    switch (lastSegment) {
        case 'dashboard':
            return 'Dashboard';
        case 'settings':
            return 'Settings';
        case 'opportunities':
            return 'Opportunities';
        // Add more cases here for future pages
        // e.g., case 'directory': return 'Directory';
        default:
            // If the URL is just /dashboard, the last segment will be 'dashboard'
            // but if it's a route we don't recognize, default to Dashboard.
            if (pathname.includes('/dashboard')) {
                return 'Dashboard';
            }
            return 'Job Portal'; // A final fallback
    }
};


function Header() {
    const { user, logout } = useAuth();
    const location = useLocation(); // Get the current location object
    // Get the dynamic page title using our helper function
    const pageTitle = getPageTitle(location.pathname);
    
   
    const handleLogout = (e) => {
        e.preventDefault();
        logout();
    };

    return (
        <header className="header">
            <div className="d-flex align-items-center justify-content-start gap-lg-3 gap-2">
                <div className="header-icon d-lg-none d-flex">
                    <button className="btn-icon vertical-menu-btn ripple-dark" anim="ripple">
                        <i className="ri-menu-2-line lh-1"></i>
                    </button>
                </div>
                <h4 className="page-title">{pageTitle}</h4>
            </div>
            <div className="d-flex align-items-center gap-lg-3 gap-2">
                <div className="header-icon">
                    <div className="notification-dropdown">
                        <span>5</span>
                        <div className="btn-icon dropdown-toggle ripple-dark" anim="ripple" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="ri-notification-3-line"></i>
                        </div>
                        <div className="dropdown-menu dropdown-menu-end">
                            <div className="dropdown-menu-title">
                                <h6>Notification</h6>
                                <button className="i-badge danger">Clear All</button>
                            </div>
                            <div className="notification-items" data-simplebar>
                                <div className="notification-item">
                                    <span>Today</span>
                                    <ul>
                                        <li>
                                            <a href="#">
                                                <div className="notify-icon">
                                                    <img src="https://coderthemes.com/ubold/layouts/default/assets/images/users/avatar-2.jpg" alt="" />
                                                </div>
                                                <div className="notification-item-content">
                                                    <h5>Cristina Pride <small>1 min ago</small></h5>
                                                    <p>A handful of model sentence structures, to generate Lorem Ipsum which looks reasonable.</p>
                                                </div>
                                                <span><i className="las la-times"></i></span>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="dropdown-menu-footer">
                                <a href="#">View All</a>
                            </div>
                        </div>
                    </div>
                </div>
                {user && user.roles && user.roles.includes('candidate') && (
                <Link to="/dashboard/create-opportunity" className="i-btn btn--xl btn--dark d-lg-flex d-none">
                        Post an opportunity <span><i className="ri-arrow-right-line"></i></span>
                </Link>
                 )}
                <div className="header-icon">
                    <div className="profile-dropdown">
                        <div className="topbar-profile dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src={user?.avatar_url || 'https://themesbrand.com/velzon/html/default/assets/images/users/avatar-3.jpg'}  alt="User Avatar" />
                        </div>
                        <div className="dropdown-menu dropdown-menu-end">
                            <ul>
                                <li><span className="dropdown-item">Welcome {user?.user_display_name}!</span></li>
                                <li><Link className="dropdown-item" to="/dashboard/settings"><i className="lar la-user-circle"></i> My Account</Link></li>
                                <li><Link className="dropdown-item" to="/dashboard/settings"><i className="las la-cog"></i> Settings</Link></li>
                                <li><a className="dropdown-item" href="#"><i className="las la-lock"></i>Lock Screen</a></li>
                                <li><a className="dropdown-item" href="#" onClick={handleLogout}><i className="las la-sign-out-alt"></i> Logout</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;