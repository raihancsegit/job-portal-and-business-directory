// src/pages/dashboard/components/business/ReviewSection.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import StarRating from './StarRating'; // নিশ্চিত করুন এই পাথটি সঠিক

// ======================================================
// Helper Component: RatingInput
// ======================================================
const RatingInput = ({ rating, setRating }) => {
    return (
        <div className="d-flex justify-content-center mb-3 rating-input">
            {Array.from({ length: 5 }, (_, i) => (
                <i 
                    key={i} 
                    className={i < rating ? "ri-star-s-fill" : "ri-star-s-line"}
                    onClick={() => setRating(i + 1)}
                    style={{ fontSize: '2.5rem', cursor: 'pointer', color: '#ffc107', margin: '0 5px' }}
                />
            ))}
        </div>
    );
};

// ======================================================
// Helper Component: ReviewModal
// ======================================================
const ReviewModal = ({ businessId, onClose, onReviewSubmit }) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { token } = useAuth();
    const { api_base_url } = window.jpbd_object || {};

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please provide a rating by clicking on the stars.");
            return;
        }
        setSubmitting(true);
        try {
            await axios.post(`${api_base_url}businesses/${businessId}/reviews`, {
                rating,
                review_text: reviewText,
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            
            onReviewSubmit();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1056 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-5">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header border-0">
                            <h5 className="modal-title">Write a Review</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body text-center p-4">
                            <p className="mb-2">What is your rating?</p>
                            <RatingInput rating={rating} setRating={setRating} />
                            <textarea
                                className="form-control"
                                rows="4"
                                placeholder="Describe your experience (optional)"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="i-btn btn--lg btn--outline" onClick={onClose} disabled={submitting}>Cancel</button>
                            <button type="submit" className="i-btn btn--lg btn--primary-dark" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ======================================================
// Main ReviewSection Component
// ======================================================
const ReviewSection = ({ businessId ,onReviewCountChange }) => {
    const { user } = useAuth();
    const { api_base_url } = window.jpbd_object || {};
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [sortBy, setSortBy] = useState('newest');

    const sortOptions = {
        'newest': 'Newest review',
        'oldest': 'Oldest review',
        'highest': 'Highest rating',
        'lowest': 'Lowest rating',
    };

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${api_base_url}businesses/${businessId}/reviews`);
            setReviews(response.data);
            if (onReviewCountChange) {
                onReviewCountChange(response.data.length);
            }
        } catch (error) { console.error("Failed to fetch reviews", error); }
        finally { setLoading(false); }
    }, [businessId, api_base_url,onReviewCountChange]);
    
    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);
    
    const sortedReviews = useMemo(() => {
        let sorted = [...reviews];
        switch(sortBy) {
            case 'oldest': sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
            case 'highest': sorted.sort((a, b) => b.rating - a.rating); break;
            case 'lowest': sorted.sort((a, b) => a.rating - b.rating); break;
            default: sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
        }
        return sorted;
    }, [reviews, sortBy]);
    
    const ratingSummary = { score: 4.8, count: 578, distribution: { '5': 344, '4': 44, '3': 11, '2': 0, '1': 0 } };

    return (
        <>
            <div className="review-section container my-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="dropdown">
                        <button className="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {sortOptions[sortBy]}
                        </button>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSortBy('newest'); }}>Newest review</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSortBy('oldest'); }}>Oldest review</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSortBy('highest'); }}>Highest rating</a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSortBy('lowest'); }}>Lowest rating</a></li>
                        </ul>
                    </div>
                    {user && (
                        <button className="btn btn-dark rounded-pill px-4" onClick={() => setShowReviewModal(true)}>
                            Write a Review
                        </button>
                    )}
                </div>

                <div className="rating-summary card p-3 mb-4">
                    <div className="d-flex align-items-center mb-2">
                        <div className="rating-value display-6 fw-bold me-3">{ratingSummary.score}</div>
                        <div>
                            <StarRating rating={ratingSummary.score} />
                            <small className="text-muted">({ratingSummary.count} Reviews)</small>
                        </div>
                    </div>
                    <div className="rating-bars">
                        {Object.entries(ratingSummary.distribution).reverse().map(([star, count]) => (
                            <div key={star} className="d-flex align-items-center mb-1">
                                <small style={{width: '50px'}}>{star} star</small>
                                <div className="progress flex-grow-1 mx-2" style={{height:'6px'}}>
                                    <div className="progress-bar bg-dark" style={{width: `${(count / ratingSummary.count) * 100}%`}}></div>
                                </div>
                                <small>{count}</small>
                            </div>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <p className="text-center">Loading reviews...</p>
                ) : sortedReviews.length > 0 ? (
                    sortedReviews.map(review => (
                        <div key={review.id} className="review card p-3 mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <StarRating rating={review.rating} />
                                <small className="text-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                                <div className="avatar bg-primary text-white fw-bold me-2">{review.user.avatar_letter}</div>
                                <strong>{review.user.display_name}</strong>
                            </div>
                            <p className="mb-0 text-muted">{review.review_text}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted">No reviews yet. Be the first one to write a review!</p>
                )}
            </div>
            
            {showReviewModal && (
                <ReviewModal 
                    businessId={businessId} 
                    onClose={() => setShowReviewModal(false)}
                    onReviewSubmit={fetchReviews}
                />
            )}
        </>
    );
};

export default ReviewSection;