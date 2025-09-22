// src/pages/dashboard/components/inbox/ChatArea.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Path ঠিক আছে কিনা দেখুন

// ================== Message কম্পোনেন্টের সঠিক সংস্করণ ==================
const Message = ({ message, otherUser }) => {
    const { user: currentUser } = useAuth();
    const isSentByMe = message.sender_id === currentUser.id;

    // Pusher থেকে আসা নতুন মেসেজের জন্য sender-এর তথ্য message অবজেক্টের ভেতরেই থাকে
    // API থেকে লোড হওয়া পুরনো মেসেজের জন্য sender-এর তথ্য otherUser থেকে নিতে হবে
    const senderInfo = isSentByMe ? currentUser : (message.sender || otherUser);

     if (!senderInfo) {
        return null; // যদি কোনো কারণে sender-এর তথ্য না পাওয়া যায়, তাহলে মেসেজটি রেন্ডার না করা
    }
    
    return (
        <li className={`conversation-list-item ${isSentByMe ? 'right' : ''}`}>
            {!isSentByMe && (
                <img 
                    className="rounded-circle avatar-sm" 
                    src={senderInfo.avatar_url || 'default-avatar.png'} 
                    alt={senderInfo.display_name} 
                />
            )}
            <div className="conversation-list-item-content">
                <div className="user-chat-content">
                    <p>{message.message}</p>
                </div>
                <div className="user-chat-meta">
                    <small>{message.time_ago}</small>
                    {isSentByMe && <i className="ri-check-double-line"></i>}
                </div>
            </div>
        </li>
    );
};
// ====================================================================


const ChatArea = ({ messages, otherUser, onSendMessage, loading }) => { // loading prop নিন
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef(null);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
        }
    };

    if (loading) {
        return (
            <div className="chat-area d-flex align-items-center justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    
    if (!otherUser) {
        return (
            <div className="chat-area">
                <div className="chat-cover-area d-flex align-items-center justify-content-center">
                    <div>
                        <i className="ri-message-3-line display-1 text-muted"></i>
                        <h4 className="text-muted mt-3">Select a conversation to start chatting</h4>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-area">
            <div className="chat-cover-area">
              <button className="i-btn btn--sm btn--dark d-xl-none d-block m-3 ms-auto me-3">Members</button>
            </div>
            <div className="chat-area-header">
                <div className="chat-area-meta">
                    <div className="chat-user-img">
                        <img className="rounded-circle avatar-100" src={otherUser.avatar_url || 'default-avatar.png'} alt={otherUser.display_name} />
                    </div>
                    <div className="chat-area-info">
                        <h6>{otherUser.display_name}</h6>
                    </div>
                </div>
            </div>

            <div className="chat-conversation" ref={chatContainerRef} data-simplebar>
                <div className="conversation">
                    <ul className="conversation-list">
                       {messages.map((msg) => (
                           // ================== পরিবর্তন এখানে ==================
                           <Message key={msg.id} message={msg} otherUser={otherUser} />
                           // ====================================================
                       ))}
                    </ul>
                </div>
            </div>

            <div className="write-chat-message">
                <form className="write-message-form" onSubmit={handleSubmit}>
                    <button type="button" className="emoji-btn"><i className="ri-emotion-happy-line"></i></button>
                    <input type="text" placeholder="Type a message.." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                    <button type="submit" className="send-btn"><i className="ri-send-plane-2-line"></i></button>
                </form>
            </div>
        </div>
    );
};

export default ChatArea;