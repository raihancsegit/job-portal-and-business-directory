// src/pages/dashboard/EventsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const { api_base_url } = window.jpbd_object || {};

// ===================================================================
// ১. Add Event Modal Component
// ===================================================================
const AddEventModal = ({ onClose, onEventCreated }) => {
    const { token } = useAuth();
    const [eventData, setEventData] = useState({ title: '', category: '', event_date: '', description: '', location: '', image_url: '' });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const categories = ['Product Launches', 'Fundraising Events', 'Concert', 'Workshops & Training'];

    const handleChange = e => setEventData({ ...eventData, [e.target.id]: e.target.value });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !token) return;
        
        setUploading(true);
        const formData = new FormData();
        formData.append('event_image', file);

        try {
            const response = await axios.post(`${api_base_url}events/upload-image`, formData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setEventData(prev => ({ ...prev, image_url: response.data.url }));
            alert('Image uploaded successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Image upload failed.');
        } finally {
            setUploading(false);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) { alert('You must be logged in.'); return; }
        setLoading(true);
        try {
            const response = await axios.post(`${api_base_url}events`, eventData, { headers: { 'Authorization': `Bearer ${token}` } });
            onEventCreated(response.data);
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create event.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header"><h5 className="modal-title">Add New Event</h5><button type="button" className="btn-close" onClick={onClose}></button></div>
                        <div className="modal-body">
                            <div className="mb-3"><label htmlFor="title" className="form-label">Event Title</label><input type="text" id="title" className="form-control" value={eventData.title} onChange={handleChange} required /></div>
                            <div className="mb-3"><label htmlFor="category" className="form-label">Category</label><select id="category" className="form-select" value={eventData.category} onChange={handleChange} required><option value="">Select category</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                            <div className="mb-3"><label htmlFor="event_date" className="form-label">Date and Time</label><input type="datetime-local" id="event_date" className="form-control" value={eventData.event_date} onChange={handleChange} required /></div>
                            <div className="mb-3"><label htmlFor="location" className="form-label">Location</label><input type="text" id="location" className="form-control" value={eventData.location} onChange={handleChange} /></div>
                            <div className="mb-3"><label htmlFor="description" className="form-label">Description</label><textarea id="description" rows="4" className="form-control" value={eventData.description} onChange={handleChange}></textarea></div>
                            <div className="mb-3"><label htmlFor="event_image_upload" className="form-label">Event Image</label><input type="file" id="event_image_upload" className="form-control" onChange={handleImageUpload} accept="image/*" />{uploading && <small>Uploading...</small>}</div>
                        </div>
                        <div className="modal-footer"><button type="button" className="i-btn btn--outline" onClick={onClose}>Cancel</button><button type="submit" className="i-btn btn--primary" disabled={loading || uploading}>{loading ? 'Creating...' : 'Create Event'}</button></div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ===================================================================
// ২. Helper Components (সম্পূর্ণ কোড)
// ===================================================================
const CategorySlider = ({ categories, onCategorySelect, activeCategory }) => (
    <div className="tab-slider-container">
        <div className="event-tab-next swiper-button-next"><svg className="swiper-navigation-icon" width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor"></path></svg></div>
        <div className="event-tab-prev swiper-button-prev"><svg className="swiper-navigation-icon" width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor"></path></svg></div>
        <Swiper modules={[Navigation]} spaceBetween={10} slidesPerView={'auto'} freeMode={true} navigation={{ nextEl: '.event-tab-next', prevEl: '.event-tab-prev' }} className="swiper event-tab-swiper">
            {categories.map(cat => (
                <SwiperSlide key={cat.slug} style={{ width: 'auto' }}><button className={`employ-tab-btn ${activeCategory === cat.slug ? 'active' : ''}`} onClick={() => onCategorySelect(cat.slug)}>{cat.name} ({cat.count})</button></SwiperSlide>
            ))}
        </Swiper>
    </div>
);

const EventCard = ({ event }) => (
    <div className="col-lg-4 col-md-6">
        <Link to={`/dashboard/event-details/${event.id}`} className="event-card border-0 shadow-sm rounded-4 h-100">
            <img src={event.image_url || '/assets/images/events/event-1.png'} className="card-img-top rounded-top-4" alt={event.title} />
            <div className="card-body">
                <h6 className="card-title mb-3 fw-semibold">{event.title}</h6>
                <div className="d-flex align-items-center text-muted small">
                   <img 
                        src={event.organizer_avatar_url || '/assets/images/events/organiser.png'} 
                        alt={event.organizer_name} 
                        className="rounded-circle me-2" 
                        width="32" 
                        height="32" 
                    />
                    <span className="me-auto">{event.organizer_name}</span>
                    <span>{new Date(event.event_date).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </Link>
    </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="d-flex justify-content-center pagination-wrapper mt-5">
             <nav aria-label="Page navigation">
                <ul className="pagination mb-0">
                     <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><a className="page-link" href="#" onClick={(e)=>{e.preventDefault(); onPageChange(currentPage - 1);}}><i className="ri-arrow-left-s-line"></i></a></li>
                     
                     {pageNumbers.map(number => (
                         <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                             <a className="page-link" href="#" onClick={(e)=>{e.preventDefault(); onPageChange(number);}}>{number}</a>
                         </li>
                     ))}

                     <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}><a className="page-link" href="#" onClick={(e)=>{e.preventDefault(); onPageChange(currentPage + 1);}}><i className="ri-arrow-right-s-line"></i></a></li>
                </ul>
            </nav>
        </div>
    );
};


// ===================================================================
// ৩. Main EventsPage Component
// ===================================================================
const EventsPage = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const canAddEvent = user?.roles?.includes('employer') || user?.roles?.includes('administrator');
    const categories = [ { slug: 'all', name: 'All', count: 100 }, { slug: 'product-launches', name: 'Product Launches', count: 20 }, { slug: 'concert', name: 'Concert', count: 15 }, ];

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ category: activeCategory, page: currentPage, per_page: 9 });
            const response = await axios.get(`${api_base_url}events?${params.toString()}`);
            setEvents(response.data);
            setTotalPages(Number(response.headers['x-wp-totalpages']) || 1);
        } catch (error) {
            console.error("Failed to fetch events", error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [activeCategory, currentPage]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory]);
    
    const handleEventCreated = (newEvent) => {
        fetchEvents(); // নতুন ইভেন্ট তৈরি হলে তালিকা রি-ফ্রেশ করা
    };

    return (
        <div className="main-event">
            {showModal && <AddEventModal onClose={() => setShowModal(false)} onEventCreated={handleEventCreated} />}
            <div className="employ-comm-wrapper">
                <div className="employ-container">
                     <div className="row">
                          <div className="col-lg-12">
                               <div className="i-card-md radius-30 card-bg-two p-20">
                                    <div className="employ-main-content">
                                         <div className="row align-items-center g-2 mb-4">
                                              <div className="col-md-10">
                                                  <CategorySlider categories={categories} activeCategory={activeCategory} onCategorySelect={setActiveCategory} />
                                              </div>
                                              <div className="col-md-2 text-end">
                                                  {canAddEvent && (
                                                      <button className="i-btn btn--lg btn--primary" onClick={() => setShowModal(true)}>
                                                          <i className="ri-add-circle-line"></i> Add Event
                                                      </button>
                                                  )}
                                              </div>
                                         </div>
                                         <div className="row g-4">
                                             {loading ? <p className="p-5 text-center">Loading events...</p> : events.length > 0 ? events.map(event => (
                                                 <EventCard key={event.id} event={event} />
                                             )) : <p className="p-5 text-center">No events found for this category.</p>}
                                         </div>
                                         <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                                    </div>
                               </div>
                          </div>
                     </div>
                </div>
           </div>
      </div>
    );
};

export default EventsPage;