// src/pages/dashboard/employer/CandidateDetailsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// ===================================================================
// API Function
// ===================================================================
const { api_base_url } = window.jpbd_object || {};
const token = localStorage.getItem('authToken');
const authHeader = { headers: { 'Authorization': `Bearer ${token}` } };
 
 
const getCandidateProfileById = async (candidateId) => {
    try {
        const response = await axios.get(`${api_base_url}candidate/${candidateId}/profile`, authHeader);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch candidate profile";
    }
};

// ===================================================================
// Main CandidateDetailsPage Component
// ===================================================================
const CandidateDetailsPage = () => {
    const { assets_url } = window.jpbd_object;
    const { candidateId } = useParams(); // URL থেকে candidateId নিন (যেমন: /dashboard/candidate/123)
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!candidateId) return;
            try {
                setLoading(true);
                const data = await getCandidateProfileById(candidateId);
                setProfile(data);
                setError(null);
            } catch (err) {
                setError(err.toString());
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [candidateId]);

    if (loading) return <div className="p-4 text-center"><h5>Loading Profile...</h5></div>;
    if (error) return <div className="p-4 alert alert-danger">{error}</div>;
    if (!profile) return <div className="p-4 text-center"><h5>Profile not found.</h5></div>;

    const { user_info, profile_details } = profile;
    const skills = profile_details.skills ? profile_details.skills.split(',').map(skill => skill.trim()) : [];

    return (
        <div className="main-candidate-details">
            <div className="">
                <div className="row g-4">
                    {/* Left Column */}
                    <div className="col-lg-8 d-flex flex-column gap-4">
                        <div className="i-card-md radius-30 card-bg-two overflow-hidden p-0">
                            <div className="cover-photo position-relative">
                                <img src={`${assets_url}images/candidate/cover-photo.jpg`} alt="Cover" className="w-100 h-100 object-fit-cover" />
                            </div>
                            <div className="profile-content d-flex flex-column flex-md-row align-items-start justify-content-between">
                                <div className="d-flex align-items-center flex-wrap">
                                    <div className="profile-img-wrapper me-3">
                                        <img src={user_info.avatar || "/assets/images/candidate/profile-picture.jpg"} alt="Profile" className="profile-img" />
                                    </div>
                                    <div className="designation">
                                        <h5>{user_info.name}</h5>
                                        {user_info.location && <p><i className="ri-map-pin-line"></i> {user_info.location}</p>}
                                    </div>
                                </div>
                                <div>
                                    {profile_details.cvs && profile_details.cvs.length > 0 && (
                                        <a href={profile_details.cvs[0].file_url} target="_blank" rel="noopener noreferrer" className="i-btn btn--lg btn--outline rounded-pill text--primary-dark">
                                            <i className="ri-file-download-line me-2"></i>Download CV
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        {profile_details.about && (
                            <div className="i-card-md radius-30 card-bg-two">
                                <div className="card-body">
                                    <h4 className="mb-3">About {user_info.name.split(' ')[0]}</h4>
                                    <p className="fs-14 mb-3">{profile_details.about}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Experiences Section */}
                        {profile_details.experience && profile_details.experience.length > 0 && (
                            <div className="i-card-md radius-30 card-bg-two">
                                <div className="card-body">
                                    <h4 className="mb-4">Experiences</h4>
                                    {profile_details.experience.map((exp, index) => (
                                        <div key={index}>
                                            <div className="d-flex">
                                                <div className="me-3 flex-shrink-0">
                                                    <img src="/assets/images/candidate/experience-2.png" className="rounded-circle" width="50" height="50" alt={exp.company} />
                                                </div>
                                                <div>
                                                    <h5 className="mb-1">{exp.title}</h5>
                                                    <p className="text-muted mb-1">{exp.company} • {exp.startYear} - {exp.endYear || 'Present'}</p>
                                                    <p className="text-muted mb-1">{exp.location}</p>
                                                    <p className="mb-0">{exp.description}</p>
                                                </div>
                                            </div>
                                            {index < profile_details.experience.length - 1 && <hr className="my-4" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Educations Section */}
                        {profile_details.education && profile_details.education.length > 0 && (
                             <div className="i-card-md radius-30 card-bg-two">
                                <div className="card-body">
                                    <h4 className="mb-4">Educations</h4>
                                    {profile_details.education.map((edu, index) => (
                                        <div key={index}>
                                            <div className="d-flex">
                                                 <div className="me-3 flex-shrink-0">
                                                      <img src="/assets/images/candidate/edu-1.jpg" className="rounded-0" width="50" height="50" alt={edu.institution} />
                                                 </div>
                                                 <div>
                                                      <h5 className="mb-1">{edu.institution}</h5>
                                                      <p className="text-muted mb-1 font-bold">{edu.degree}</p>
                                                      <p className="text-muted mb-1 font-bold">{edu.startYear} - {edu.endYear || 'Present'}</p>
                                                      <p className="mb-0">{edu.description}</p>
                                                 </div>
                                            </div>
                                            {index < profile_details.education.length - 1 && <hr className="my-4" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="col-lg-4 d-flex flex-column gap-4">
                        <div className="i-card-md radius-30 card-bg-two">
                            <div className="card-body">
                                <h5 className="mb-3">Additional Details</h5>
                                <div className="address-item">
                                    <div className="icon"><i className="ri-mail-line"></i></div>
                                    <div className="address"><h6>Email</h6><a href={`mailto:${user_info.email}`}>{user_info.email}</a></div>
                                </div>
                                {user_info.phone && (
                                    <div className="address-item">
                                        <div className="icon"><i className="ri-smartphone-line"></i></div>
                                        <div className="address"><h6>Phone</h6><a href={`tel:${user_info.phone}`}>{user_info.phone}</a></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {skills.length > 0 && (
                            <div className="i-card-md radius-30 card-bg-two">
                                <div className="card-body">
                                    <h5 className="mb-3">Skills</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {skills.map((skill, index) => (
                                            <span key={index} className="badge rounded-pill skill-badge">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateDetailsPage;