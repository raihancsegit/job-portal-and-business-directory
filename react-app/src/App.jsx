import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PasswordSuccessPage from './pages/PasswordSuccessPage';
import CreateOpportunityPage from './pages/dashboard/CreateOpportunityPage';
// Dashboard Components
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import SettingsPage from './pages/dashboard/SettingsPage';
import OpportunityDetailsPage from './pages/dashboard/OpportunityDetailsPage';
import OpportunitiesPage from './pages/dashboard/OpportunitiesPage';
import UpdateOpportunityPage from './pages/dashboard/UpdateOpportunityPage';
// This is your ROUTER. It decides which page to show based on the URL.
function App() {
  const basename = window.jpbd_object?.page_slug || ''; // Use optional chaining for safety
  
  return (
    <BrowserRouter basename={`/${basename}`}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/signup" element={<SignupPage />} /> */}
         <Route path="/signup/:role" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/password-success" element={<PasswordSuccessPage />} />
        {/* Protected Routes */}
        {/* === Protected Dashboard Routes (Uses DashboardLayout) === */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} handle={{ title: 'Dashboard' }}/>
          <Route path="settings" element={<SettingsPage />} handle={{ title: 'Settings' }}/>
          <Route path="create-opportunity" element={<CreateOpportunityPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} handle={{ title: 'Opportunities' }} />
          <Route path="opportunities-list" element={<OpportunitiesPage />}  handle={{ title: 'Opportunities List' }}/>
          <Route path="opportunities/:id" element={<OpportunityDetailsPage />} /> 
           <Route path="update-opportunity/:id" element={<UpdateOpportunityPage />} />
        </Route>

        {/* Default route should be the login page */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;