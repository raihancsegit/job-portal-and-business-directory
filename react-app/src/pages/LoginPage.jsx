import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const { assets_url, api_base_url, nonce } = window.jpbd_object;
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const togglePasswordVisibility = () => {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.getElementById('togglePassword');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('ri-eye-fill');
            toggleIcon.classList.add('ri-eye-off-fill');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('ri-eye-off-fill');
            toggleIcon.classList.add('ri-eye-fill');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(
                `${api_base_url}auth/login`,
                { email, password },
                { headers: { 'X-WP-Nonce': nonce } }
            );
            
            const { token, ...userData } = response.data;
            login(userData, token);
            navigate('/dashboard');

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // 1. ব্যাকএন্ড থেকে গুগলের অথেনটিকেশন URL-টি আনা
            const response = await axios.get(`${api_base_url}auth/google/initiate`);
            const { auth_url } = response.data;
            
            // 2. ব্যবহারকারীকে ওই URL-এ রিডাইরেক্ট করা
            window.location.href = auth_url;
        } catch (error) {
            console.error("Failed to initiate Google login", error);
        }
    };

    const handleLinkedInLogin = async () => {
        try {
            const response = await axios.get(`${api_base_url}auth/linkedin/initiate`);
            window.location.href = response.data.auth_url;
        } catch (error) {
            console.error("Failed to initiate LinkedIn login", error);
        }
    };

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
                
                {/* Right Panel (সম্পূর্ণ কোড) */}
                <div className="col-lg-6 order-lg-2 order-1 auth-right-panel">
                    <div className="blur-bg"></div>
                    <div className="blur-bg-2"></div>
                    <div className="auth-form-wrapper">
                        <h4 className="form-title">Login Your Account</h4>

                        {error && <div className="alert alert-danger">{error}</div>}

                        <form onSubmit={handleLogin}>
                            <div className="mb-3 input-wrapper">
                                <i className="ri-user-3-fill"></i>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    placeholder="Email Address" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3 input-wrapper">
                                <i className="ri-lock-password-fill"></i>
                                <input 
                                    type="password" 
                                    id="password"
                                    className="form-control" 
                                    placeholder="Password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                               <i id="togglePassword" className="ri-eye-fill toggle-eye" onClick={togglePasswordVisibility}></i>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                                <div className="form-check form-switch">
                                    <input type="checkbox" className="form-check-input mt-1" id="remember" />
                                    <label htmlFor="remember" className="form-check-label text--accent remember-label">Remember me</label>
                                </div>
                                <a href="#" className="text--accent fw-semibold">Forget password?</a>
                            </div>
                            <button type={loading ? 'button' : 'submit'} className="i-btn btn--primary btn--xl w-100 rounded-pill" disabled={loading}>
                                {loading ? 'Logging in...' : 'LOGIN'}
                            </button>
                            <div className="text-center">
                                <span className="or-signin">Or sign in with</span>
                            </div>
                            <div className="d-flex flex-wrap gap-3 social-login-wrap">
                                <div className="social-login" onClick={handleGoogleLogin}>
                                    <img src={`${assets_url}images/icons/google.png`} alt="" /><span>Google</span>
                                </div>
                                <div className="social-login" onClick={handleLinkedInLogin}>
                                    <img src={`${assets_url}images/icons/linkedin.png`} alt="" /><span>LinkedIn</span>
                                </div>
                            </div>
                            <div className="have-account">
                                <p className="text--accent fw-semibold">
                                    Don’t have an account? <Link className="text--primary" to="/signup">Signup</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

export default LoginPage;