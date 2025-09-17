// src/pages/dashboard/components/opportunities/OpportunityTabs.jsx
import React from 'react';
import { useAuth } from '../../../../context/AuthContext';

const OpportunityTabs = ({ activeTab, setActiveTab }) => {
    const { user } = useAuth();
    
    const isCandidateOrBusiness = user?.roles?.includes('candidate') || user?.roles?.includes('business');

    // Candidate and Business View
    if (isCandidateOrBusiness) {
        return (
            <div className="flex-grow-1 d-flex flex-wrap gap-2" role="group">
                <button 
                    type="button" 
                    className={`i-btn btn--lg ${activeTab === 'all' ? 'btn--primary-dark active' : ''}`} 
                    onClick={() => setActiveTab('all')}
                >
                    Open Opportunities
                </button>
                <button 
                    type="button" 
                    className={`i-btn ${activeTab === 'applied' ? 'btn--primary-dark active' : 'btn--outline'} btn--lg`} 
                    onClick={() => setActiveTab('applied')}
                >
                    Applied
                </button>
            </div>
        );
    }
    
    // Employer View (Default)
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
                className={`i-btn ${activeTab === 'hired' ? 'btn--primary-dark active' : 'btn--outline'} btn--lg`} 
                onClick={() => setActiveTab('hired')}
            >
                Hired
            </button>
        </div>
    );
};

export default OpportunityTabs;