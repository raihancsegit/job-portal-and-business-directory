import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';

function ResetPasswordPage() {
    // WordPress এবং Router থেকে ডেটা আনা
    const { assets_url, api_base_url, nonce } = window.jpbd_object;
    const navigate = useNavigate();
    const location = useLocation();

    // আগের পেজ থেকে পাঠানো ইমেল এবং টোকেন গ্রহণ করা
    const { email, token } = location.state || {};

    // State ম্যানেজমেন্ট
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // পাসওয়ার্ড টগলের জন্য useRef
    const passwordInputRef = useRef(null);
    const confirmPasswordInputRef = useRef(null);

    useEffect(() => {
        // যদি কোনো কারণে ইমেল বা টোকেন না পাওয়া যায়, তাহলে ব্যবহারকারীকে প্রথম ধাপে ফেরত পাঠানো
        if (!email || !token) {
            navigate('/forgot-password');
        }
    }, [email, token, navigate]);

    // পাসওয়ার্ড টগল করার ফাংশন
    const togglePasswordVisibility = (inputRef) => {
        if (inputRef.current) {
            const input = inputRef.current;
            const icon = input.nextElementSibling; // Assuming icon is the next sibling
            if (input.type === 'password') {
                input.type = 'text';
                icon?.classList.remove('ri-eye-fill');
                icon?.classList.add('ri-eye-off-fill');
            } else {
                input.type = 'password';
                icon?.classList.remove('ri-eye-off-fill');
                icon?.classList.add('ri-eye-fill');
            }
        }
    };

    // নতুন পাসওয়ার্ড সেট করার জন্য API কল
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${api_base_url}auth/reset-password`,
                { email, token, password },
                { headers: { 'X-WP-Nonce': nonce } }
            );

            setMessage(response.data.message);
            
            // সফল হলে, ৩ সেকেন্ড পর লগইন পেজে রিডাইরেক্ট করা
            setTimeout(() => {
                navigate('/password-success');
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                        <img src={`${assets_url}images/bg/new-pass-bg.png`} alt="new-pass-bg" />
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
                            <img src={`${assets_url}images/icons/new-pass-vector.png`} alt="new-pass-vector" />
                        </div>
                        <div className="text-center mb-30">
                            <h4 className="form-title mb-2">Set New Password</h4>
                            <p>Password must be at least 6 characters long</p>
                        </div>

                        {error && <div className="alert alert-danger mb-3">{error}</div>}
                        {message && <div className="alert alert-success mb-3">{message}</div>}

                        <form onSubmit={handleResetPassword}>
                            <div className="mb-3 input-wrapper">
                                <i className="ri-lock-password-fill"></i>
                                <input 
                                    type="password"
                                    ref={passwordInputRef}
                                    className="form-control"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <i 
                                    className="ri-eye-fill toggle-eye"
                                    onClick={() => togglePasswordVisibility(passwordInputRef)}
                                ></i>
                            </div>
                            <div className="mb-3 input-wrapper">
                                <i className="ri-lock-password-fill"></i>
                                <input 
                                    type="password"
                                    ref={confirmPasswordInputRef}
                                    className="form-control"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <i 
                                    className="ri-eye-fill toggle-eye"
                                    onClick={() => togglePasswordVisibility(confirmPasswordInputRef)}
                                ></i>
                            </div>
                            <button 
                                type="submit" 
                                className="i-btn btn--primary btn--xl w-100 rounded-pill"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Set New Password'}
                            </button>
                            <div className="text-center">
                                <Link to="/login" className="i-btn btn--outline btn--xl rounded-pill min-w-150 mt-3">
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

export default ResetPasswordPage;