// src/components/dashboard/OpportunityChart.jsx

import React, { useEffect, useState, useRef, memo } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const { api_base_url } = window.jpbd_object || {};

// Helper Function to format numbers (e.g., 1200 -> 1.2K)
const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    if (num < 1000) return num.toString();
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
};

const OpportunityChart = memo(() => {
    const chartRef = useRef(null);
    const { user, token, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user || !token) {
            setLoading(false);
            setStats(null);
            return;
        }
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${api_base_url}dashboard/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                setStats(null);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user, token, authLoading]);

    const isCandidateOrBusiness = user?.roles?.includes('candidate') || user?.roles?.includes('business');

    useEffect(() => {
        let chart;
        
        // রোলের উপর ভিত্তি করে সঠিক চার্ট ডেটা বেছে নেওয়া
        const chartData = isCandidateOrBusiness ? stats?.chart_candidate : stats?.chart_employer;

        if (typeof ApexCharts !== 'undefined' && chartRef.current && chartData) {
             const chartInstance = ApexCharts.getChartByID(chartRef.current.id);
             if (chartInstance) chartInstance.destroy();
             
             const options = {
                 series: [{
                     name: isCandidateOrBusiness ? 'Profile Views' : 'Opportunities Posted',
                     data: chartData.series
                 }],
                 chart: {
                     height: 265,
                     type: 'area',
                     toolbar: { show: false },
                     zoom: { enabled: false }
                 },
                 dataLabels: { enabled: false },
                 stroke: { curve: 'smooth', width: 2 },
                 colors: ['#c18544'],
                 fill: {
                     type: "gradient",
                     gradient: { opacityFrom: 0.7, opacityTo: 0.1 }
                 },
                 xaxis: {
                     categories: chartData.labels,
                 },
                 yaxis: {
                     labels: {
                         formatter: (val) => val.toFixed(0)
                     }
                 },
                 tooltip: { x: {} },
             };
             chart = new ApexCharts(chartRef.current, options);
             chart.render();
        }
        
        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    }, [stats, isCandidateOrBusiness]);
    
    // Candidate or Business View
    const renderCandidateOrBusinessView = () => (
        <div className="i-card-md">
            <div className="card-header">
                <h4 className="card-title">Profile Views</h4>
                {/* Future filter dropdown can be placed here */}
            </div>
            <div className="card-body pt-0">
                <h3 className="fs-72">{formatNumber(stats?.profile_views)}</h3>
                <div id="profile-view-chart" ref={chartRef} className="apex-chart" style={{ minHeight: '265px' }}></div>
                <div className="stats-container">
                    <div className="stat-box">
                        <div className="label"><span className="dot yellow"></span>Applied Opportunity</div>
                        <div className="value">{stats?.total_applications || 0}</div>
                    </div>
                    <div className="divider"></div>
                    <div className="stat-box">
                        <div className="label"><span className="dot brown"></span>Shortlisted</div>
                        <div className="value">{stats?.shortlisted_count || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Employer View
    const renderEmployerView = () => (
        <div className="i-card-md">
            <div className="card-header">
                <h4 className="card-title">Total Opportunity Posted</h4>
            </div>
            <div className="card-body pt-0">
                <h3 className="fs-100">{stats?.total_opportunities || 0}</h3>
                <div id="opportunity-chart" ref={chartRef} className="apex-chart" style={{ minHeight: '265px' }}></div>
                <div className="stats-container">
                    <div className="stat-box">
                        <div className="label"><span className="dot yellow"></span>Opportunity Views</div>
                        <div className="value">{formatNumber(stats?.total_views)}</div>
                    </div>
                    <div className="divider"></div>
                    <div className="stat-box">
                        <div className="label"><span className="dot brown"></span>Applicants</div>
                        <div className="value">{stats?.total_applicants_employer || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );
    
    // Loading and Error States
    if (authLoading || loading) {
        return <div className="i-card-md p-4 text-center">Loading Stats...</div>;
    }

    if (!stats) {
        return (
            <div className="i-card-md p-4 text-center">
                <h4 className="card-title">Statistics</h4>
                <p className="mt-3">No data available for your role.</p>
            </div>
        );
    }

    // Render based on user role
    return isCandidateOrBusiness ? renderCandidateOrBusinessView() : renderEmployerView();
});

export default OpportunityChart;