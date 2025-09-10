import React , { useState } from 'react';
import OpportunityChart from './components/OpportunityChart';
import StatsCards from './components/StatsCards';
import ShortlistedTable from './components/ShortlistedTable';
import OpportunityPostedTable from './components/OpportunityPostedTable';

function DashboardHomePage() {
     const [postedTableFilters, setPostedTableFilters] = useState({
        dateRange: 'all-time'
    });
    return (
        <>
            <div className="row g-2 mb-2">
                <div className="col-xl-5">
                    <OpportunityChart />
                </div>
                <div className="col-xl-7">
                    <div className="row g-2">
                        <div className="col-12">
                            <StatsCards />
                        </div>
                        <div className="col-12">
                            <ShortlistedTable />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-12">
                    <OpportunityPostedTable 
                        filters={postedTableFilters} 
                        setFilters={setPostedTableFilters}  
                    />
                </div>
            </div>
        </>
    );
}

export default DashboardHomePage;