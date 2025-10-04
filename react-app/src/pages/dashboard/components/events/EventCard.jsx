// src/pages/dashboard/components/events/EventCard.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';

const EventCard = ({ event, onEventDeleted, onEditClick }) => {
    const { user, token } = useAuth();
    const { api_base_url } = window.jpbd_object || {};
    const isOwner = user && event && parseInt(user.id, 10) === parseInt(event.organizer_id, 10);
    
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this event?")) {
            setDeleting(true);
            try {
                await axios.delete(`${api_base_url}events/${event.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                onEventDeleted(event.id);
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete event.');
            } finally {
                setDeleting(false);
            }
        }
    };
    
    // This function now simply calls the prop passed from the parent
    const handleEditClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onEditClick(); // This will trigger setEventToEdit(event) in EventsPage
    };

    return (
        <div className="col-lg-4 col-md-6">
            <div className="event-card-wrapper">
                {isOwner && (
                    <div className="event-card-actions">
                        <button className="action-btn" onClick={handleEditClick} disabled={deleting}>
                            <i className="ri-pencil-line"></i>
                        </button>
                        <button className="action-btn" onClick={handleDelete} disabled={deleting}>
                            {deleting ? <span className="spinner-border spinner-border-sm"></span> : <i className="ri-delete-bin-line"></i>}
                        </button>
                    </div>
                )}
                <Link to={`/dashboard/event-details/${event.id}`} className="event-card border-0 shadow-sm rounded-4 h-100">
                    <img src={event.image_url || '/default-event-image.png'} className="card-img-top rounded-top-4" alt={event.title} />
                    <div className="card-body">
                        <h6 className="card-title mb-3 fw-semibold">{event.title}</h6>
                        <div className="d-flex align-items-center text-muted small">
                            <img src={event.organizer_avatar_url || '/default-avatar.png'} alt={event.organizer_name} className="rounded-circle me-2" width="32" height="32" />
                            <span className="me-auto">{event.organizer_name}</span>
                            <span>{new Date(event.event_date).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </Link>
            </div>
            {/* The EditModal is GONE from this file. It is now correctly placed in EventsPage.jsx */}
        </div>
    );
};

export default EventCard;


