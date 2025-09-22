// src/pages/dashboard/InboxPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Pusher from 'pusher-js'; // ১. Pusher import করুন
import ChatList from './components/ChatList';
import ChatArea from './components/ChatArea';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const InboxPage = () => {
    const { userId: activeChatUserId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, token } = useAuth();
    const { api_base_url, pusher_key, pusher_cluster } = window.jpbd_object || {};

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchConversations = useCallback(async () => {
        try {
            const response = await axios.get(`${api_base_url}inbox`, { headers: { 'Authorization': `Bearer ${token}` } });
            setConversations(response.data);
        } catch (error) { console.error("Failed to fetch conversations", error); }
    }, [token, api_base_url]);

    const fetchMessages = useCallback(async (userId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${api_base_url}inbox/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            setMessages(response.data.messages);
            setSelectedUser(response.data.user_info);
            setCurrentConversationId(response.data.conversation_id);
        } catch (error) { console.error("Failed to fetch messages", error); }
        finally { setLoading(false); }
    }, [token, api_base_url]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        if (activeChatUserId) {
             setSelectedUser(null);
            fetchMessages(activeChatUserId);
        } else {
            // যদি কোনো ইউজার সিলেক্ট করা না থাকে, তাহলে সব রিসেট করুন
            setSelectedUser(null);
            setMessages([]);
            setCurrentConversationId(null);
        }
    }, [activeChatUserId, fetchMessages]);

    // ================== PUSHER ইন্টিগ্রেশন ==================
    useEffect(() => {
        if (!pusher_key || !pusher_cluster || !currentConversationId || !token) {
            return;
        }

        const pusher = new Pusher(pusher_key, {
            cluster: pusher_cluster,
            authEndpoint: `${api_base_url}pusher/auth`,
            auth: { headers: { 'Authorization': `Bearer ${token}` } }
        });

        const channel = pusher.subscribe(`private-chat-${currentConversationId}`);

        channel.bind('new-message', (newMessage) => {
            // শুধুমাত্র অন্য কেউ মেসেজ পাঠালে UI তে যোগ করুন
            if (newMessage.sender_id !== currentUser.id) {
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
            // চ্যাট লিস্ট আপডেট করার জন্য
            fetchConversations(); 
        });

        return () => {
            pusher.unsubscribe(`private-chat-${currentConversationId}`);
        };
    }, [currentConversationId, pusher_key, pusher_cluster, token, currentUser.id, api_base_url, fetchConversations]);
    // ===============================================

    const handleSendMessage = async (messageText) => {
        if (!activeChatUserId) return;

        const optimisticMessage = { id: Date.now(), sender_id: currentUser.id, message: messageText, time_ago: 'Just now' };
        setMessages(prev => [...prev, optimisticMessage]);

        try {
            const response = await axios.post(`${api_base_url}inbox/${activeChatUserId}`, { message: messageText }, { headers: { 'Authorization': `Bearer ${token}` } });
            setMessages(prev => prev.map(msg => msg.id === optimisticMessage.id ? response.data.data : msg));
            fetchConversations();
        } catch (error) {
            setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
            alert("Could not send message.");
        }
    };

    return (
        <div className="i-card-md radius-30 card-bg-two p-20">
            <div className="chat-wrapper">
                <ChatList conversations={conversations} activeUserId={activeChatUserId} />
                <ChatArea messages={messages} otherUser={selectedUser} onSendMessage={handleSendMessage} loading={loading} />
            </div>
        </div>
    );
};

export default InboxPage;