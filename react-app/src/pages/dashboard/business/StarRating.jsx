import React from 'react';

const StarRating = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push(<i key={i} className="ri-star-s-fill text-warning"></i>);
        } else if (i - 0.5 <= rating) {
            stars.push(<i key={i} className="ri-star-half-s-fill text-warning"></i>);
        } else {
            stars.push(<i key={i} className="ri-star-s-line text-secondary"></i>);
        }
    }
    return <div className="stars d-inline-block">{stars}</div>;
};

export default StarRating;