import React, { useState, useEffect, useCallback } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

function DashboardNew({ user, onLogout }) {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Website Redesign",
      description: "Revamp the landing page UI and UX flows for Q3 launch.",
      goalDate: "2026-12-31",
      goalTime: "23:59",
      status: "active",
      label: "ongoing",
      isStatic: true,
      createdAt: 1704067200000,
    },
    {
      id: 2,
      name: "API Integration",
      description: "Connect payment gateway and third-party auth services.",
      goalDate: "2026-11-15",
      goalTime: "18:00",
      status: "active",
      label: "ongoing",
      isStatic: true,
      createdAt: 1704153600000,
    },
    {
      id: 3,
      name: "Mobile App",
      description: "React Native app — sprint 2 in progress.",
      goalDate: "2026-10-01",
      goalTime: "12:00",
      status: "active",
      label: "ongoing",
      isStatic: true,
      createdAt: 1704240000000,
    },
    {
      id: 4,
      name: "Data Pipeline",
      description: "ETL pipeline for analytics dashboard ingestion.",
      goalDate: "2026-09-20",
      goalTime: "09:00",
      status: "active",
      label: "ongoing",
      isStatic: true,
      createdAt: 1704326400000,
    },
  ]);

  const staticTeamMembers = [
    { name: "Keiran Reyes", color: "#06b6d4" },
    { name: "May Joy Agunod", color: "#22c55e" },
    { name: "Karylle Dampiles", color: "#f59e0b" },
    { name: "Merdy Francisco", color: "#ef4444" },
    { name: "Julie Ann Salva", color: "#a855f7" },
  ];

  const [selectedProject, setSelectedProject] = useState(null);
  const [projectFiles, setProjectFiles] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [dateError, setDateError] = useState("");
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    goalDate: "",
    goalTime: "",
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // CENTRAL SORT FUNCTION - THE ONLY PLACE SORTING HAPPENS
  const sortProjects = useCallback((projectsList) => {
    return [...projectsList].sort((a, b) => {
      // 1. inactive ALWAYS at bottom
      if (a.status !== b.status) {
        return a.status === "active" ? -1 : 1;
      }
      // 2. within same status → newest first (higher createdAt = newer)
      return b.createdAt - a.createdAt;
    });
  }, []);

  // Check if project should be inactive (deadline passed)
  const checkIfInactive = useCallback((project) => {
    if (project.status === "inactive") return true;
    if (!project.goalDate) return false;
    
    const deadline = new Date(`${project.goalDate} ${project.goalTime || "23:59"}`);
    const now = new Date();
    return deadline <= now;
  }, []);

  // Update status for all projects
  const updateStatuses = useCallback(() => {
    setProjects(prevProjects => {
      const updated = prevProjects.map(p => ({
        ...p,
        status: checkIfInactive(p) ? "inactive" : "active",
        label: checkIfInactive(p) ? "inactive" : p.label
      }));
      return sortProjects(updated);
    });
  }, [checkIfInactive, sortProjects]);

  // Get display label for UI
  const getDisplayLabel = (project) => {
    if (project.label === "finished") return { text: "Finished", color: "#9CA3AF", bg: "#F3F4F6", borderColor: "#9CA3AF", badgeColor: "#9CA3AF" };
    if (project.label === "ended") return { text: "Ended", color: "#EF4444", bg: "#FEF2F2", borderColor: "#EF4444", badgeColor: "#EF4444" };
    if (project.label === "disregarded") return { text: "Disregarded", color: "#6B7280", bg: "#E5E7EB", borderColor: "#6B7280", badgeColor: "#6B7280" };
    if (project.status === "inactive") return { text: "Inactive", color: "#9CA3AF", bg: "#F3F4F6", borderColor: "#9CA3AF", badgeColor: "#9CA3AF" };
    return { text: "Ongoing", color: "#22C55E", bg: "#FFFFFF", borderColor: "#22C55E", badgeColor: "#22C55E" };
  };

  const getDeadlineDate = (goalDate, goalTime) => {
    if (!goalDate) return null;
    return new Date(`${goalDate} ${goalTime || "23:59"}`);
  };

  const isDateInPast = (date, time) => {
    if (!date) return false;
    const deadline = new Date(`${date} ${time || "23:59"}`);
    const now = new Date();
    return deadline <= now;
  };

  const getCountdown = (goalDate, goalTime, status) => {
    if (status === "inactive") return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, display: "Inactive" };
    if (!goalDate) return null;
    
    const deadline = getDeadlineDate(goalDate, goalTime);
    if (!deadline) return null;
    
    const now = new Date();
    const diff = deadline - now;
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, display: "Inactive" };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    
    return { days, hours, minutes, seconds, isExpired: false, display: `${days}d ${hours}h ${minutes}m ${seconds}s` };
  };

  useEffect(() => {
    if (!selectedProject) return;

    const countdownInterval = setInterval(() => {
      const currentProject = projects.find(p => p.id === selectedProject.id);
      if (currentProject && currentProject.status === "active") {
        const becameInactive = checkIfInactive(currentProject);
        if (becameInactive && !showConfirmModal && !isProcessing) {
          setConfirmType('inactive');
          setShowConfirmModal(true);
        }
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [selectedProject, projects, checkIfInactive, showConfirmModal, isProcessing]);

  useEffect(() => {
    updateStatuses();
    const interval = setInterval(updateStatuses, 1000);
    return () => clearInterval(interval);
  }, [updateStatuses]);

  const handleCreateProject = () => {
    setDateError("");
    
    if (newProject.goalDate) {
      const isPast = isDateInPast(newProject.goalDate, newProject.goalTime);
      if (isPast) {
        setDateError("Project deadline cannot be in the past. Please select a valid future date and time.");
        return;
      }
    }
    
    if (!newProject.name.trim()) {
      setDateError("Project name is required.");
      return;
    }

    const newProjectObj = {
      id: Date.now(),
      name: newProject.name,
      description: newProject.description || "No description provided",
      goalDate: newProject.goalDate,
      goalTime: newProject.goalTime,
      status: "active",
      label: "ongoing",
      isStatic: false,
      createdAt: Date.now(),
    };

    setProjects(prev => sortProjects([...prev, newProjectObj]));

    setNewProject({ name: "", description: "", goalDate: "", goalTime: "" });
    setDateError("");
    setShowModal(false);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setNewProject({ ...newProject, goalDate: newDate });
    setDateError("");
    
    if (newDate && newProject.goalTime) {
      if (isDateInPast(newDate, newProject.goalTime)) {
        setDateError("Project deadline cannot be in the past.");
      }
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setNewProject({ ...newProject, goalTime: newTime });
    setDateError("");
    
    if (newProject.goalDate && newTime) {
      if (isDateInPast(newProject.goalDate, newTime)) {
        setDateError("Project deadline cannot be in the past.");
      }
    }
  };

  const handleMarkInactive = () => {
    setConfirmType('inactive');
    setShowConfirmModal(true);
  };

  const handleMarkFinished = () => {
    setConfirmType('finished');
    setShowConfirmModal(true);
  };

  const handleMarkDisregarded = () => {
    setConfirmType('disregarded');
    setShowConfirmModal(true);
  };

  const handleDeleteClick = () => {
    setConfirmType('delete');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    setIsProcessing(true);
    
    if (confirmType === 'inactive') {
      setProjects(prev => {
        const updated = prev.map(p => 
          p.id === selectedProject?.id ? { ...p, status: "inactive", label: "ended" } : p
        );
        return sortProjects(updated);
      });
      setSuccessMessage("⚠️ Project marked as inactive! Moving to bottom.");
      setShowSuccessToast(true);
      
      setTimeout(() => {
        setShowConfirmModal(false);
        setConfirmType(null);
        setIsProcessing(false);
        setSelectedProject(null);
        setShowSuccessToast(false);
      }, 1500);
      
    } else if (confirmType === 'finished') {
      setProjects(prev => {
        const updated = prev.map(p => 
          p.id === selectedProject?.id ? { ...p, status: "inactive", label: "finished" } : p
        );
        return sortProjects(updated);
      });
      setSuccessMessage("✓ Project finished! Moving to bottom.");
      setShowSuccessToast(true);
      
      setTimeout(() => {
        setShowConfirmModal(false);
        setConfirmType(null);
        setIsProcessing(false);
        setSelectedProject(null);
        setShowSuccessToast(false);
      }, 1500);
      
    } else if (confirmType === 'disregarded') {
      setProjects(prev => {
        const updated = prev.map(p => 
          p.id === selectedProject?.id ? { ...p, status: "inactive", label: "disregarded" } : p
        );
        return sortProjects(updated);
      });
      setSuccessMessage("📌 Project disregarded! Moving to bottom.");
      setShowSuccessToast(true);
      
      setTimeout(() => {
        setShowConfirmModal(false);
        setConfirmType(null);
        setIsProcessing(false);
        setSelectedProject(null);
        setShowSuccessToast(false);
      }, 1500);
      
    } else if (confirmType === 'delete') {
      const projectIdToDelete = selectedProject?.id;
      
      setProjects(prev => {
        const filtered = prev.filter(p => p.id !== projectIdToDelete);
        return sortProjects(filtered);
      });
      
      if (projectIdToDelete) {
        setProjectFiles(prev => {
          const newFiles = { ...prev };
          delete newFiles[projectIdToDelete];
          return newFiles;
        });
      }
      
      setSuccessMessage("🗑️ Project deleted!");
      setShowSuccessToast(true);
      
      setTimeout(() => {
        setShowConfirmModal(false);
        setConfirmType(null);
        setIsProcessing(false);
        setSelectedProject(null);
        setShowSuccessToast(false);
      }, 1500);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setConfirmType(null);
    setIsProcessing(false);
  };

  const generateFileId = (file) => {
    return `${file.name}-${file.size}-${Date.now()}`;
  };

  const simulateFileUpload = (fileId) => {
    setUploadingFiles((prev) => ({ ...prev, [fileId]: "uploading" }));
    setTimeout(() => {
      setUploadingFiles((prev) => ({ ...prev, [fileId]: "complete" }));
    }, 2000);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "🖼️";
    if (["mp4", "mov", "avi"].includes(ext)) return "🎥";
    if (["pdf"].includes(ext)) return "📕";
    if (["doc", "docx"].includes(ext)) return "📄";
    if (["zip", "rar"].includes(ext)) return "🗜️";
    return "📁";
  };

  const getFileExtension = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "PNG";
    if (["pdf"].includes(ext)) return "PDF";
    if (["doc", "docx"].includes(ext)) return "DOCX";
    if (["zip", "rar"].includes(ext)) return "ZIP";
    return ext.toUpperCase();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleRemoveFile = (projectId, fileId, e) => {
    e.stopPropagation();
    setProjectFiles((prev) => ({
      ...prev,
      [projectId]: prev[projectId].filter((f) => f.id !== fileId),
    }));
    setUploadingFiles((prev) => {
      const newState = { ...prev };
      delete newState[fileId];
      return newState;
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!selectedProject) return;
    const files = Array.from(e.dataTransfer.files);
    handleAddFiles(files);
  };

  const handleAddFiles = (files) => {
    if (!selectedProject) return;
    
    const fileArray = Array.from(files).map((file) => ({
      id: generateFileId(file),
      name: file.name,
      size: file.size,
      type: file.type,
      raw: file,
    }));
    
    fileArray.forEach(file => {
      setProjectFiles((prev) => ({
        ...prev,
        [selectedProject.id]: [...(prev[selectedProject.id] || []), file],
      }));
      simulateFileUpload(file.id);
    });
  };

  const handleBrowseFiles = (e) => {
    if (!selectedProject) return;
    const files = Array.from(e.target.files);
    handleAddFiles(files);
    e.target.value = null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline set";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const gradientBg = {
    background: "linear-gradient(135deg, #1E3A4D 0%, #2B6A9F 100%)",
  };

  const primaryGradient = {
    background: "linear-gradient(145deg, #2B6A9F, #1E4A6E)",
  };

  // USE THE SORT FUNCTION BEFORE RENDER
  const sortedProjects = sortProjects(projects);

  if (selectedProject) {
    const countdown = getCountdown(
      selectedProject.goalDate, 
      selectedProject.goalTime, 
      selectedProject.status
    );
    const projectFileList = projectFiles[selectedProject.id] || [];
    const isInactive = selectedProject.status === "inactive";
    const showTeamMembers = selectedProject.isStatic === true;
    const displayLabel = getDisplayLabel(selectedProject);

    return (
      <div className="min-vh-100 p-4" style={gradientBg}>
        {showSuccessToast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: confirmType === 'finished' ? '#22C55E' : (confirmType === 'inactive' ? '#EF4444' : (confirmType === 'disregarded' ? '#6B7280' : '#9CA3AF')),
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            zIndex: 3000,
            animation: 'slideIn 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {successMessage}
          </div>
        )}

        <div className="container">
          <button 
            className="btn btn-secondary mb-3" 
            onClick={() => setSelectedProject(null)}
          >
            ← Back to Dashboard
          </button>

          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center pb-3 border-bottom">
                <div>
                  <h1 className="h2 mb-1" style={{ color: "#1E3A4D" }}>{selectedProject.name}</h1>
                  <p className="text-muted mb-0">{selectedProject.description}</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2 bg-light rounded-5 px-3 py-2">
                    <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: "42px", height: "42px" }}>
                      {user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <div className="fw-bold" style={{ color: "#1F3B4C" }}>{user?.name || "john_doe"}</div>
                      <small className="text-muted">Product Studio</small>
                    </div>
                  </div>
                  <button className="btn btn-danger" onClick={onLogout}>Logout</button>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-md-8">
                  {selectedProject.goalDate && !isInactive && countdown && !countdown.isExpired && (
                    <div className="bg-light rounded-4 p-3 mb-4 border-start border-4" style={{ borderLeftColor: "#2B6A9F" }}>
                      <div className="fw-bold" style={{ color: "#2B6A9F" }}>
                        Goal: {formatDate(selectedProject.goalDate)} at {selectedProject.goalTime}
                      </div>
                      <div className="h4 fw-bold my-2" style={{ color: "#1E3A4D" }}>
                        Countdown: {countdown.display}
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        <button className="btn btn-success" onClick={handleMarkFinished} disabled={isProcessing}>
                          ✓ Already Finished This Project
                        </button>
                        <button className="btn btn-warning" onClick={handleMarkInactive} disabled={isProcessing}>
                          ⚠️ End This Project
                        </button>
                        <button className="btn btn-danger" onClick={handleDeleteClick} disabled={isProcessing}>
                          🗑️ Delete Project
                        </button>
                      </div>
                    </div>
                  )}

                  {(isInactive || (countdown && countdown.isExpired)) && (
                    <div className="rounded-4 p-3 mb-4 border-start border-4" style={{ borderLeftColor: displayLabel.borderColor, background: displayLabel.bg }}>
                      <div className="fw-bold" style={{ color: displayLabel.color }}>
                        {displayLabel.text === "Finished" ? "✓ Project Finished!" : (displayLabel.text === "Disregarded" ? "📌 Project Disregarded" : "⚠️ Project Has Ended!")}
                      </div>
                      {selectedProject.goalDate && (
                        <div className="small text-muted mt-1">
                          Goal was set for {formatDate(selectedProject.goalDate)} at {selectedProject.goalTime}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-body">
                      <h5 className="card-title" style={{ color: "#1E3A4D" }}>File Upload</h5>
                      <p className="text-muted small">Attach files to this project. Supported: PDF, PNG, JPG, ZIP, DOCX, and more.</p>

                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-4 p-5 text-center ${dragActive ? 'border-primary bg-light' : 'border-secondary'}`}
                        style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                      >
                        <div className="display-1 mb-2">📁</div>
                        <p className="text-muted mb-1">Drag & drop files here</p>
                        <p className="text-muted small mb-3">or</p>
                        <input
                          type="file"
                          multiple
                          id="file-upload-input"
                          className="d-none"
                          onChange={handleBrowseFiles}
                        />
                        <label htmlFor="file-upload-input" className="btn text-white px-4 py-2 rounded-3" style={primaryGradient}>
                          Browse Files
                        </label>
                      </div>

                      <div className="mt-4">
                        <h6 className="fw-bold" style={{ color: "#1F3B4C" }}>Uploaded Files</h6>
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead className="text-muted small">
                              <tr>
                                <th>File</th>
                                <th>Size</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {projectFileList.length === 0 ? (
                                <tr>
                                  <td colSpan="4" className="text-center text-muted py-4">No files uploaded yet</td>
                                </tr>
                              ) : (
                                projectFileList.map((file) => (
                                  <tr key={file.id}>
                                    <td>
                                      <span className="me-2">{getFileIcon(file.name)}</span>
                                      <span className="text-muted small me-1">{getFileExtension(file.name)}</span>
                                      <span className="ms-1">{file.name}</span>
                                    </td>
                                    <td className="text-muted small">{formatFileSize(file.size)}</td>
                                    <td>
                                      <span className={uploadingFiles[file.id] === "uploading" ? "text-warning" : "text-success"}>
                                        {uploadingFiles[file.id] === "uploading" ? "Uploading..." : "Complete"}
                                      </span>
                                    </td>
                                    <td>
                                      <button className="btn btn-sm btn-link text-danger" onClick={(e) => handleRemoveFile(selectedProject.id, file.id, e)}>
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body">
                      <h5 className="card-title fw-bold" style={{ color: "#1E3A4D" }}>Team Members</h5>
                      {showTeamMembers ? (
                        staticTeamMembers.map((m, i) => (
                          <div key={i} className="d-flex align-items-center gap-3 mt-3">
                            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: "40px", height: "40px", background: m.color }}>
                              {m.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="fw-medium" style={{ color: "#1F3B4C" }}>{m.name}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted py-4">No team members assigned yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONFIRMATION MODAL */}
        {showConfirmModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            animation: 'fadeIn 0.2s ease'
          }} onClick={handleCancelAction}>
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '2rem',
              maxWidth: '450px',
              width: '90%',
              textAlign: 'center',
              animation: 'scaleIn 0.2s ease',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {confirmType === 'finished' ? '✓' : (confirmType === 'delete' ? '🗑️' : (confirmType === 'disregarded' ? '📌' : '⚠️'))}
              </div>
              <h3 style={{ color: '#1E3A4D', marginBottom: '0.75rem' }}>
                {confirmType === 'finished' ? 'Finish This Project?' : 
                 (confirmType === 'delete' ? 'Delete This Project?' :
                 (confirmType === 'disregarded' ? 'Disregard This Project?' : 'End This Project?'))}
              </h3>
              <p style={{ color: '#5B6E8C', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                {confirmType === 'finished' 
                  ? 'Are you sure you want to finish this project? It will be marked as finished and moved to the bottom.'
                  : (confirmType === 'delete'
                    ? 'Are you sure you want to delete this project? All files and data will be permanently removed. This action cannot be undone.'
                    : (confirmType === 'disregarded'
                      ? 'Are you sure you want to disregard this project? It will be moved to the bottom of the project list.'
                      : 'Are you sure you want to end this project? It will be moved to the bottom of the project list.'))}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={handleConfirmAction}
                  disabled={isProcessing}
                  style={{
                    background: confirmType === 'finished' ? '#22C55E' : (confirmType === 'disregarded' ? '#6B7280' : '#EF4444'),
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessing) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.filter = 'brightness(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.filter = 'brightness(1)';
                  }}
                >
                  {isProcessing ? 'Processing...' : (confirmType === 'finished' ? 'Yes, Finish It' : (confirmType === 'delete' ? 'Yes, Delete It' : (confirmType === 'disregarded' ? 'Yes, Disregard It' : 'Yes, End It')))}
                </button>
                <button 
                  onClick={handleCancelAction}
                  disabled={isProcessing}
                  style={{
                    background: '#F3F4F6',
                    color: '#4B5563',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessing) {
                      e.currentTarget.style.background = '#E5E7EB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F3F4F6';
                  }}
                >
                  Cancel, Stay
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-vh-100 p-4" style={gradientBg}>
      <div className="container">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center pb-3 border-bottom">
              <div>
                <h1 className="h2 mb-1" style={{ color: "#1E3A4D" }}>Dashboard</h1>
                <p className="text-muted mb-0">Welcome back, {user?.name || "john_doe"}.</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2 bg-light rounded-5 px-3 py-2">
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: "42px", height: "42px" }}>
                    {user?.name?.[0] || "U"}
                  </div>
                  <div>
                    <div className="fw-bold" style={{ color: "#1F3B4C" }}>{user?.name || "john_doe"}</div>
                    <small className="text-muted">Product Studio</small>
                  </div>
                </div>
                <button className="btn btn-danger" onClick={onLogout}>Logout</button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center my-4">
              <h2 className="h3 fw-bold mb-0" style={{ color: "#1E3A4D", borderBottom: "3px solid #2B6A9F", display: "inline-block", paddingBottom: "4px" }}>
                My Projects
              </h2>
              <button className="btn text-white px-4 py-2 rounded-3" style={primaryGradient} onClick={() => setShowModal(true)}>
                + New Project
              </button>
            </div>

            <div className="row g-4">
              {sortedProjects.map((project) => {
                const status = getDisplayLabel(project);
                return (
                  <div key={project.id} className="col-md-6 col-lg-3">
                    <div 
                      className="card h-100 border-0 shadow-sm rounded-4"
                      style={{ 
                        cursor: "pointer", 
                        borderTop: `3px solid ${status.borderColor}`,
                        transition: "all 0.3s ease",
                        opacity: project.status === "inactive" ? 0.75 : 1,
                        backgroundColor: status.bg
                      }}
                      onClick={() => setSelectedProject(project)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow = "0 20px 30px -12px rgba(0, 0, 0, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <h5 className="card-title fw-bold" style={{ color: status.color }}>
                            {project.name}
                          </h5>
                          <span 
                            className="badge rounded-pill px-2 py-1"
                            style={{ 
                              background: status.badgeColor,
                              fontSize: "0.7rem"
                            }}
                          >
                            {status.text === "Disregarded" ? "📌 Disregarded" : (status.text === "Ended" ? "⚠️ Ended" : (status.text === "Finished" ? "✓ Finished" : (status.text === "Inactive" ? "● Inactive" : "● Ongoing")))}
                          </span>
                        </div>
                        <p className="card-text text-muted small mt-2">{project.description}</p>
                        {project.goalDate && project.status === "active" && (
                          <div className="small fw-semibold mt-2" style={{ color: "#2B6A9F" }}>
                            Goal: {formatDate(project.goalDate)} at {project.goalTime}
                          </div>
                        )}
                        {project.status === "inactive" && project.label === "finished" && (
                          <div className="small fw-semibold mt-2 text-secondary">✓ Project Finished</div>
                        )}
                        {project.status === "inactive" && project.label === "ended" && (
                          <div className="small fw-semibold mt-2 text-danger">⚠️ Project Ended</div>
                        )}
                        {project.status === "inactive" && project.label === "disregarded" && (
                          <div className="small fw-semibold mt-2" style={{ color: "#6B7280" }}>📌 Project Disregarded</div>
                        )}
                        {(projectFiles[project.id] || []).length > 0 && (
                          <div className="mt-2">
                            <div className="small text-muted mb-1">Files ({projectFiles[project.id].length}):</div>
                            {(projectFiles[project.id] || []).slice(0, 2).map((file) => (
                              <div key={file.id} className="bg-light rounded-2 p-1 px-2 mb-1 small d-flex justify-content-between">
                                <span>{getFileIcon(file.name)} {file.name}</span>
                                <span className="text-muted">{formatFileSize(file.size)}</span>
                              </div>
                            ))}
                            {(projectFiles[project.id] || []).length > 2 && (
                              <div className="small text-muted mt-1">+{(projectFiles[project.id] || []).length - 2} more files</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-4">
              <div className="modal-body p-4">
                <h4 className="modal-title mb-2" style={{ color: "#1E3A4D" }}>Create New Project</h4>
                <p className="text-muted small mb-4">Fill in the details to create a new project.</p>

                {dateError && (
                  <div className="alert alert-danger py-2 mb-3" style={{ fontSize: "0.875rem", borderRadius: "12px" }}>
                    ⚠️ {dateError}
                  </div>
                )}

                <input
                  type="text"
                  className="form-control mb-3 py-3"
                  placeholder="Project Name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
                <textarea
                  className="form-control mb-3"
                  placeholder="Description"
                  rows="3"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
                <input
                  type="date"
                  className="form-control mb-3 py-3"
                  placeholder="Goal Date"
                  value={newProject.goalDate}
                  onChange={handleDateChange}
                />
                <input
                  type="time"
                  className="form-control mb-4 py-3"
                  placeholder="Goal Time"
                  value={newProject.goalTime}
                  onChange={handleTimeChange}
                />

                <div className="d-flex gap-3 justify-content-center">
                  <button 
                    className="btn text-white px-4 py-2 rounded-3" 
                    style={primaryGradient} 
                    onClick={handleCreateProject}
                    disabled={!!dateError}
                  >
                    Create
                  </button>
                  <button className="btn btn-secondary px-4 py-2 rounded-3" onClick={() => {
                    setShowModal(false);
                    setDateError("");
                    setNewProject({ name: "", description: "", goalDate: "", goalTime: "" });
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardNew;