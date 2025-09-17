import React from 'react';

const BusinessDetails = ({ business }) => {
    if (!business) {
        return (
            <div className="dir-card-details p-5 text-center">
                <h5>Select a business from the list to see more details.</h5>
            </div>
        );
    }
    
    const businessHours = business.business_hours ? JSON.parse(business.business_hours) : [];
    const certifications = business.certifications ? business.certifications.split(',').map(c => c.trim()) : [];
    const services = business.services ? business.services.split(',').map(s => s.trim()) : [];
    const rating = business.rating || { score: 4.6, reviews: 56 };
    const status = business.status || 'Open to contracts';

    return (
        <div className="dir-card-details">
            <div className="dir-card-details__header">
                <div className="dir-card-details__logo">
                    {business.logo_url && <img src={business.logo_url} alt={business.title} style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px' }} />}
                </div>
                <div>
                    <div className="dir-card-details__badge">
                        <span className="status-dot"></span> {status}
                    </div>
                    <div>
                        <h3 className="company-name">{business.title}</h3>
                        <p className="company-type">{business.tagline}</p>
                    </div>
                </div>
            </div>

            <div className="dir-card-details__info">
                <div className="location">
                    <span className="label">Location</span>
                    <p className="value">{business.address}</p>
                </div>
                <div className="rating">
                    <span className="label">Ratings</span>
                    <p className="value">
                        {rating.score} <i className="ri-star-s-fill"></i>
                    </p>
                </div>
            </div>

            <div className="dir-card-details__actions">
                <button className="i-btn btn--dark btn--xl">Get in touch</button>
                <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="i-btn btn--outline btn--xl">Visit Website</a>
                <button className="icon-btn-xl ms-auto me-0" onClick={() => console.log('Save button clicked')}>
                    <i className="ri-bookmark-line"></i>
                </button>
            </div>
            
            {/* Tabs Section */}
            <div className="dir-card-tabs mt-4">
                <ul className="nav nav-tabs" id="cardTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button className="nav-link active" id="desc-tab" data-bs-toggle="tab" data-bs-target="#desc" type="button" role="tab">Description</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" id="services-tab" data-bs-toggle="tab" data-bs-target="#services" type="button" role="tab">
                            Services <span className="badge bg-secondary ms-1">{services.length}</span>
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab">
                            Reviews <span className="badge bg-secondary ms-1">{rating.reviews}</span>
                        </button>
                    </li>
                </ul>

                <div className="tab-content rounded-bottom" id="cardTabContent">
                    {/* Description Tab */}
                    <div className="tab-pane fade show active" id="desc" role="tabpanel">
                        <p>{business.details}</p>
                        {business.founded_year && (
                            <div className="mb-3 badge-wrap">
                                <span className="badge bg-light text-dark me-2">Founded</span>
                                <span className="fw-semibold">{business.founded_year}</span>
                            </div>
                        )}
                        {certifications.length > 0 && (
                            <div className="mb-3 badge-wrap">
                                <span className="badge bg-light text-dark me-2">Certifications</span>
                                <span className="fw-semibold">{certifications.join(', ')}</span>
                            </div>
                        )}
                        {/* Accordion for Open Hours */}
                        {businessHours.length > 0 && (
                            <div className="accordion" id="openHoursAccordion">
                                <div className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseHours">Open hours</button>
                                    </h2>
                                    <div id="collapseHours" className="accordion-collapse collapse">
                                        <div className="accordion-body">
                                            <ul className="list-unstyled mb-0">
                                                {businessHours.map((hour, index) => (
                                                    <li key={index}><strong>{hour.day}:</strong> {hour.fullDay ? 'Open 24 Hours' : `${hour.startTime} - ${hour.endTime}`}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Map Section would go here */}
                    </div>

                    {/* Services Tab */}
                    <div className="tab-pane fade" id="services" role="tabpanel">
                         <div className="d-flex flex-row flex-wrap gap-2">
                            {services.map((service, index) => (
                                <span key={index} className="badge rounded-pill skill-badge style-two">{service}</span>
                            ))}
                         </div>
                    </div>

                    {/* Reviews Tab */}
                    <div className="tab-pane fade" id="reviews" role="tabpanel">
                         <p className="p-3 text-center">Reviews will be shown here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessDetails;