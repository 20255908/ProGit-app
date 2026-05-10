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
      createdAt: Date.now() - 86400000 * 30,
    },
    {
      id: 2,
      name: "API Integration",
      description: "Connect payment gateway and third-party auth services.",
      goalDate: "2026-11-15",
      goalTime: "18:00",
      status: "at-risk",
      label: "at-risk",
      isStatic: true,
      createdAt: Date.now() - 86400000 * 20,
    },
    {
      id: 3,
      name: "Mobile App",
      description: "React Native app — sprint 2 in progress.",
      goalDate: "2026-10-01",
      goalTime: "12:00",
      status: "overdue",
      label: "overdue",
      isStatic: true,
      createdAt: Date.now() - 86400000 * 10,
    },
    {
      id: 4,
      name: "Data Pipeline",
      description: "ETL pipeline for analytics dashboard ingestion.",
      goalDate: "2026-09-20",
      goalTime: "09:00",
      status: "finished",
      label: "finished",
      isStatic: true,
      createdAt: Date.now() - 86400000 * 5,
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

  // STATUS STYLES - Modern color system
  const getStatusStyle = (status, label) => {
    if (status === "finished" || label === "finished") {
      return {
        bg: "#94a3b820",
        borderColor: "#94a3b8",
        textColor: "#64748b",
        badgeBg: "#94a3b8",
        badgeText: "#ffffff",
        opacity: 0.85,
        label: "Finished"
      };
    }
    if (status === "overdue" || label === "overdue" || status === "ended" || label === "ended") {
      return {
        bg: "#ef444420",
        borderColor: "#ef4444",
        textColor: "#dc2626",
        badgeBg: "#ef4444",
        badgeText: "#ffffff",
        opacity: 1,
        label: "Overdue"
      };
    }
    if (status === "at-risk" || label === "at-risk") {
      return {
        bg: "#facc1520",
        borderColor: "#facc15",
        textColor: "#ca8a04",
        badgeBg: "#facc15",
        badgeText: "#854d0e",
        opacity: 1,
        label: "At Risk"
      };
    }
    return {
      bg: "#22c55e20",
      borderColor: "#22c55e",
      textColor: "#16a34a",
      badgeBg: "#22c55e",
      badgeText: "#ffffff",
      opacity: 1,
      label: "Active"
    };
  };

  // CENTRAL SORT FUNCTION
  const sortProjects = useCallback((projectsList) => {
    return [...projectsList].sort((a, b) => {
      const getPriority = (project) => {
        if (project.status === "active") return 1;
        if (project.status === "at-risk") return 2;
        if (project.status === "overdue" || project.status === "ended") return 3;
        if (project.status === "finished") return 4;
        return 5;
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      return b.createdAt - a.createdAt;
    });
  }, []);

  const getDeadlineDate = (goalDate, goalTime) => {
    if (!goalDate) return null;
    return new Date(`${goalDate} ${goalTime || "23:59"}`);
  };

  const checkIfOverdue = useCallback((project) => {
    if (project.status === "finished") return false;
    if (!project.goalDate) return false;
    
    const deadline = getDeadlineDate(project.goalDate, project.goalTime);
    if (!deadline) return false;
    
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (deadline <= now) return true;
    if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) return "at-risk";
    return false;
  }, []);

  const updateStatuses = useCallback(() => {
    setProjects(prevProjects => {
      const updated = prevProjects.map(p => {
        const checkResult = checkIfOverdue(p);
        if (checkResult === true && p.status !== "finished") {
          return { ...p, status: "overdue", label: "overdue" };
        } else if (checkResult === "at-risk" && p.status !== "finished") {
          return { ...p, status: "at-risk", label: "at-risk" };
        } else if (p.status !== "finished" && p.status !== "active" && checkResult === false) {
          return { ...p, status: "active", label: "ongoing" };
        }
        return p;
      });
      return sortProjects(updated);
    });
  }, [checkIfOverdue, sortProjects]);

  useEffect(() => {
    updateStatuses();
    const interval = setInterval(updateStatuses, 60000);
    return () => clearInterval(interval);
  }, [updateStatuses]);

  const handleCreateProject = () => {
    setDateError("");
    
    if (newProject.goalDate) {
      const deadline = getDeadlineDate(newProject.goalDate, newProject.goalTime);
      if (deadline && deadline <= new Date()) {
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
      const deadline = getDeadlineDate(newDate, newProject.goalTime);
      if (deadline && deadline <= new Date()) {
        setDateError("Project deadline cannot be in the past.");
      }
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setNewProject({ ...newProject, goalTime: newTime });
    setDateError("");
    
    if (newProject.goalDate && newTime) {
      const deadline = getDeadlineDate(newProject.goalDate, newTime);
      if (deadline && deadline <= new Date()) {
        setDateError("Project deadline cannot be in the past.");
      }
    }
  };

  const handleFinishClick = () => {
    setConfirmType('finished');
    setShowConfirmModal(true);
  };

  const handleEndClick = () => {
    setConfirmType('ended');
    setShowConfirmModal(true);
  };

  const handleDeleteClick = () => {
    setConfirmType('delete');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    setIsProcessing(true);
    
    if (confirmType === 'finished') {
      setProjects(prev => {
        const updated = prev.map(p => 
          p.id === selectedProject?.id ? { ...p, status: "finished", label: "finished" } : p
        );
        return sortProjects(updated);
      });
      setSuccessMessage("✓ Project finished!");
      setShowSuccessToast(true);
      
      setTimeout(() => {
        setShowConfirmModal(false);
        setConfirmType(null);
        setIsProcessing(false);
        setSelectedProject(null);
        setShowSuccessToast(false);
      }, 1500);
      
    } else if (confirmType === 'ended') {
      setProjects(prev => {
        const updated = prev.map(p => 
          p.id === selectedProject?.id ? { ...p, status: "overdue", label: "overdue" } : p
        );
        return sortProjects(updated);
      });
      setSuccessMessage("⚠️ Project ended!");
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

  const getCountdown = (goalDate, goalTime, status) => {
    if (status === "finished") return "Finished";
    if (!goalDate) return null;
    
    const deadline = getDeadlineDate(goalDate, goalTime);
    if (!deadline) return null;
    
    const now = new Date();
    const diff = deadline - now;
    
    if (diff <= 0) {
      return "Overdue";
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const gradientBg = {
  background: "linear-gradient(135deg, #1E3A4D 0%, #2B6A9F 100%)",
};

  const primaryGradient = {
    background: "linear-gradient(145deg, #2B6A9F, #1E4A6E)",
  };

  // Apply sorting before render
  const sortedProjects = sortProjects(projects);

  if (selectedProject) {
    const statusStyle = getStatusStyle(selectedProject.status, selectedProject.label);
    const countdown = getCountdown(
      selectedProject.goalDate, 
      selectedProject.goalTime, 
      selectedProject.status
    );
    const projectFileList = projectFiles[selectedProject.id] || [];
    const showTeamMembers = selectedProject.isStatic === true;

    return (
      <div className="min-vh-100" style={gradientBg}>
        {showSuccessToast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: confirmType === 'finished' ? '#22C55E' : (confirmType === 'ended' ? '#EF4444' : '#9CA3AF'),
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

        <div className="container py-4">
          <button 
            className="btn btn-secondary mb-3" 
            style={{ borderRadius: "10px" }}
            onClick={() => setSelectedProject(null)}
          >
            ← Back to Dashboard
          </button>

          <div className="card shadow-lg border-0 rounded-4" style={{ backgroundColor: "#ffffff", borderRadius: "16px" }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center pb-3 border-bottom" style={{ borderBottomColor: "#e2e8f0" }}>
                <div>
                  <h1 className="h2 mb-1" style={{ color: "#0f172a" }}>{selectedProject.name}</h1>
                  <p className="mb-0" style={{ color: "#64748b" }}>{selectedProject.description}</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2 rounded-5 px-3 py-2" style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                    <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: "42px", height: "42px" }}>
                      {user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <div className="fw-bold" style={{ color: "#0f172a" }}>{user?.name || "john_doe"}</div>
                      <small style={{ color: "#64748b" }}>Product Studio</small>
                    </div>
                  </div>
                  <button className="btn btn-danger" style={{ borderRadius: "10px" }} onClick={onLogout}>Logout</button>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-md-8">
                  {selectedProject.goalDate && selectedProject.status !== "finished" && (
                    <div className="rounded-4 p-3 mb-4 border-start border-4" style={{ borderLeftColor: statusStyle.borderColor, background: statusStyle.bg }}>
                      <div className="fw-bold" style={{ color: statusStyle.textColor }}>
                        Goal: {formatDate(selectedProject.goalDate)} at {selectedProject.goalTime}
                      </div>
                      <div className="h5 fw-bold my-2" style={{ color: "#0f172a" }}>
                        {countdown}
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        <button className="btn btn-success" style={{ borderRadius: "10px" }} onClick={handleFinishClick} disabled={isProcessing}>
                          ✓ Already Finished
                        </button>
                        <button className="btn btn-warning" style={{ borderRadius: "10px" }} onClick={handleEndClick} disabled={isProcessing}>
                          ⚠️ End Project
                        </button>
                        <button className="btn btn-danger" style={{ borderRadius: "10px" }} onClick={handleDeleteClick} disabled={isProcessing}>
                          🗑️ Delete Project
                        </button>
                      </div>
                    </div>
                  )}

                  {(selectedProject.status === "finished" || selectedProject.status === "overdue") && (
                    <div className="rounded-4 p-3 mb-4 border-start border-4" style={{ borderLeftColor: statusStyle.borderColor, background: statusStyle.bg }}>
                      <div className="fw-bold" style={{ color: statusStyle.textColor }}>
                        {statusStyle.label === "Finished" ? "✓ Project Finished!" : "⚠️ Project Overdue"}
                      </div>
                      {selectedProject.goalDate && (
                        <div className="small mt-1" style={{ color: "#64748b" }}>
                          Goal was set for {formatDate(selectedProject.goalDate)} at {selectedProject.goalTime}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="card-body">
                      <h5 className="card-title" style={{ color: "#0f172a" }}>File Upload</h5>
                      <p className="small" style={{ color: "#64748b" }}>Attach files to this project. Supported: PDF, PNG, JPG, ZIP, DOCX, and more.</p>

                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-4 p-5 text-center ${dragActive ? 'border-primary bg-light' : ''}`}
                        style={{ 
                          cursor: "pointer", 
                          transition: "all 0.2s ease",
                          borderColor: dragActive ? "#2B6A9F" : "#cbd5e1",
                          background: dragActive ? "#f8fafc" : "#ffffff"
                        }}
                      >
                        <div className="display-1 mb-2">📁</div>
                        <p className="mb-1" style={{ color: "#64748b" }}>Drag & drop files here</p>
                        <p className="small mb-3" style={{ color: "#94a3b8" }}>or</p>
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
                        <h6 className="fw-bold" style={{ color: "#0f172a" }}>Uploaded Files</h6>
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead className="small" style={{ color: "#64748b" }}>
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
                                  <td colSpan="4" className="text-center py-4" style={{ color: "#94a3b8" }}>No files uploaded yet</td>
                                </tr>
                              ) : (
                                projectFileList.map((file) => (
                                  <tr key={file.id}>
                                    <td>
                                      <span className="me-2">{getFileIcon(file.name)}</span>
                                      <span className="small me-1" style={{ color: "#94a3b8" }}>{getFileExtension(file.name)}</span>
                                      <span className="ms-1" style={{ color: "#0f172a" }}>{file.name}</span>
                                    </td>
                                    <td className="small" style={{ color: "#64748b" }}>{formatFileSize(file.size)}</td>
                                    <td>
                                      <span className={uploadingFiles[file.id] === "uploading" ? "text-warning" : "text-success"} style={{ fontSize: "0.875rem" }}>
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
                  <div className="card border-0 shadow-sm rounded-4" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                    <div className="card-body">
                      <h5 className="card-title fw-bold" style={{ color: "#0f172a" }}>Team Members</h5>
                      {showTeamMembers ? (
                        staticTeamMembers.map((m, i) => (
                          <div key={i} className="d-flex align-items-center gap-3 mt-3">
                            <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: "40px", height: "40px", background: m.color }}>
                              {m.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="fw-medium" style={{ color: "#0f172a" }}>{m.name}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4" style={{ color: "#94a3b8" }}>No team members assigned yet</div>
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
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            animation: 'fadeIn 0.2s ease'
          }} onClick={handleCancelAction}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '450px',
              width: '90%',
              textAlign: 'center',
              animation: 'scaleIn 0.2s ease',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {confirmType === 'finished' ? '✓' : (confirmType === 'delete' ? '🗑️' : '⚠️')}
              </div>
              <h3 style={{ color: '#0f172a', marginBottom: '0.75rem' }}>
                {confirmType === 'finished' ? 'Finish This Project?' : 
                 (confirmType === 'delete' ? 'Delete This Project?' : 'End This Project?')}
              </h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                {confirmType === 'finished' 
                  ? 'Are you sure you want to finish this project? It will be marked as finished and moved to the bottom.'
                  : (confirmType === 'delete'
                    ? 'Are you sure you want to delete this project? All files and data will be permanently removed. This action cannot be undone.'
                    : 'Are you sure you want to end this project? It will be marked as overdue and moved below active projects.')}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={handleConfirmAction}
                  disabled={isProcessing}
                  style={{
                    background: confirmType === 'finished' ? '#22C55E' : '#EF4444',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '10px',
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
                  {isProcessing ? 'Processing...' : (confirmType === 'finished' ? 'Yes, Finish It' : (confirmType === 'delete' ? 'Yes, Delete It' : 'Yes, End It'))}
                </button>
                <button 
                  onClick={handleCancelAction}
                  disabled={isProcessing}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessing) {
                      e.currentTarget.style.background = '#e2e8f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
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
    <div className="min-vh-100" style={gradientBg}>
      <div className="container py-4">
        <div className="card shadow-lg border-0 rounded-4" style={{ backgroundColor: "#ffffff", borderRadius: "16px" }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center pb-3 border-bottom" style={{ borderBottomColor: "#e2e8f0" }}>
              <div>
                <h1 className="h2 mb-1" style={{ color: "#0f172a" }}>Dashboard</h1>
                <p className="mb-0" style={{ color: "#64748b" }}>Welcome back, {user?.name || "john_doe"}.</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2 rounded-5 px-3 py-2" style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: "42px", height: "42px" }}>
                    {user?.name?.[0] || "U"}
                  </div>
                  <div>
                    <div className="fw-bold" style={{ color: "#0f172a" }}>{user?.name || "john_doe"}</div>
                    <small style={{ color: "#64748b" }}>Product Studio</small>
                  </div>
                </div>
                <button className="btn btn-danger" style={{ borderRadius: "10px" }} onClick={onLogout}>Logout</button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center my-4">
              <h2 className="h3 fw-bold mb-0" style={{ color: "#0f172a", borderBottom: "3px solid #2B6A9F", display: "inline-block", paddingBottom: "4px" }}>
                My Projects
              </h2>
              <button className="btn text-white px-4 py-2 rounded-3" style={primaryGradient} onClick={() => setShowModal(true)}>
                + New Project
              </button>
            </div>

            <div className="row g-4">
              {sortedProjects.map((project) => {
                const statusStyle = getStatusStyle(project.status, project.label);
                return (
                  <div key={project.id} className="col-md-6 col-lg-3">
                    <div 
                      className="card h-100 border-0 rounded-4"
                      style={{ 
                        cursor: "pointer",
                        backgroundColor: "#ffffff",
                        border: `1px solid ${statusStyle.borderColor}40`,
                        borderLeft: `4px solid ${statusStyle.borderColor}`,
                        transition: "all 0.25s ease",
                        opacity: statusStyle.opacity,
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
                      }}
                      onClick={() => setSelectedProject(project)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <h5 className="card-title fw-bold" style={{ color: "#0f172a", marginBottom: "0.5rem" }}>
                            {project.name}
                          </h5>
                          <span 
                            className="badge rounded-pill px-2 py-1"
                            style={{ 
                              background: statusStyle.badgeBg,
                              color: statusStyle.badgeText,
                              fontSize: "0.7rem"
                            }}
                          >
                            {statusStyle.label === "At Risk" ? "⚠️ At Risk" : (statusStyle.label === "Finished" ? "✓ Finished" : (statusStyle.label === "Overdue" ? "🔴 Overdue" : "🟢 Active"))}
                          </span>
                        </div>
                        <p className="card-text small mt-2" style={{ color: "#64748b" }}>{project.description}</p>
                        {project.goalDate && project.status !== "finished" && (
                          <div className="small fw-semibold mt-2" style={{ color: statusStyle.textColor }}>
                            Goal: {formatDate(project.goalDate)} at {project.goalTime}
                          </div>
                        )}
                        {project.status === "finished" && (
                          <div className="small fw-semibold mt-2" style={{ color: "#64748b" }}>✓ Project Finished</div>
                        )}
                        {project.status === "overdue" && (
                          <div className="small fw-semibold mt-2" style={{ color: "#dc2626" }}>⚠️ Project Overdue</div>
                        )}
                        {(projectFiles[project.id] || []).length > 0 && (
                          <div className="mt-2">
                            <div className="small mb-1" style={{ color: "#94a3b8" }}>Files ({projectFiles[project.id].length}):</div>
                            {(projectFiles[project.id] || []).slice(0, 2).map((file) => (
                              <div key={file.id} className="rounded-2 p-1 px-2 mb-1 small d-flex justify-content-between" style={{ background: "#f8fafc" }}>
                                <span>{getFileIcon(file.name)} {file.name}</span>
                                <span style={{ color: "#94a3b8" }}>{formatFileSize(file.size)}</span>
                              </div>
                            ))}
                            {(projectFiles[project.id] || []).length > 2 && (
                              <div className="small mt-1" style={{ color: "#94a3b8" }}>+{(projectFiles[project.id] || []).length - 2} more files</div>
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
            <div className="modal-content rounded-4" style={{ borderRadius: "16px" }}>
              <div className="modal-body p-4">
                <h4 className="modal-title mb-2" style={{ color: "#0f172a" }}>Create New Project</h4>
                <p className="small mb-4" style={{ color: "#64748b" }}>Fill in the details to create a new project.</p>

                {dateError && (
                  <div className="alert alert-danger py-2 mb-3" style={{ fontSize: "0.875rem", borderRadius: "12px" }}>
                    ⚠️ {dateError}
                  </div>
                )}

                <input
                  type="text"
                  className="form-control mb-3 py-3"
                  placeholder="Project Name"
                  style={{ borderRadius: "10px", borderColor: "#e2e8f0" }}
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
                <textarea
                  className="form-control mb-3"
                  placeholder="Description"
                  rows="3"
                  style={{ borderRadius: "10px", borderColor: "#e2e8f0" }}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
                <input
                  type="date"
                  className="form-control mb-3 py-3"
                  placeholder="Goal Date"
                  style={{ borderRadius: "10px", borderColor: "#e2e8f0" }}
                  value={newProject.goalDate}
                  onChange={handleDateChange}
                />
                <input
                  type="time"
                  className="form-control mb-4 py-3"
                  placeholder="Goal Time"
                  style={{ borderRadius: "10px", borderColor: "#e2e8f0" }}
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
                  <button className="btn px-4 py-2 rounded-3" style={{ background: "#f1f5f9", color: "#475569" }} onClick={() => {
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