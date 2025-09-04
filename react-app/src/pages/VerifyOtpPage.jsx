import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';

function VerifyOtpPage() {
    // WordPress এবং Router থেকে ডেটা আনা
    const { assets_url, api_base_url, nonce } = window.jpbd_object;
    const navigate = useNavigate();
    const location = useLocation();
    
    // আগের পেজ থেকে পাঠানো ইমেল অ্যাড্রেসটি গ্রহণ করা
    const email = location.state?.email;

    // State ম্যানেজমেন্ট
    const [otp, setOtp] = useState(new Array(6).fill("")); // আপনার ডিজাইনে ৪টি ইনপুট আছে
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    // প্রতিটি ইনপুট বক্সের জন্য রেফারেন্স
    const inputRefs = useRef([]);

    useEffect(() => {
        // যদি কোনো কারণে ইমেল না পাওয়া যায়, তাহলে ব্যবহারকারীকে আগের পেজে ফেরত পাঠানো
        if (!email) {
            navigate('/forgot-password');
        }
        // পেজ লোড হলে প্রথম ইনপুট বক্সে ফোকাস করা
        inputRefs.current[0]?.focus();
    }, [email, navigate]);

    // OTP ইনপুট পরিবর্তনের হ্যান্ডলার
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false; // শুধু সংখ্যা ইনপুট হবে

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // পরের ইনপুট বক্সে অটো-ফোকাস
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
    };

    // Backspace চাপলে আগের বক্সে ফিরে যাওয়ার হ্যান্ডলার
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
            e.target.previousSibling.focus();
        }
    };
    
    // OTP ভেরিফাই করার জন্য API কল
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const token = otp.join("");
        
        if (token.length < 6) {
            setError("Please enter the complete 4-digit code.");
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await axios.post(
                `${api_base_url}auth/verify-token`,
                { email, token },
                { headers: { 'X-WP-Nonce': nonce } }
            );

            setMessage("Code verified successfully! Redirecting...");
            
            // সফল হলে, Reset Password পেজে রিডাইরেক্ট করা
            setTimeout(() => {
                navigate('/reset-password', { state: { email, token } });
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
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
                    <div className="auth-image-wrapper otp-image">
                        <img src={`${assets_url}images/bg/otp-bg.png`} alt="otp-bg" />
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
                            <img src={`${assets_url}images/icons/otp-vector.png`} alt="otp-vector" />
                        </div>
                        <div className="text-center mb-30">
                            <h4 className="form-title mb-2">Enter Your Code</h4>
                            {email && <p>We sent a code to <b className="text-black">{email}</b></p>}
                        </div>

                        {error && <div className="alert alert-danger mb-3">{error}</div>}
                        {message && <div className="alert alert-success mb-3">{message}</div>}

                        <form onSubmit={handleVerifyOtp}>
                            <div className="otp-wrapper">
                                {otp.map((data, index) => {
                                    return (
                                        <input
                                            key={index}
                                            type="text"
                                            maxLength="1"
                                            className="otp-input"
                                            value={data}
                                            onChange={e => handleChange(e.target, index)}
                                            onKeyDown={e => handleKeyDown(e, index)}
                                            ref={el => inputRefs.current[index] = el}
                                        />
                                    );
                                })}
                            </div>
                            <div className="have-account">
                                <p className="text--accent fw-semibold mb-30">
                                    Didn’t get the code?
                                    <a className="text--primary ms-1" href="#">Resend?</a>
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="i-btn btn--primary btn--xl w-100 rounded-pill"
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Continue'}
                            </button>
                            <div className="text-center">
                                <Link to="/forgot-password" className="i-btn btn--outline btn--xl rounded-pill min-w-150 mt-3">
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

export default VerifyOtpPage;