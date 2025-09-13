// src/pages/dashboard/components/opportunities/ApplicantsList.jsx

// ... (import এবং API ফাংশনগুলো অপরিবর্তিত)
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
const { api_base_url } = window.jpbd_object || {};
const token = localStorage.getItem('authToken');
const authHeader = { headers: { 'Authorization': `Bearer ${token}` } };
import { useAuth } from '../../../../context/AuthContext';

import { Link } from 'react-router-dom';
const getApplicantsByJobId = async (jobId) => { try { const response = await axios.get(`${api_base_url}opportunities/${jobId}/applications`, authHeader); return response.data; } catch (error) { throw error.response?.data?.message || "Failed to fetch applicants"; } };
const updateApplicantStatus = async (applicationId, status) => { try { const response = await axios.post(`${api_base_url}applications/${applicationId}/status`, { status }, authHeader); return response.data; } catch (error) { throw error.response?.data?.message || "Failed to update status"; } };
const ApplicantCardUI = ({ applicant }) => ( <div className="i-card-md bg-white shadow-sm"> <div className="card-body"> <div className="card-top"> <div className="applicant-info"> <div className="image"><img src={applicant.candidate_details?.avatar} alt={applicant.display_name} className="avatar" /></div> <div className="designation"><h6 className="name">{applicant.display_name}</h6><p className="role">{applicant.candidate_details?.title || 'Candidate'}</p></div> </div> <div className="dropdown"> <button className="menu-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="ri-more-2-fill"></i></button> <ul className="dropdown-menu dropdown-menu-end"> <li><a className="dropdown-item" href={applicant.cv_data?.file_url} target="_blank" rel="noopener noreferrer">View CV</a></li> <li><Link className="dropdown-item" to={`/dashboard/candidate/${applicant.candidate_user_id}`}>View Profile</Link></li> </ul> </div> </div> <div className="card-bottom"> <div className="meta"><span className="label">Applied On</span><span className="value">{new Date(applicant.created_at).toLocaleDateString()}</span></div> <div className="meta"><span className="label">Email</span><span className="value">{applicant.user_email}</span></div> </div> </div> </div> );
const SortableCard = ({ applicant }) => { const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: applicant.id }); const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.7 : 1, }; return ( <div ref={setNodeRef} style={style} {...attributes} {...listeners}><ApplicantCardUI applicant={applicant} /></div> ); };
const Column = ({ id, title, className, applicants }) => { const { setNodeRef } = useDroppable({ id }); return ( <div className="i-card-md bordered-card h-100 d-flex flex-column"> <div className="applicant-header"> <div className="d-flex align-items-center gap-2"> <span className={`status-dot ${className}`}></span> <h5 className="title">{title} ({applicants.length})</h5> </div> <button className="status-indicator new">
                                                       <span></span>
                                                       <span></span>
                                                       <span></span>
                                                  </button></div> <SortableContext items={applicants.map(a => a.id)} strategy={verticalListSortingStrategy}> <div ref={setNodeRef} className="applicant-card d-flex flex-column gap-3 flex-grow-1"> {applicants.map(applicant => ( <SortableCard key={applicant.id} applicant={applicant} /> ))} </div> </SortableContext> </div> ); };


const ApplicantsList = ({ opportunityId }) => {
    const { user, loading: authLoading } = useAuth();
    const [applicants, setApplicants] = useState({});
    const [activeApplicant, setActiveApplicant] = useState(null);
    const [startContainer, setStartContainer] = useState(null); // <-- নতুন state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

     const fetchAndCategorizeApplicants = useCallback(async () => {
        if (!opportunityId) return;
        try {
            setLoading(true);
            const data = await getApplicantsByJobId(opportunityId);
            const categorized = { new: [], shortlisted: [], hired: [] };
            if (Array.isArray(data)) {
                data.forEach(app => {
                    categorized[app.status]?.push(app);
                });
            }
            setApplicants(categorized);
            setError(null);
        } catch (err) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    }, [opportunityId]);

    useEffect(() => {
      
         // যদি auth এখনও লোড হয়, তাহলে অপেক্ষা করুন
        if (authLoading) {
            return;
        }
        // যদি ইউজার লগইন করা থাকে, তাহলে ডেটা ফেচ করুন
        if (user) {
            fetchAndCategorizeApplicants();
        } else {
            // যদি কোনো কারণে ইউজার না পাওয়া যায়, তাহলে এরর দেখান
            setError("You must be logged in to view applicants.");
            setLoading(false);
        }
        
    }, [opportunityId, user, authLoading, fetchAndCategorizeApplicants]);

    const findContainer = (id) => { if (id in applicants) { return id; } return Object.keys(applicants).find(key => applicants[key].some(item => item.id === id)); };
    
    const handleDragStart = (event) => {
        const { active } = event;
        const container = findContainer(active.id);
        setStartContainer(container); // <-- ড্র্যাগ শুরুর কন্টেইনার সেভ করা
        if (container) {
            setActiveApplicant(applicants[container].find(app => app.id === active.id) || null);
        }
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;
        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(over.id);
        if (!activeContainer || !overContainer || activeContainer === overContainer) return;

        setApplicants(prev => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.findIndex(item => item.id === active.id);
            const [movedItem] = activeItems.splice(activeIndex, 1);
            const overIndex = overItems.findIndex(item => item.id === over.id);
            const newIndex = overIndex >= 0 ? overIndex : overItems.length;
            overItems.splice(newIndex, 0, movedItem);
            return { ...prev };
        });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveApplicant(null);

        if (!over) return;

        const activeId = active.id;
        const overContainer = findContainer(over.id);
        const originalContainer = startContainer; // <-- সেভ করা আসল কন্টেইনার ব্যবহার করা
        setStartContainer(null);

        if (!originalContainer || !overContainer || originalContainer === overContainer) {
            return;
        }

        const newStatus = overContainer;
        console.log(`API Call will be made: Updating ${activeId} from ${originalContainer} to ${newStatus}`);
        
        updateApplicantStatus(activeId, newStatus)
            .catch(err => {
                console.error("Failed to update status:", err);
                alert("Could not save status. Reverting.");
                // API ফেইল করলে সার্ভার থেকে ডেটা রি-ফেচ করে UI ঠিক করা
                fetchAndCategorizeApplicants(); 
            });
    };

    if (authLoading || loading) return <div className="p-4 text-center"><h5>Loading...</h5></div>;
    
    if (error) return <div className="p-4 alert alert-danger">{error}</div>;

    const columnConfig = { new: { title: "New Applied", className: "new" }, shortlisted: { title: "Shortlisted", className: "shortlist" }, hired: { title: "Hired", className: "hired" } };

    return (
        <div className="applicants-kanban-board mt-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                <div className="row g-4 justify-content-center">
                    {Object.keys(columnConfig).map(columnId => ( <div key={columnId} className="col-xl-4 col-lg-6"> <Column id={columnId} title={columnConfig[columnId].title} className={columnConfig[columnId].className} applicants={applicants[columnId] || []} /> </div> ))}
                </div>
                <DragOverlay>{activeApplicant ? <SortableCard applicant={activeApplicant} /> : null}</DragOverlay>
            </DndContext>
        </div>
    );
};

export default ApplicantsList;