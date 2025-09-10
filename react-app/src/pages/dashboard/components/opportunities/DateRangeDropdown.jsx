import React from 'react';

const DateRangeDropdown = ({ filters, setFilters }) => {
    // অপশনগুলোর জন্য একটি ম্যাপ তৈরি করা, যা কোডকে পরিষ্কার রাখে
    const dateRangeOptions = {
        'all-time': 'All-time',
        'this-week': 'This Week',
        'this-month': 'This Month',
        'this-year': 'This Year',
    };

    // ফিল্টার পরিবর্তনের জন্য হ্যান্ডলার
    const handleDateRangeChange = (value) => {
        setFilters(prev => ({ ...prev, dateRange: value }));
    };

    return (
        <div className="d-flex justify-content-end flex-grow-1">
            <div className="i-badge big-badge soft">
                {/* state থেকে বর্তমান সিলেক্টেড অপশনের টেক্সট দেখানো হচ্ছে */}
                {dateRangeOptions[filters.dateRange]}
            </div>
            <div className="dropdown">
                <button className="icon-btn-lg" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="ri-arrow-down-s-line"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                        <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleDateRangeChange('this-month'); }}>
                            This Month
                        </a>
                    </li>
                    <li>
                        <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleDateRangeChange('this-week'); }}>
                            This Week
                        </a>
                    </li>
                    <li>
                        <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleDateRangeChange('this-year'); }}>
                            This Year
                        </a>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                        <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleDateRangeChange('all-time'); }}>
                            All-time
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default DateRangeDropdown;