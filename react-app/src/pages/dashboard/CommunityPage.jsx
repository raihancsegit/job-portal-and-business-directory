// src/pages/dashboard/CommunityPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const { api_base_url } = window.jpbd_object || {};
const token = localStorage.getItem('authToken');

// ===================================================================
// ১. Create Post Modal Component
// ===================================================================
const CreatePostModal = ({ onClose, onPostCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const categories = ['Forum', 'User Stories', 'Knowledge Hub', 'Feature Request'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content || !category) {
            alert('Please fill all fields.');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${api_base_url}community/posts`, 
                { title, content, category },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            onPostCreated(response.data);
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create post.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Create a Post</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label htmlFor="postTitle" className="form-label">Title</label>
                                <input type="text" id="postTitle" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="postCategory" className="form-label">Category</label>
                                <select id="postCategory" className="form-select" value={category} onChange={e => setCategory(e.target.value)} required>
                                    <option value="">Select category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="postContent" className="form-label">Content</label>
                                <textarea id="postContent" className="form-control" rows="5" value={content} onChange={e => setContent(e.target.value)} required></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="i-btn btn--outline" onClick={onClose}>Cancel</button>
                            <button type="submit" className="i-btn btn--primary" disabled={loading}>{loading ? 'Posting...' : 'Create Post'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ===================================================================
// ২. PostItem Component (রিপ্লাই কার্যকারিতা সহ)
// ===================================================================
const PostItem = ({ post, onReplyAdded }) => {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replies, setReplies] = useState([]);
    const [newReply, setNewReply] = useState('');
    const [loadingReplies, setLoadingReplies] = useState(false);
    const [postingReply, setPostingReply] = useState(false);
    const { isAuthenticated } = useAuth();

    const handleToggleReplies = useCallback(async () => {
        const willBeOpen = !showReplyBox;
        setShowReplyBox(willBeOpen);

        if (willBeOpen && replies.length === 0 && post.reply_count > 0) {
            setLoadingReplies(true);
            try {
                const response = await axios.get(`${api_base_url}community/posts/${post.id}/replies`);
                setReplies(response.data);
            } catch (error) { console.error("Failed to fetch replies", error); }
            finally { setLoadingReplies(false); }
        }
    }, [post.id, showReplyBox, replies.length, post.reply_count]);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!newReply.trim()) return;
        setPostingReply(true);
        try {
            const response = await axios.post(
                `${api_base_url}community/posts/${post.id}/replies`,
                { content: newReply },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setReplies(prev => [...prev, response.data]);
            onReplyAdded(post.id); 
            setNewReply('');
        } catch (error) { alert("Failed to post reply."); }
        finally { setPostingReply(false); }
    };
    
    return (
        <div className="employ-post-item mb-4 border-bottom pb-3">
            <h6>{post.title}</h6>
            <p>{post.content}</p>
            <div className="d-flex justify-content-between gap-4 mt-3 flex-wrap">
                <small>Posted by {post.author_name} • {new Date(post.created_at).toLocaleDateString()}</small>
                {isAuthenticated && (
                    <button className="i-btn btn--sm btn--primary-dark" onClick={handleToggleReplies}>
                        {showReplyBox ? 'Hide Replies' : `Reply (${post.reply_count || 0})`}
                    </button>
                )}
            </div>
            {showReplyBox && (
                <div className="reply-section mt-3 ps-4 border-start">
                    {loadingReplies ? <p>Loading replies...</p> : replies.length > 0 ? replies.map(reply => (
                        <div key={reply.id} className="reply-item mb-2">
                            <p className="mb-0">{reply.content}</p>
                            <small className="text-muted">by {reply.author_name} • {new Date(reply.created_at).toLocaleDateString()}</small>
                        </div>
                    )) : <p className="text-muted small">No replies yet. Be the first to reply!</p>}
                    <form onSubmit={handleReplySubmit} className="mt-3">
                        <textarea className="form-control" rows="2" placeholder="Write a reply..." value={newReply} onChange={e => setNewReply(e.target.value)}></textarea>
                        <button type="submit" className="i-btn btn--sm btn--primary mt-2" disabled={postingReply}>{postingReply ? 'Posting...' : 'Post Reply'}</button>
                    </form>
                </div>
            )}
        </div>
    );
};

// ===================================================================
// ৩. Main CommunityPage Component
// ===================================================================
const CommunityPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { isAuthenticated } = useAuth();
    const categories = ['All', 'Forum', 'User Stories', 'Knowledge Hub', 'Feature Request'];

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeCategory && activeCategory !== 'All') params.append('category', activeCategory);
            if (searchTerm) params.append('search', searchTerm);
            const response = await axios.get(`${api_base_url}community/posts?${params.toString()}`);
            setPosts(response.data);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    }, [activeCategory, searchTerm]);

    useEffect(() => {
        const handler = setTimeout(() => { fetchPosts(); }, 300);
        return () => clearTimeout(handler);
    }, [fetchPosts]);
    
    const handlePostCreated = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
        if (activeCategory !== 'All') setActiveCategory('All');
    };

    const handleReplyAdded = (postId) => {
        setPosts(currentPosts => 
            currentPosts.map(post => {
                if (post.id === postId) {
                    return { ...post, reply_count: (Number(post.reply_count) || 0) + 1 };
                }
                return post;
            })
        );
    };

    const topThreads = [{title: 'Top 10 Best Practices'}, {title: 'How to Engage Your Audience'}];
    const popularTopics = ['Design', 'Content', 'Marketing', 'Tips', 'Knowledge'];

    return (
        <div className="main-community">
            {showModal && <CreatePostModal onClose={() => setShowModal(false)} onPostCreated={handlePostCreated} />}
            <div className="employ-comm-wrapper">
                <div className="employ-container">
                     <div className="row">
                          <div className="col-lg-8">
                               <div className="i-card-md radius-30 card-bg-two p-20">
                                    <div className="employ-main-content">
                                         <div className="d-flex justify-content-start flex-wrap gap-3 mb-40"><div className="community-search flex-grow-1"><input type="text" placeholder="Search posts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /><span className="search-icon"><i className="ri-search-line"></i></span></div></div>
                                         <div className="tab-slider-container">
                                              <div className="employ-tab-next swiper-button-next"><svg className="swiper-navigation-icon" width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor"></path></svg></div>
                                              <div className="employ-tab-prev swiper-button-prev"><svg className="swiper-navigation-icon" width="11" height="20" viewBox="0 0 11 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z" fill="currentColor"></path></svg></div>
                                              <Swiper modules={[Navigation]} spaceBetween={10} slidesPerView={'auto'} freeMode={true} navigation={{ nextEl: '.employ-tab-next', prevEl: '.employ-tab-prev' }} className="swiper employ-tab-swiper">
                                                   {categories.map(cat => ( <SwiperSlide key={cat} style={{ width: 'auto' }}><button className={`employ-tab-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button></SwiperSlide> ))}
                                               </Swiper>
                                          </div>
                                         {activeCategory === 'All' && !searchTerm && (<div className="i-card-md radius-30 card-bg-two bordered-card p-20 my-4"><div className="text-center"><h2>🎉 Welcome to the Community!</h2></div>
                                            <div className="card-body">
                                                  <p className="mb-3">Hi everyone, and welcome aboard! 🚀</p>
                                                  <p className="mb-3">We’re so excited to have you here. The BACC Community is a space
                                                       designed to inspire creativity, spark collaboration, and empower
                                                       you
                                                       to make the most of this incredible platform.</p>
                                                  <ul className="mb-4">
                                                       <li>🌟 Share your wins: Got an amazing workflow or content idea? Let us know!</li>
                                                       <li>💡 Ask questions: Need help or advice? The community is here to support you</li>
                                                       <li>📚 Learn and grow: Explore tips, trending GPTs, and insights shared by  by others.</li>
                                                       <li>🤝 Collaborate: Connect with creators, marketers, designers, and </li>
                                                  </ul>
                                                  <p class="mb-4">Don’t forget to introduce yourself in the comments below. Tell us
                                                       what
                                                       you’re working on, your goals! 👇</p>
                                                  <h6 class="text-muted font-bold mb-0">💬 The BACC Team</h6>
                                                  </div>
                                         </div>)}
                                         <div className="i-card-md radius-30 card-bg-two p-20 employ-mt-20"><div className="employ-header-row mb-4"><h3>Community Posts ({posts.length})</h3>{isAuthenticated && <button className="i-btn btn--xl btn--primary" onClick={() => setShowModal(true)}>Create a Post</button>}</div>
                                              {loading ? <p>Loading posts...</p> : posts.length > 0 ? posts.map(post => (
                                                  <PostItem key={post.id} post={post} onReplyAdded={handleReplyAdded} />
                                              )) : <p>No posts found for the selected criteria.</p>}
                                         </div>
                                    </div>
                               </div>
                          </div>
                          <div className="col-lg-4">
                               <div className="employ-sidebar">
                                    <h3 className="mb-4">Top Thread</h3><div className="i-card-md radius-30 card-bg-two mb-40"><div className="card-body"><ul className="employ-thread-list">{topThreads.map((thread, i) => <li key={i}><h5>{thread.title}</h5><p>Sample description...</p></li>)}</ul></div></div>
                                    <h3 className="mb-4">Popular Topics</h3><div className="employ-topics">{popularTopics.map(topic => <span key={topic} className="badge rounded-pill skill-badge style-two">{topic}</span>)}</div>
                               </div>
                          </div>
                     </div>
                </div>
           </div>
      </div>
    );
};

export default CommunityPage;