// src/data/businessCategories.js

// প্রথমে window.jpbd_object থেকে assets_url ভেরিয়েবলটি গ্রহণ করুন।
// একটি ফলব্যাক (fallback) হিসেবে খালি স্ট্রিং ('') ব্যবহার করা হলো, যদি window.jpbd_object ডিফাইন করা না থাকে।
const { assets_url } = window.jpbd_object || { assets_url: '' };

// ক্যাটাগরিগুলোর একটি বেস তালিকা তৈরি করুন, যেখানে শুধুমাত্র ফাইলের নাম থাকবে।
const categoriesData = [
    { slug: 'all', name: 'All Categories', imageName: '' }, // 필্টারের জন্য
    { slug: 'agency', name: 'Agency', imageName: 'directory/dir-slider-1.png' },
    { slug: 'auto-services', name: 'Auto Services', imageName: 'directory/dir-slider-2.png' },
    { slug: 'beauty-care', name: 'Beauty & Care', imageName: 'directory/dir-slider-3.png' },
    { slug: 'education-training', name: 'Education & Training', imageName: 'directory/dir-slider-4.png' },
    { slug: 'finance-legal', name: 'Finance & Legal', imageName: 'directory/dir-slider-1.png' },
    { slug: 'food-beverage', name: 'Food & Beverage', imageName: 'directory/dir-slider-2.png' },
    { slug: 'gov-nonprofit', name: 'Gov & Nonprofit', imageName: 'directory/dir-slider-3.png' },
    { slug: 'health-wellness', name: 'Health & Wellness', imageName: 'directory/dir-slider-4.png' },
    { slug: 'home-services', name: 'Home Services', imageName: 'directory/dir-slider-1.png' },
    { slug: 'logistics', name: 'Logistics', imageName: 'directory/dir-slider-2.png' },
    { slug: 'pets-animals', name: 'Pets & Animals', imageName: 'directory/dir-slider-3.png' },
    { slug: 'real-estate', name: 'Real Estate', imageName: 'directory/dir-slider-4.png' },
    { slug: 'tech-software', name: 'Tech & Software', imageName: 'directory/dir-slider-1.png' },
    { slug: 'travel-hotels', name: 'Travel & Hotels', imageName: 'directory/dir-slider-2.png' },
];

// এখন, ম্যাপ ব্যবহার করে প্রতিটি আইটেমের জন্য সম্পূর্ণ imageUrl তৈরি করুন।
export const businessCategories = categoriesData.map(category => ({
    ...category,
    // assets_url এবং imageName জুড়ে দিয়ে সম্পূর্ণ URL তৈরি করা হচ্ছে।
    // مثال: 'http://yoursite.com/wp-content/plugins/your-plugin/assets/images/' + 'directory/dir-slider-1.png'
    imageUrl: category.imageName ? `${assets_url}images/${category.imageName}` : '',
}));