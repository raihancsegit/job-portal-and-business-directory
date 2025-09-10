import React from 'react';

const OpportunityTabs = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex-grow-1 d-flex flex-wrap gap-2" role="group">
            <button 
                type="button" 
                className={`i-btn btn--lg ${activeTab === 'all' ? 'btn--primary-dark active' : ''}`} 
                onClick={() => setActiveTab('all')}
            >
                All Opportunities
            </button>
            <button 
                type="button" 
                className={`i-btn ${activeTab === 'my_opportunities' ? 'btn--primary-dark active' : 'btn--outline'} btn--lg`} 
                onClick={() => setActiveTab('my_opportunities')}
            >
                My Opportunities
            </button>
            <button 
                type="button" 
                className="i-btn btn--outline btn--lg" 
                onClick={() => alert('Hired opportunities filter will be implemented soon!')}
            >
                Hired
            </button>
        </div>
    );
};

export default OpportunityTabs;