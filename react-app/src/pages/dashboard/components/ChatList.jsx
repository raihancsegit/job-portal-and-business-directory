// src/pages/dashboard/components/inbox/ChatList.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

// ChatListItem কম্পোনেন্ট অপরিবর্তিত থাকবে
const ChatListItem = ({ conversation, isActive }) => {
    const { other_user, last_message, unread_count } = conversation;
    return (
        <li>
            <Link to={`/dashboard/inbox/${other_user.id}`} className={`chat-list-item ${isActive ? 'active' : ''}`}>
                <div className="chat-user-img"><img className="rounded-circle avatar-md" src={other_user.avatar_url} alt={other_user.display_name} /></div>
                <div className="chat-list-meta"><h6>{other_user.display_name}</h6><p>{last_message?.message || 'Click to chat'}</p></div>
                <div className="chat-list-right"><small>{last_message?.time_ago || ''}</small>{unread_count > 0 && <span>{unread_count}</span>}</div>
            </Link>
        </li>
    );
};

// নতুন UserListItem কম্পোনেন্ট
const UserListItem = ({ user, isActive }) => {
    return (
        <li>
            <Link to={`/dashboard/inbox/${user.id}`} className={`chat-list-item ${isActive ? 'active' : ''}`}>
                <div className="chat-user-img"><img className="rounded-circle avatar-md" src={user.avatar_url} alt={user.display_name} /></div>
                <div className="chat-list-meta"><h6>{user.display_name}</h6><p>Start a new conversation</p></div>
            </Link>
        </li>
    );
};

// ChatList কম্পোনেন্টের নতুন সংস্করণ
const ChatList = ({ conversations, activeUserId }) => {
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'users'
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const { token } = useAuth();
    const { api_base_url } = window.jpbd_object || {};
    const navigate = useNavigate();

    // সব ইউজারদের তালিকা আনার জন্য useEffect
    useEffect(() => {
        if (activeTab === 'users' && allUsers.length === 0) { // শুধুমাত্র প্রথমবার লোড করার জন্য
            setLoadingUsers(true);
            const fetchUsers = async () => {
                try {
                    const response = await axios.get(`${api_base_url}chat/users`, { headers: { 'Authorization': `Bearer ${token}` } });
                    setAllUsers(response.data);
                } catch (error) { console.error("Failed to fetch users", error); }
                finally { setLoadingUsers(false); }
            };
            fetchUsers();
        }
    }, [activeTab, allUsers.length, api_base_url, token]);
    
    // সার্চ ফিল্টার
    const filteredConversations = conversations.filter(c => c.other_user.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredUsers = allUsers.filter(u => u.display_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="chat-info">
            <button className="icon-btn-lg mb-3 mt-3 chat-close-btn d-xl-none d-block ms-auto me-4"><i className="ri-close-line"></i></button>
            <div className="chat-search">
                <input type="text" placeholder="Search conversations or users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <span className="search-icon"><i className="ri-search-line"></i></span>
            </div>

            {/* Tabs for switching between chats and users */}
            <div className="chat-list-tabs">
                <button className={activeTab === 'chats' ? 'active' : ''} onClick={() => setActiveTab('chats')}>Chats</button>
                <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>New Chat</button>
            </div>

            <div className="chat-tab-container">
                <div className="chat-tab-item">
                    <ul className="chat-contact" data-simplebar>
                        {activeTab === 'chats' && (
                            filteredConversations.length > 0 ? (
                                filteredConversations.map(convo => <ChatListItem key={convo.id} conversation={convo} isActive={parseInt(activeUserId) === convo.other_user.id} />)
                            ) : <p className="text-center p-4 text-muted">No conversations found.</p>
                        )}

                        {activeTab === 'users' && (
                            loadingUsers ? <p className="text-center p-4 text-muted">Loading users...</p> :
                            filteredUsers.map(user => <UserListItem key={user.id} user={user} isActive={parseInt(activeUserId) === user.id} />)
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ChatList;