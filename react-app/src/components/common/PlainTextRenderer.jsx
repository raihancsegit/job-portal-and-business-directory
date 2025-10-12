// src/components/common/PlainTextRenderer.jsx

import React from 'react';

const PlainTextRenderer = ({ title, text }) => {
    // যদি টেক্সট খালি থাকে, তাহলে কিছুই রেন্ডার না করা
    if (!text || text.trim() === '') {
        return null;
    }

    // টেক্সটকে লাইন বাই লাইন ভাগ করা এবং খালি লাইন বাদ দেওয়া
    const lines = text.split('\n').filter(line => line.trim() !== '');

    // প্রতিটি লাইনকে <li> বা <p> ট্যাগে রূপান্তর করা
    const content = lines.map((line, index) => {
        if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
            const listItemText = line.trim().substring(1).trim();
            return <li key={index}>{listItemText}</li>;
        }
        return <p key={index}>{line}</p>;
    });

    // <li> আইটেমগুলোকে <ul> ট্যাগের ভেতরে গ্রুপ করা
    const renderContent = () => {
        let elements = [];
        let listItems = [];

        content.forEach((item, index) => {
            if (item.type === 'li') {
                listItems.push(item);
            } else {
                if (listItems.length > 0) {
                    elements.push(<ul key={`ul-${index - 1}`} className="desc-list">{listItems}</ul>);
                    listItems = [];
                }
                elements.push(item);
            }
        });

        if (listItems.length > 0) {
            elements.push(<ul key="ul-last" className="desc-list">{listItems}</ul>);
        }

        return elements;
    };

    return (
        <div className="mb-30">
            <h4 className="desc-title">{title}</h4>
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default PlainTextRenderer;