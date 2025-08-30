import React from 'react';

// আপনার আগের App.css ইম্পোর্ট করতে পারেন যদি কোনো স্টাইল থাকে
// import './App.css' 

// আমরা App ফাংশনটির নাম পরিবর্তন করে LoginPage রাখছি
// এবং এটিই হবে এই ফাইলের একমাত্র ডিফল্ট এক্সপোর্ট
function App() {
  // WordPress থেকে asset path ডাইনামিকভাবে পাওয়ার জন্য আমরা wp_localize_script ব্যবহার করব
  // এবং window.jpbd_object থেকে এটি অ্যাক্সেস করব।
  const assetBaseUrl = window.jpbd_object.assets_url;

  return (
    <div className="form-section">
      <div className="container-fluid px-0">
        <div className="row form-area g-0">
          {/* Left Panel */}
          <div className="col-lg-6 left-panel img--adjust" style={{ backgroundImage: `url('${assetBaseUrl}images/bg/auth-bg.png')` }}>
            <div className="stats-box">
              <i className="bi bi-bar-chart"></i>
              <h5>100K+</h5>
              <p>People got hired</p>
            </div>
            <div className="auth-image-wrapper">
              <img src={`${assetBaseUrl}images/bg/login-img.png`} alt="User Image" />
            </div>
            <div className="testimonial-box">
              <h6>John Milton</h6>
              <span>Lead Engineer at Canva</span>
              <h5>“Great platform for the job seeker that searching for new career heights.”</h5>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-lg-6 right-panel">
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
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <input type="checkbox" className="form-check-input" id="remember" />
                    <label htmlFor="remember" className="form-check-label text--accent">Remember me</label>
                  </div>
                  <a href="#" className="text--accent fw-semibold">Forget password?</a>
                </div>
                <button type="submit" className="i-btn btn--primary btn--lg w-100 rounded-pill">LOGIN</button>
                <div className="text-center">
                  <span className="or-signin">Or sign in with</span>
                </div>
                <div className="d-flex gap-3 social-login-wrap">
                  <div className="social-login">
                    <img src={`${assetBaseUrl}images/icons/google.png`} alt="" /><span>Google</span>
                  </div>
                  <div className="social-login">
                    <img src={`${assetBaseUrl}images/icons/linkedin.png`} alt="" /><span>LinkedIn</span>
                  </div>
                </div>
                <div className="have-account">
                  <p className="text--accent fw-semibold">Don’t have an account? <a className="text--primary"
                      href="signup.html">Signup</a></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// এটিই এই ফাইলের একমাত্র ডিফল্ট এক্সপোর্ট
export default App;