// src/pages/dashboard/EventDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { api_base_url } = window.jpbd_object || {};

// API Function
const getEventDetails = async (eventId) => {
    try {
        const response = await axios.get(`${api_base_url}events/${eventId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch event details";
    }
};

// Main EventDetailsPage Component
const EventDetailsPage = () => {
    const { eventId } = useParams(); // URL থেকে eventId নিন (রাউটিং অনুযায়ী :eventId)
    const navigate = useNavigate();
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!eventId) return;
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const data = await getEventDetails(eventId);
                setEventData(data);
            } catch (err) {
                setError(err.toString());
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [eventId]);
    
    if (loading) return <div className="p-5 text-center"><h5>Loading Event Details...</h5></div>;
    if (error) return <div className="p-5 alert alert-danger">{error}</div>;
    if (!eventData || !eventData.event) return <div className="p-5 text-center"><h5>Event not found.</h5></div>;

    const { event, recent_events } = eventData;

    return (
        <div className="events-details">
            <div className="i-card-md radius-30 mb-3">
                <div className="card-body">
                    <div className="details-container">
                        <div className="d-flex justify-content-between flex-wrap gap-3 align-items-center mb-3">
                            <div className="flex-grow-1 d-flex justify-content-start align-items-center gap-2">
                                <button className="icon-btn-lg" type="button" onClick={() => navigate(-1)}>
                                    <i className="ri-arrow-left-s-line"></i>
                                </button>
                                <h3>{event.title}</h3>
                            </div>
                        </div>
                        <section className="event-details">
                            <div className="container-fluid p-0">
                                <div className="event-banner mb-4">
                                    <img src={event.image_url || "/assets/images/events/details.jpg"} alt={event.title} className="rounded-3 w-100" />
                                </div>
                                <div className="event-meta d-flex flex-wrap align-items-center gap-3 mb-4">
                                     <span><i className="ri-user-3-line me-2"></i>{event.organizer_name}</span>
                                     <span><i className="ri-calendar-line me-2"></i>{new Date(event.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                     <span><i className="ri-map-pin-line me-2"></i>{event.location || 'Online'}</span>
                                </div>
                                <div className="event-description mb-4">
                                     <p>{event.description}</p>
                                </div>
                               <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap social-wrapper">
                                    <div className="event-tabs">
                                        <button className="btn btn-custom active">{event.category}</button>
                                    </div>
                                     <div className="social-icons">
                                          <ul className="list-inline d-flex gap-3 mb-0">
                                               <li><a href="#"><i className="ri-facebook-fill"></i></a></li>
                                               <li><a href="#"><i className="ri-twitter-fill"></i></a></li>
                                          </ul>
                                     </div>                                        
                               </div>
                                {recent_events && recent_events.length > 0 && (
                                    <div className="recent-events mt-5">
                                         <h4 className="mb-4 fw-semibold">Recent Events</h4>
                                         <div className="row g-4">
                                             {recent_events.map(recent => (
                                                  <div className="col-xl-4 col-lg-6" key={recent.id}>
                                                      <Link to={`/dashboard/event-details/${recent.id}`} className="recent-event-card">
                                                           <div className="image">
                                                                <img src={recent.image_url || "/assets/images/events/recent-1.jpg"} className="img-fluid rounded-3 mb-3" alt={recent.title} />
                                                           </div>
                                                           <div>
                                                                <h6 className="fw-semibold">{recent.title}</h6>
                                                                <p className="text-muted small mb-0">{new Date(recent.event_date).toLocaleDateString()}</p>
                                                           </div>
                                                      </Link>
                                                  </div>
                                             ))}
                                         </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
      </div>
    );
};

export default EventDetailsPage;