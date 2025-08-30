import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

function LoginPage() {
    const { assets_url } = window.jpbd_object;

    return (
        <AuthLayout>
            <div className="row form-area g-0">
                {/* Left Panel */}
                <div className="col-lg-6 order-lg-1 order-2 auth-left-panel img--adjust"
                    style={{ backgroundImage: `url('${assets_url}images/bg/auth-bg.png')` }}>
                    <div className="stats-box">
                        <img src={`${assets_url}images/icons/stat-vector.svg`} className="mb-4" alt="stat-vector" />
                        <h5>100K+</h5>
                        <p>People got hired</p>
                    </div>
                    <div className="auth-image-wrapper">
                        <img src={`${assets_url}images/bg/login-img.png`} className="img-fluid" alt="login Image" />
                    </div>
                    <div className="testimonial-box">
                        <div className="testi-image">
                            <img src={`${assets_url}images/bg/testi-author-1.png`} alt="" />
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
                    <div className="auth-form-wrapper">
                        <h4 className="form-title">Login Your Account</h4>
                        <form action="#">
                            <div className="mb-3 input-wrapper">
                                <i className="ri-user-3-fill"></i>
                                <input type="email" className="form-control" placeholder="Email Address" />
                            </div>
                            <div className="mb-3 input-wrapper">
                                <i className="ri-lock-password-fill"></i>
                                <input type="password" id="password" className="form-control" placeholder="Password" />
                                <i id="togglePassword" className="ri-eye-fill toggle-eye"></i>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                                <div className="form-check form-switch">
                                    <input type="checkbox" className="form-check-input mt-1" id="remember" />
                                    <label htmlFor="remember" className="form-check-label text--accent remember-label">Remember me</label>
                                </div>
                                <a href="#" className="text--accent fw-semibold">Forget password?</a>
                            </div>
                            <button type="submit" className="i-btn btn--primary btn--xl w-100 rounded-pill">LOGIN</button>
                            <div className="text-center">
                                <span className="or-signin">Or sign in with</span>
                            </div>
                            <div className="d-flex flex-wrap gap-3 social-login-wrap">
                                <div className="social-login">
                                    <img src={`${assets_url}images/icons/google.png`} alt="" /><span>Google</span>
                                </div>
                                <div className="social-login">
                                    <img src={`${assets_url}images/icons/linkedin.png`} alt="" /><span>LinkedIn</span>
                                </div>
                            </div>
                            <div className="have-account">
                                <p className="text--accent fw-semibold">Don’t have an account? <Link className="text--primary" to="/signup">Signup</Link></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

export default LoginPage;