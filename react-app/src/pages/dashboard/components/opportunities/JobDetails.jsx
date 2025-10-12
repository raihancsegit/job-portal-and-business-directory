import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../context/AuthContext'; // নিশ্চিত করুন এই pathটি সঠিক
import { Link } from 'react-router-dom';
import PlainTextRenderer from '../../../../components/common/PlainTextRenderer';
// ======================================================
// ApplyModal Component
// এই কম্পোনেন্টটি JobDetails ফাইলের ভেতরেই থাকবে।
// ======================================================
const ApplyModal = ({ opportunity, onClose, showNotice, onApplySuccess }) => {
    const { api_base_url } = window.jpbd_object || {};
    const token = localStorage.getItem('authToken');
    const [candidateCvs, setCandidateCvs] = useState([]);
    const [selectedCv, setSelectedCv] = useState('');
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        const fetchCvs = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${api_base_url}candidate/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.data.cvs && response.data.cvs.length > 0) {
                    setCandidateCvs(response.data.cvs);
                    // ডিফল্ট হিসেবে প্রথম CV সিলেক্ট করা
                    setSelectedCv(JSON.stringify(response.data.cvs[0])); 
                }
            } catch (error) { 
                console.error("Failed to fetch CVs", error);
                showNotice("Could not load your CVs. Please try again.", "danger");
                if (error.response?.data?.code === 'already_applied') {
                    onApplySuccess(); // UI আপডেট করার জন্য প্যারেন্টকে জানানো
                    onClose(); // মডাল বন্ধ করা
                }
            } finally { 
                setLoading(false); 
                setApplying(false);
            }
        };
        fetchCvs();
    }, [api_base_url, token, showNotice]);

    const handleApply = async () => {
        if (!selectedCv) {
            showNotice("Please select a CV before applying.", "warning");
            return;
        }
        setApplying(true);
        try {
            const cvData = JSON.parse(selectedCv);
            await axios.post(`${api_base_url}applications`, {
                opportunity_id: opportunity.id,
                cv: cvData,
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            
            //showNotice('Application submitted successfully!', 'success');
            onApplySuccess(); // প্যারেন্টকে জানানো যে অ্যাপ্লাই সফল হয়েছে
            onClose(); // মডাল বন্ধ করা
        } catch (error) {
            showNotice(error.response?.data?.message || 'Failed to submit application.', 'danger');
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-5">
                    <div className="modal-body p-5 text-center">
                        <div className="modal-icon-outline mx-auto mb-4"><i className="ri-briefcase-line"></i></div>
                        <h4 className="mb-3">Apply for <span>{opportunity.job_title}</span>?</h4>
                        {loading ? <p>Loading your CVs...</p> : candidateCvs.length > 0 ? (
                            <div>
                                <label className="form-label">Select your CV</label>
                                <select className="form-select" value={selectedCv} onChange={e => setSelectedCv(e.target.value)}>
                                    {candidateCvs.map((cv, index) => (
                                        <option key={index} value={JSON.stringify(cv)}>{cv.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="alert alert-warning">
                                You have no saved CVs. Please <a href="/dashboard/settings" className="alert-link">add a CV in your profile</a> first.
                            </div>
                        )}
                    </div>
                    <div className="modal-footer px-5 border-0">
                        <button type="button" className="i-btn btn--lg btn--outline flex-grow-1" onClick={onClose} disabled={applying}>Close</button>
                        <button 
                            type="button" 
                            className="i-btn btn--lg btn--primary-dark flex-grow-1" 
                            onClick={handleApply} 
                            disabled={candidateCvs.length === 0 || applying || loading}
                        >
                            {applying ? 'Applying...' : 'Confirm Application'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// ======================================================
// নতুন: Contact Employer Modal Component
// ======================================================
const ContactModal = ({ opportunity, onClose, showNotice }) => {
    const { user, token } = useAuth();
    const { api_base_url } = window.jpbd_object || {};
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    // ================== পরিবর্তন এখানে (আপনার full name লজিক) ==================
    // AuthContext-এর user অবজেক্ট থেকে first_name এবং last_name ব্যবহার করা হচ্ছে
    const fullName = user?.first_name || user?.last_name 
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : user?.user_display_name;
    // ======================================================================

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            showNotice("Message cannot be empty.", "warning");
            return;
        }
        setSending(true);
        try {
            await axios.post(`${api_base_url}contact-employer`, {
                opportunity_id: opportunity.id,
                message: message,
            }, { headers: { 'Authorization': `Bearer ${token}` } });
            
            showNotice('Message sent successfully!', 'success');
            onClose();
        } catch (error) {
            showNotice(error.response?.data?.message || 'Failed to send message.', 'danger');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-5">
                    {/* <form> ট্যাগটি এখানে নিয়ে আসা হয়েছে যাতে পুরো মডালটি ফর্মের অংশ হয় */}
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body p-4">
                            {/* নতুন টাইটেল */}
                            <h4 className="mb-4 text--primary-dark">Contact Employer</h4>

                            {/* Your Name */}
                            <div className="mb-3">
                                <label htmlFor="contactName" className="form-label">Your Name</label>
                                <input 
                                    type="text" 
                                    id="contactName" 
                                    className="form-control bg-white" 
                                    value={fullName || ''} // fullName ভ্যারিয়েবল ব্যবহার করা হচ্ছে
                                    readOnly 
                                    disabled 
                                />
                            </div>
                            
                            {/* Email */}
                            <div className="mb-3">
                                <label htmlFor="contactEmail" className="form-label">Email</label>
                                <input 
                                    type="email" 
                                    id="contactEmail" 
                                    className="form-control bg-white" 
                                    value={user?.user_email || ''} 
                                    readOnly 
                                    disabled 
                                />
                            </div>

                            {/* Message */}
                            <div className="mb-3">
                                <label htmlFor="contactMessage" className="form-label">Message</label>
                                <textarea 
                                    id="contactMessage" 
                                    className="form-control bg-white" 
                                    rows="5" // rows 3 থেকে 5 করা হলো আরও জায়গার জন্য
                                    placeholder="Enter your message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer px-5 border-0">
                            <button 
                                type="button" 
                                className="i-btn btn--lg btn--outline flex-grow-1" 
                                onClick={onClose} 
                                disabled={sending}
                            >
                                Close
                            </button>
                            <button 
                                type="submit" 
                                className="i-btn btn--lg btn--primary-dark flex-grow-1"
                                disabled={sending}
                            >
                                {sending ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


// ======================================================
// JobDetails Component (সম্পূর্ণ এবং ফাইনাল সংস্করণ)
// ======================================================
const JobDetails = ({ opportunity, showNotice, activeTab,onApplySuccess,onWithdrawSuccess,onDeleteSuccess   }) => {
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const { user, token } = useAuth(); // token is needed for withdraw
    const { api_base_url } = window.jpbd_object || {};

    const allowedRoles = ['candidate', 'business'];
    const canApply = user && user.roles && user.roles.some(role => allowedRoles.includes(role));

    // Handle missing showNotice prop gracefully
    const displayNotice = showNotice || ((message, type) => {
        console.warn(`'showNotice' prop is missing. Notice not shown: [${type}] ${message}`);
    });

    if (!opportunity) {
        return (
            <div className="job-details-panel d-flex align-items-center justify-content-center h-100">
                <p className="text-muted">Select an opportunity from the left to see the details.</p>
            </div>
        );
    }
    
    const handleApplySuccess = () => {
        // প্যারেন্টকে opportunity ID পাঠানো হচ্ছে
        onApplySuccess(opportunity.id); 
    };

    const handleWithdraw = async () => {
        if (window.confirm("Are you sure you want to withdraw your application?")) {
            if (!opportunity.application_id) {
                showNotice("Cannot withdraw: Application ID is missing.", "danger");
                return;
            }
            try {
                await axios.delete(`${api_base_url}applications/${opportunity.application_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                // প্যারেন্টকে জানানো যে withdraw সফল হয়েছে
               onWithdrawSuccess(opportunity.id);
            } catch (error) {
                showNotice(error.response?.data?.message || 'Failed to withdraw application.', 'danger');
            }
        }
    };

     const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this opportunity?')) {
            try {
                await axios.delete(`${api_base_url}opportunities/${opportunity.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotice('Opportunity deleted successfully!', 'success');
                // You might want to navigate away or call a parent function to refresh the list
                // navigate('/dashboard/opportunities'); 
                 if (onDeleteSuccess) {
                    onDeleteSuccess(opportunity.id);
                }
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete opportunity.');
            }
        }
    };
    
    // Check for ownership
    const isOwner = user && opportunity && parseInt(user.id, 10) === parseInt(opportunity.user_id, 10);
    const renderActionButtons = () => {
        if (!canApply) return null;

        if (activeTab === 'applied') {
            return (
                <div className="d-flex gap-2">
                   

                     <button type="button" className="i-btn btn--dark btn--xl" onClick={() => setShowContactModal(true)}>
                        <i className="ri-mail-send-line me-2"></i> Contact Employer
                    </button>
                
                </div>
            );
        }

        return opportunity.has_applied ? (
            <button type="button" className="i-btn btn--success btn--xl" disabled>
                <i className="ri-check-line me-2"></i> Applied
            </button>
        ) : (
            <button type="button" className="i-btn btn--primary btn--xl" onClick={() => setShowApplyModal(true)}>
                Apply Now
            </button>
        );
    };

    return (
        <>
            <div className="job-details-panel">
                <div className="title-area">
                    <div className="icon"><i className="ri-briefcase-line"></i></div>
                    <div className="text">
                        <div className="d-flex justify-content-start align-items-center gap-2">
                            <h3>{opportunity.job_title}</h3> 
                            {isOwner && (
                        <div className="dropdown ms-auto me-0">
                            <button className="icon-btn-xl" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="ri-more-2-fill"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <Link className="dropdown-item" to={`/dashboard/update-opportunity/${opportunity.id}`}>
                                        <i className="ri-edit-box-line me-2"></i> Edit
                                    </Link>
                                </li>
                                <li>
                                    <a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); handleDelete(); }}>
                                        <i className="ri-delete-bin-line me-2"></i> Delete
                                    </a>
                                </li>
                            </ul>
                        </div>
                    )}
                        </div>
                        <p className="mb-0">{opportunity.location}</p>
                    </div>
                    <i className="fa-solid fa-bookmark ms-auto text-secondary fs-5 cursor-pointer"></i>
                </div>
                <div className="row g-3 text-center mb-4">
                    <div className="col-md-4"><div className="tiny-card"><p className="text-secondary small mb-0">Job type</p><h5 className="fw-semibold small mb-0">{opportunity.job_type}</h5></div></div>
                    <div className="col-md-4"><div className="tiny-card"><p className="text-secondary small mb-0">Workplace</p><h5 className="fw-semibold small mb-0">{opportunity.workplace}</h5></div></div>
                    <div className="col-md-4"><div className="tiny-card"><p className="text-secondary small mb-0">Experience</p><h5 className="fw-semibold small mb-0">{opportunity.experience}</h5></div></div>
                </div>
                <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-40">
                    <div className="desc-salary">
                        <p className="desc-subtitle">Salary</p>
                        <div className="post-salary"><p>{opportunity.salary_currency} {opportunity.salary_amount} <span>/{opportunity.salary_type}</span></p></div>
                    </div>
                    
                    {renderActionButtons()}
                </div>
                <div className="mb-4">
                    <p className="desc-subtitle mb-3">Description</p>
                    {/* Job Details এর জন্য PlainTextRenderer ব্যবহার করা হচ্ছে */}
                    <PlainTextRenderer text={opportunity.job_details} />
                </div>
                
                {/* Responsibilities এর জন্য PlainTextRenderer ব্যবহার করা হচ্ছে */}
                <PlainTextRenderer 
                    title="Responsibilities" 
                    text={opportunity.responsibilities} 
                />

                {/* Qualifications এর জন্য PlainTextRenderer ব্যবহার করা হচ্ছে */}
                <PlainTextRenderer 
                    title="Qualifications" 
                    text={opportunity.qualifications} 
                />
            </div>

            {showApplyModal && (
                <ApplyModal 
                    opportunity={opportunity} 
                    onClose={() => setShowApplyModal(false)}
                    showNotice={displayNotice}
                     onApplySuccess={handleApplySuccess}
                />
            )}

            {showContactModal && (
                <ContactModal 
                    opportunity={opportunity}
                    onClose={() => setShowContactModal(false)}
                    showNotice={displayNotice}
                />
            )}
        </>
    );
};

export default JobDetails;