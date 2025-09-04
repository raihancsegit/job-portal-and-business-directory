import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';

function ForgotPasswordPage() {
    // WordPress থেকে পাঠানো অবজেক্ট
    const { assets_url, api_base_url, nonce } = window.jpbd_object;
    const navigate = useNavigate();

    // State ম্যানেজমেন্ট
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // OTP পাঠানোর জন্য API কল হ্যান্ডলার
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post(
                `${api_base_url}auth/request-reset`,
                { email },
                { headers: { 'X-WP-Nonce': nonce } }
            );
            
            setMessage(response.data.message);
            
            // সফলভাবে OTP পাঠানোর পর, ২ সেকেন্ড অপেক্ষা করে OTP ভেরিফিকেশন পেজে পাঠানো হবে
            // আমরা email-টিকে state হিসেবে পাস করছি যাতে পরের পেজ এটি ব্যবহার করতে পারে
            setTimeout(() => {
                navigate('/verify-otp', { state: { email } });
            }, 2000);

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
                    <div className="stats-box">
                        <img src={`${assets_url}images/icons/stat-vector.svg`} className="mb-4" alt="stat-vector" />
                        <h5>100K+</h5>
                        <p>People got hired</p>
                    </div>
                    <div className="auth-image-wrapper forgot-pass">
                        <img src={`${assets_url}images/bg/forget-pass-bg.png`} alt="otp-bg" />
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
                            <img src={`${assets_url}images/icons/forgot-pass-vector.png`} alt="forgot-pass-vector" />
                        </div>
                        <div className="text-center mb-30">
                            <h4 className="form-title mb-2">Forget password</h4>
                            <p>Enter your email address associated with your account</p>
                        </div>

                        {/* Error and Success Message Display */}
                        {error && <div className="alert alert-danger mb-3">{error}</div>}
                        {message && <div className="alert alert-success mb-3">{message}</div>}

                        <form onSubmit={handleSendOtp}>
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
                            <button 
                                type="submit" 
                                className="i-btn btn--primary btn--xl w-100 rounded-pill"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                            <div className="text-center">
                                {/* "Back" বাটনটি ব্যবহারকারীকে লগইন পেজে ফিরিয়ে নিয়ে যাবে */}
                                <Link to="/login" className="i-btn btn--outline btn--xl rounded-pill min-w-150 mt-3">
                                    Back
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

export default ForgotPasswordPage;