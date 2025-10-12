// src/components/dashboard/OpportunityChart.jsx

import React, { useEffect, useRef, memo } from 'react';
import { useAuth } from '../../../context/AuthContext';

// Helper Function to format numbers safely
const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    if (num === 0) return '0';
    if (num < 1000) return num.toString();
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
};

// চার্টের জন্য লেবেল ম্যাপিং
const dateRangeLabels = {
    'last_7_days': 'Last 7 Days',
    'last_30_days': 'Last Month',
    'last_year': 'Last Year'
};

const OpportunityChart = memo(({ data, loading, dateRange, setDateRange }) => {
    const chartRef = useRef(null);
    const { user } = useAuth();
    
    const isCandidateOrBusiness = user?.roles?.includes('candidate') || user?.roles?.includes('business');

    useEffect(() => {
        let chart;
        const chartData = isCandidateOrBusiness ? data?.chart_candidate : data?.chart_employer;

        if (
            typeof ApexCharts !== 'undefined' && 
            chartRef.current && 
            chartData?.series && Array.isArray(chartData.series) &&
            chartData?.labels && Array.isArray(chartData.labels) && !loading
        ) {
            const chartInstance = ApexCharts.getChartByID(chartRef.current.id);
            if (chartInstance) chartInstance.destroy();
             
            const options = {
                series: chartData.series,
                chart: { height: 265, type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2 },
                colors: ['#8B592C', '#C18544'], // HTML অনুযায়ী সঠিক কালার
                fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 90, 100] } },
                xaxis: { type: 'category', categories: chartData.labels, labels: { style: { colors: '#8A92A6' } }, axisBorder: { show: false }, axisTicks: { show: false } },
                yaxis: { labels: { formatter: (val) => Math.round(val) } },
                grid: { borderColor: '#C18544', strokeDashArray: 4 },
                legend: { show: false }, // HTML ডিজাইনে লেজেন্ড নিচে আছে, তাই এখানে false
                tooltip: { shared: true, intersect: false, theme: 'dark' },
            };
            
            chart = new ApexCharts(chartRef.current, options);
            chart.render();
        }
        
        return () => {
            const chartToDestroy = chartRef.current ? ApexCharts.getChartByID(chartRef.current.id) : null;
            if (chartToDestroy) chartToDestroy.destroy();
        };
    }, [data, loading, isCandidateOrBusiness]);
    
    // Loading State
    if (loading) {
        return (
            <div className="i-card-md p-4 placeholder-glow">
                <div className="card-header d-flex justify-content-between mb-3"><h4 className="card-title placeholder col-6"></h4><div className="placeholder col-3"></div></div>
                <h3 className="fs-72 placeholder col-3 mb-3"></h3>
                <div style={{ height: '265px', backgroundColor: '#e9ecef', borderRadius: '8px' }}></div>
                <div className="stats-container mt-4 d-flex justify-content-around"><div className="stat-box placeholder-glow w-50"><span className="placeholder col-8"></span></div><div className="divider"></div><div className="stat-box placeholder-glow w-50"><span className="placeholder col-7"></span></div></div>
            </div>
        );
    }
    
    const chartTitle = isCandidateOrBusiness ? 'My Progress' : 'Total Opportunity Posted';
    const mainStat = isCandidateOrBusiness ? formatNumber(data?.profile_views) : data?.total_opportunities ?? 0;
    
    const series1Name = isCandidateOrBusiness ? 'Applied' : 'Posted';
    const series2Name = isCandidateOrBusiness ? 'Shortlisted' : 'Applicants';
    const series1Value = isCandidateOrBusiness ? data?.total_applications : formatNumber(data?.total_views);
    const series2Value = isCandidateOrBusiness ? data?.shortlisted_count : formatNumber(data?.total_applicants_employer);

    return (
        <div className="i-card-md">
            <div className="card-header flex-wrap gap-2">
                <h4 className="card-title">{chartTitle}</h4>
                <div className="d-flex align-items-center">
                    <div className="i-badge big-badge soft">{dateRangeLabels[dateRange]}</div>
                    <button className="icon-btn-xl" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="ri-arrow-down-s-line"></i></button>
                    <ul className="dropdown-menu dropdown-menu-end">
                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setDateRange('last_7_days'); }}>Last 7 Days</a></li>
                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setDateRange('last_30_days'); }}>Last Month</a></li>
                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setDateRange('last_year'); }}>Last Year</a></li>
                    </ul>
                </div>
            </div>
            <div className="card-body pt-0">
                <h3 className="fs-100">{mainStat}</h3>
                <div ref={chartRef} className="apex-chart" style={{ minHeight: '265px' }}></div>
                <div className="stats-container">
                    <div className="stat-box">
                        <div className="label"><span className="dot yellow"></span>{series1Name}</div>
                        <div className="value">{series1Value ?? 0}</div>
                    </div>
                    <div className="divider"></div>
                    <div className="stat-box">
                        <div className="label"><span className="dot brown"></span>{series2Name}</div>
                        <div className="value">{series2Value ?? 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default OpportunityChart;