import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
function App() {
  // PHP থেকে পাঠানো পেজের slug-টি পাওয়া
  const basename = window.jpbd_object.page_slug || '';
  
  return (
    // basename হিসেবে slug-টি ব্যবহার করা হচ্ছে
    <BrowserRouter basename={`/${basename}`}>
      <Routes>
        {/* এখন রুটগুলো /job-portal/login, /job-portal/signup হিসেবে কাজ করবে */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

         {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* ভবিষ্যতে আরও সুরক্ষিত রুট এখানে যোগ হবে */}
        </Route>

        {/* ডিফল্ট রুট /job-portal/ */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;