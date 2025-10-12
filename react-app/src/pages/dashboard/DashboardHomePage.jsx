// src/pages/DashboardHomePage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import OpportunityChart from './components/OpportunityChart';
import StatsCards from './components/StatsCards';
import ShortlistedTable from './components/ShortlistedTable';
import OpportunityPostedTable from './components/OpportunityPostedTable';

const { api_base_url } = window.jpbd_object || {};

function DashboardHomePage() {
    const { user, token, loading: authLoading } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // চার্টের জন্য ফিল্টার স্টেট
    const [chartDateRange, setChartDateRange] = useState('last_7_days');
    
    // কেন্দ্রীভূত ডেটা ফেচিং (চার্ট, কার্ডস এবং শর্টলিস্টেড টেবিলের জন্য)
    useEffect(() => {
        if (authLoading || !user || !token) {
            if (!authLoading) setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // API URL-এ date_range প্যারামিটার যোগ করা হয়েছে
                const url = `${api_base_url}dashboard/stats?date_range=${chartDateRange}`;
                const response = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setDashboardData(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                setDashboardData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, token, authLoading, chartDateRange]); // chartDateRange পরিবর্তন হলে আবার ডেটা আনবে

    return (
        <>
            <div className="row g-2 mb-2">
                <div className="col-xl-5">
                    <OpportunityChart 
                        data={dashboardData} 
                        loading={loading || authLoading}
                        dateRange={chartDateRange}
                        setDateRange={setChartDateRange}
                    />
                </div>
                <div className="col-xl-7">
                    <div className="row g-2">
                        <div className="col-12">
                            <StatsCards data={dashboardData} loading={loading || authLoading} />
                        </div>
                        <div className="col-12">
                            <ShortlistedTable data={dashboardData} loading={loading || authLoading} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* OpportunityPostedTable এখন সব রোলের জন্য রেন্ডার হবে */}
            <div className="row">
                <div className="col-lg-12">
                    <OpportunityPostedTable />
                </div>
            </div>
        </>
    );
}

export default DashboardHomePage;