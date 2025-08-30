import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';

function SignupPage() {
    const { assets_url, api_base_url, nonce } = window.jpbd_object;
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${api_base_url}auth/register`,
                {
                    fullName,
                    email,
                    password,
                },
                {
                    headers: {
                        'X-WP-Nonce': nonce,
                    },
                }
            );

            setSuccessMessage(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('An unknown error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="row form-area g-0">
                {/* Left Panel */}
                <div className="col-lg-6 order-lg-1 order-2 auth-left-panel">
                    <div className="stats-box">
                        <img src={`${assets_url}images/icons/stat-vector.svg`} className="mb-4" alt="stat-vector" />
                        <h5>100K+</h5>
                        <p>People got hired</p>
                    </div>
                    <div className="auth-image-wrapper">
                        <img src={`${assets_url}images/bg/register-img.png`} alt="registerImage" />
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
                        <h4 className="form-title">Create an account</h4>

                        {error && <div className="alert alert-danger">{error}</div>}
                        {successMessage && <div className="alert alert-success">{successMessage}</div>}

                        <form onSubmit={handleSignup}>
                            <div className="mb-3 input-wrapper">
                                <i className="ri-user-3-fill"></i>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3 input-wrapper">
                                <i className="ri-mail-fill"></i>
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
                                    className="form-control"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3 input-wrapper">
                                <i className="ri-lock-password-fill"></i>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="d-flex justify-content-start align-items-center mb-4">
                                <div>
                                    <input type="checkbox" className="form-check-input" id="remember" required/>
                                    <label htmlFor="remember" className="form-check-label text--accent">
                                        Agree with <a href="#" className="text--primary-dark fw-semibold">Terms and conditions?</a>
                                    </label>
                                </div>
                            </div>
                            {/* এই বাটনটি ঠিক করা হয়েছে */}
                            <button type={loading ? 'button' : 'submit'} className="i-btn btn--primary btn--xl w-100 rounded-pill" disabled={loading}>
                                {loading ? 'Signing Up...' : 'Sign Up'}
                            </button>
                            <div className="text-center">
                                <span className="or-signin">Or sign up with</span>
                            </div>
                            <div className="d-flex gap-3 social-login-wrap">
                                <div className="social-login">
                                    <img src={`${assets_url}images/icons/google.png`} alt="" /><span>Google</span>
                                </div>
                                <div className="social-login">
                                    <img src={`${assets_url}images/icons/linkedin.png`} alt="" /><span>LinkedIn</span>
                                </div>
                            </div>
                            <div className="have-account">
                                <p className="text--accent fw-semibold">Already have an account? <Link className="text--primary-dark" to="/login">Login</Link></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}

export default SignupPage;