// src/components/dashboard/OpportunityChart.jsx

import React, { useEffect, useState, useRef, memo } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const { api_base_url } = window.jpbd_object || {};

// Helper Function to format numbers safely
const formatNumber = (num) => {
    // null বা undefined হলে '0' রিটার্ন করা
    if (num === null || num === undefined) return '0';
    // যদি সংখ্যাটি 0 হয়, তাহলে '0' রিটার্ন করা
    if (num === 0) return '0';
    
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
            if (!authLoading) setLoading(false);
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
    }, [user, token, authLoading, api_base_url]);

    const isCandidateOrBusiness = user?.roles?.includes('candidate') || user?.roles?.includes('business');

    useEffect(() => {
        let chart;
        
        const chartData = isCandidateOrBusiness ? stats?.chart_candidate : stats?.chart_employer;

        if (
            typeof ApexCharts !== 'undefined' && 
            chartRef.current && 
            chartData?.series && Array.isArray(chartData.series) &&
            chartData?.labels && Array.isArray(chartData.labels)
        ) {
            const chartInstance = ApexCharts.getChartByID(chartRef.current.id);
            if (chartInstance) {
                chartInstance.destroy();
            }
             
            const options = {
                series: chartData.series,
                chart: {
                    height: 265,
                    type: 'area',
                    toolbar: { show: false },
                    zoom: { enabled: false },
                    animations: { enabled: true, easing: 'easeinout', speed: 800 }
                },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2 },
                colors: ['#c18544', '#8A92A6'],
                fill: {
                    type: "gradient",
                    gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 90, 100] }
                },
                xaxis: {
                    type: 'category',
                    categories: chartData.labels,
                    labels: { style: { colors: '#8A92A6' } },
                    axisBorder: { show: false },
                    axisTicks: { show: false }
                },
                yaxis: {
                    labels: {
                        formatter: (val) => Math.round(val)
                    }
                },
                grid: { borderColor: '#f1f1f1', strokeDashArray: 4 },
                legend: { show: false },
                tooltip: { shared: true, intersect: false, theme: 'dark' },
            };
            
            chart = new ApexCharts(chartRef.current, options);
            chart.render();
        }
        
        return () => {
            const chartToDestroy = chartRef.current ? ApexCharts.getChartByID(chartRef.current.id) : null;
            if (chartToDestroy) {
                chartToDestroy.destroy();
            }
        };
    }, [stats, isCandidateOrBusiness]);
    
    // Candidate or Business View (সংশোধিত এবং নিরাপদ)
    const renderCandidateOrBusinessView = () => (
        <div className="i-card-md">
            <div className="card-header">
                <h4 className="card-title">My Progress</h4>
            </div>
            <div className="card-body pt-0">
                <h3 className="fs-72">{formatNumber(stats?.profile_views)}</h3>
                <div id="candidate-business-chart" ref={chartRef} className="apex-chart" style={{ minHeight: '265px' }}></div>
                <div className="stats-container">
                    <div className="stat-box">
                        <div className="label"><span className="dot yellow"></span>Applied</div>
                        <div className="value">{stats?.total_applications ?? 0}</div>
                    </div>
                    <div className="divider"></div>
                    <div className="stat-box">
                        <div className="label"><span className="dot brown"></span>Shortlisted</div>
                        <div className="value">{stats?.shortlisted_count ?? 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Employer View (সংশোধিত এবং নিরাপদ)
    const renderEmployerView = () => (
        <div className="i-card-md">
            <div className="card-header">
                <h4 className="card-title">My Opportunities</h4>
            </div>
            <div className="card-body pt-0">
                <h3 className="fs-100">{stats?.total_opportunities ?? 0}</h3>
                <div id="employer-chart" ref={chartRef} className="apex-chart" style={{ minHeight: '265px' }}></div>
                <div className="stats-container">
                    <div className="stat-box">
                        <div className="label"><span className="dot yellow"></span>Total Views</div>
                        <div className="value">{formatNumber(stats?.total_views)}</div>
                    </div>
                    <div className="divider"></div>
                    <div className="stat-box">
                        <div className="label"><span className="dot brown"></span>Total Applicants</div>
                        <div className="value">{stats?.total_applicants_employer ?? 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );
    
    // Loading State (উন্নত placeholder সহ)
    if (authLoading || loading) {
        return (
            <div className="i-card-md p-4">
                <div className="placeholder-glow">
                    <h4 className="card-title placeholder col-6 mb-4"></h4>
                    <h3 className="fs-72 placeholder col-3"></h3>
                    <div style={{ height: '265px', backgroundColor: '#e9ecef', borderRadius: '8px' }} className="mt-4"></div>
                    <div className="stats-container mt-4">
                        <div className="stat-box placeholder-glow"><span className="placeholder col-8"></span></div>
                        <div className="divider"></div>
                        <div className="stat-box placeholder-glow"><span className="placeholder col-7"></span></div>
                    </div>
                </div>
            </div>
        );
    }

    // No Data State
    if (!stats || (!stats.chart_candidate && !stats.chart_employer)) {
        return (
            <div className="i-card-md p-4 text-center">
                <h4 className="card-title">Statistics</h4>
                <p className="mt-3">No data available to display for your role.</p>
            </div>
        );
    }

    // Render based on user role
    return isCandidateOrBusiness ? renderCandidateOrBusinessView() : renderEmployerView();
});

export default OpportunityChart;