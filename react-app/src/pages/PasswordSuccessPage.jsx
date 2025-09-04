import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

function PasswordSuccessPage() {
    const { assets_url } = window.jpbd_object;

    return (
        <AuthLayout>
            <div className="row form-area g-0">
                {/* Left Panel */}
                <div className="col-lg-6 order-lg-1 order-2 auth-left-panel img--adjust"
                    style={{ backgroundImage: `url('${assets_url}images/bg/auth-bg.png')` }}>
                    <div className="blur-bg-3"></div>
                    <div className="stats-box">
                        <img src={`${assets_url}images/icons/stat-vector.svg`} className="mb-4" alt="stat-vector" />
                        <h5>100K+</h5>
                        <p>People got hired</p>
                    </div>
                    <div className="auth-image-wrapper new-password-image">
                        <img src={`${assets_url}images/bg/password-success-bg.png`} alt="password-success-bg" />
                    </div>
                    <div className="testimonial-box">
                        <div className="testi-image">
                            <img src={`${assets_url}images/bg/testi-author-1.png`} alt="Testimonial Author" />
                        </div>
                        <h6>John Milton</h6>
                        <span>Lead Engineer at Canva</span>
                        <div className="d-flex align-items-start">
                            <span className="testi-quote"><i className="ri-double-quotes-l"></i></span>
                            <h5>“Great platform for the job seeker that searching for new career heights.”</h5>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-lg-6 order-lg-2 order-1 auth-right-panel">
                    <div className="blur-bg"></div>
                    <div className="blur-bg-2"></div>
                    <div className="auth-form-wrapper card-transparent">
                        <div className="auth-vector-top">
                            <img src={`${assets_url}images/icons/success-polygon-vector.png`} alt="success-vector" />
                        </div>
                        <div className="text-center mb-30">
                            <h4 className="form-title mb-2">All Done!</h4>
                            <p>Your password has been reset successfully!</p>
                        </div>
                        {/* বাটনটিকে <Link> কম্পোনেন্টে পরিবর্তন করা হয়েছে */}
                        <Link to="/login" className="i-btn btn--primary btn--xl w-100 rounded-pill">
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

export default PasswordSuccessPage;