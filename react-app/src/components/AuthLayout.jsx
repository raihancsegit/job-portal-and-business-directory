import React from 'react';
import { Link } from 'react-router-dom';

function AuthLayout({ children }) {
    const { assets_url } = window.jpbd_object;

    return (
        <div className="form-section">
            <div className="container-fluid px-0">
                <div className="auth-header">
                    <div className="logo">
                        <Link to="/">
                            <img src={`${assets_url}images/icons/logo/logo.svg`} alt="logo" />
                        </Link>
                    </div>
                    <div className="header-right">
                        <div className="header-link">
                            <Link className="d-flex gap-2" to="/">
                                <img src={`${assets_url}images/icons/home-icon.svg`} alt="" /> <span>Home</span>
                            </Link>
                        </div>
                        <div className="lang-select-wrapper">
                            <i className="ri-global-line"></i>
                            <select className="lang-select" id="langSelect">
                                <option value="EN">EN</option>
                                <option value="BN">BN</option>
                                <option value="UR">UR</option>
                            </select>
                        </div>
                    </div>
                </div>
                {children} {/* এখানে LoginPage বা SignupPage এর বাকি অংশ রেন্ডার হবে */}
            </div>
        </div>
    );
}

export default AuthLayout;