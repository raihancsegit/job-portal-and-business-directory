// src/pages/dashboard/components/business/CategorySlider.jsx

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

const CategorySlider = ({ categories, onCategorySelect, activeCategory }) => {
    return (
        <div className="category-slider-wrapper">
            <div className="category-button-prev"><i className="ri-arrow-left-s-line"></i></div>
            
            <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={12}
                
                // ================== মূল পরিবর্তন এখানে ==================
                slidesPerView={'auto'} // <-- 'auto' ব্যবহার করুন
                slidesPerGroup={1}
                // =======================================================
                
                loop={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                navigation={{
                    nextEl: '.category-button-next',
                    prevEl: '.category-button-prev',
                }}
                className="category-slider"
            >
                {/* categories.filter() বাদ দিয়ে সব দেখানো হচ্ছে */}
                {categories.map((category) => (
                    // width: 'auto' স্লাইডকে তার কন্টেন্টের আকার নিতে সাহায্য করে
                    <SwiperSlide key={category.slug} style={{ width: 'auto' }}>
                        <div 
                            className={`category-card ${activeCategory === category.slug ? 'active' : ''}`}
                            onClick={() => onCategorySelect(category.slug)}
                        >
                            <img src={category.imageUrl} alt={category.name} />
                            <span>{category.name}</span>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
            
            <div className="category-button-next"><i className="ri-arrow-right-s-line"></i></div>
        </div>
    );
};

export default CategorySlider;