import React, { useEffect, memo, useRef } from 'react';

// memo ব্যবহার করা হয়েছে যাতে কম্পোনেন্টটি অপ্রয়োজনে re-render না হয়
const OpportunityChart = memo(() => {
    
    // চার্টের div এলিমেন্টটিকে ধরে রাখার জন্য একটি ref তৈরি করা
    const chartRef = useRef(null);

    useEffect(() => {
        // নিশ্চিত করুন যে ApexCharts লাইব্রেরিটি লোড হয়েছে
        if (typeof ApexCharts === 'undefined') {
            console.error("ApexCharts library is not loaded.");
            return;
        }

        // আপনার chart-init.js ফাইল থেকে চার্টের অপশনগুলো এখানে কপি করা হয়েছে
        const options = {
            series: [{
                name: 'Opportunities',
                data: [30.40, 40.00, 35.50, 50.40, 49.90, 38.80, 42.10] // স্ট্যাটিক ডেটা
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
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.1,
                    stops: [0, 90, 100]
                }
            },
            xaxis: {
                categories: ["Mar '12", "Apr '12", "May '12", "Jun '12", "Jul '12", "Aug '12", "Sep '12"],
            },
            yaxis: {
                labels: {
                    formatter: function (val) {
                        return val.toFixed(2);
                    }
                }
            },
            tooltip: {
                x: {
                    format: 'dd MMM yyyy'
                },
            },
        };

        // একটি নতুন চার্ট ইনস্ট্যান্স তৈরি করা
        const chart = new ApexCharts(chartRef.current, options);
        
        // চার্টটি রেন্ডার করা
        chart.render();

        // কম্পোনেন্টটি আনমাউন্ট হওয়ার সময় চার্টটি ধ্বংস করা (memory leak প্রতিরোধের জন্য)
        return () => {
            chart.destroy();
        };

    }, []); // খালি dependency array মানে এটি শুধু একবার রান হবে

    return (
        <div className="i-card-md">
            <div className="card-header">
                <h4 className="card-title">Total Opportunity Posted</h4>
            </div>
            <div className="card-body pt-0">
                <h3 className="fs-100">12</h3>
                
                {/* ref অ্যাট্রিবিউট ব্যবহার করে DOM এলিমেন্টটিকে সংযুক্ত করা */}
                <div id="opportunity-chart" ref={chartRef} className="apex-chart" style={{ minHeight: '265px' }}></div>
                
                <div className="stats-container">
                    <div className="stat-box">
                        <div className="label"><span className="dot yellow"></span>Opportunity Views</div>
                        <div className="value">2.23K</div>
                    </div>
                    <div className="divider"></div>
                    <div className="stat-box">
                        <div className="label"><span className="dot brown"></span>Applicants</div>
                        <div className="value">756</div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default OpportunityChart;