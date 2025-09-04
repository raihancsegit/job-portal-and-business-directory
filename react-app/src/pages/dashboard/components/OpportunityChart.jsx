import React, { useEffect, memo } from 'react';

const OpportunityChart = memo(() => {
    const { assets_url } = window.jpbd_object;

    useEffect(() => {
        // এই ইফেক্টটি কম্পোনেন্টটি মাউন্ট হওয়ার পর একবার রান হবে
        
        const chartInitScriptSrc = `${assets_url}js/chart-init.js`;

        // প্রথমে চেক করুন এই স্ক্রিপ্টটি অলরেডি DOM-এ যোগ করা হয়েছে কিনা
        if (document.querySelector(`script[src="${chartInitScriptSrc}"]`)) {
            console.log("Chart script already loaded.");
            // যদি অলরেডি লোড হয়ে থাকে, resize ইভেন্ট দিয়ে পুনরায় রেন্ডার করার চেষ্টা করা যেতে পারে
            window.dispatchEvent(new Event('resize'));
            return;
        }
        
        // যদি লোড না হয়ে থাকে, একটি নতুন script ট্যাগ তৈরি করুন
        const script = document.createElement('script');
        script.src = chartInitScriptSrc;
        script.async = true; // অ্যাসিঙ্ক্রোনাসভাবে লোড হবে

        // স্ক্রিপ্টটি লোড এবং রান হওয়ার পর কী হবে
        script.onload = () => {
            console.log("chart-init.js loaded and executed dynamically.");
            // স্ক্রিপ্টটি লোড হওয়ার পর চার্টটি রেন্ডার হওয়ার জন্য একটি ছোট ডিলে দেওয়া যেতে পারে
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        };
        
        // ট্যাগটিকে ডকুমেন্টের head-এ যোগ করা
        document.head.appendChild(script);

        // কম্পোনেন্টটি আনমাউন্ট হওয়ার সময় স্ক্রিপ্ট ট্যাগটি সরিয়ে ফেলা (ক্লিন-আপ)
        return () => {
            const existingScript = document.querySelector(`script[src="${chartInitScriptSrc}"]`);
            if (existingScript) {
                document.head.removeChild(existingScript);
            }
        };

    }, [assets_url]); // assets_url পরিবর্তন হলে ইফেক্টটি আবার রান হবে (যদিও এটি সাধারণত হয় না)

    return (
        <div className="i-card-md">
            <div className="card-header">
                <h4 className="card-title">Total Opportunity Posted</h4>
            </div>
            <div className="card-body pt-0">
                <h3 className="fs-100">12</h3>
                <div id="opportunity-chart" className="apex-chart" style={{ minHeight: '265px' }}>
                    
                </div>
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