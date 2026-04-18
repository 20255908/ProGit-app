import React, { useState } from 'react';
import './DashboardNew.css';

function DashboardNew({ user, onLogout }) {
    const [projects, setProjects] = useState([
        { id: 1, name: 'Website Redesign', description: 'Redesign the landing page UI and UX flows for Q3 launch.', progress: 65, dueDate: '2026-05-15', tasks: { completed: 8, total: 12 } },
        { id: 2, name: 'API Integration', description: 'Connect payment gateway and third-party API services.', progress: 40, dueDate: '2026-05-20', tasks: { completed: 4, total: 10 } },
        { id: 3, name: 'Mobile App', description: 'React Native app — sprint 2 in progress.', progress: 75, dueDate: '2026-05-10', tasks: { completed: 15, total: 20 } },
        { id: 4, name: 'Data Pipeline', description: 'ETL pipeline for analytics dashboard ingestion.', progress: 25, dueDate: '2026-05-30', tasks: { completed: 3, total: 12 } },
    ]);

    const [showNewProject, setShowNewProject] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });
    const [activities] = useState([]);
    const [teamMembers] = useState([]);

    const getUserInitials = () => {
        if (user?.fullName) {
            const nameParts = user.fullName.split(' ');
            if (nameParts.length >= 2) {
                return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
            }
            return user.fullName.substring(0, 2).toUpperCase();
        }
        if (user?.name) {
            return user.name.substring(0, 2).toUpperCase();
        }
        if (user?.email) {
            return user.email.substring(0, 2).toUpperCase();
        }
        return 'JD';
    };

    const getDisplayName = () => {
        if (user?.fullName) return user.fullName;
        if (user?.name) return user.name;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    };

    const getFirstName = () => {
        if (user?.fullName) return user.fullName.split(' ')[0];
        if (user?.name) return user.name.split(' ')[0];
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    };

    const handleCreateProject = () => {
        if (newProject.name) {
            setProjects([...projects, {
                id: projects.length + 1,
                name: newProject.name,
                description: newProject.description,
                progress: 0,
                dueDate: new Date().toISOString().split('T')[0],
                tasks: { completed: 0, total: 0 }
            }]);
            setNewProject({ name: '', description: '' });
            setShowNewProject(false);
        }
    };

    const totalTasks = projects.reduce((sum, p) => sum + p.tasks.completed, 0);
    const totalAllTasks = projects.reduce((sum, p) => sum + p.tasks.total, 0);
    const avgProgress = projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0;
    const initials = getUserInitials();
    const displayName = getDisplayName();
    const firstName = getFirstName();

    return (
        <div className="dashboard-container">
            <div className="dashboard">
                <div className="dashboard-header">
                    <div className="greeting">
                        <h1>Dashboard</h1>
                        <p>Welcome back, {firstName}. Here's what's happening with your projects.</p>
                    </div>
                    <div className="user-profile">
                        <div className="avatar">{initials}</div>
                        <div className="user-info">
                            <span>{displayName}</span>
                            <small>Product Studio</small>
                        </div>
                        <button className="logout-btn" onClick={onLogout}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="section-title">
                    <h2>My Projects</h2>
                    <button className="new-project-btn" onClick={() => setShowNewProject(true)}>+ New Project</button>
                </div>

                <div className="projects-grid">
                    {projects.map(project => (
                        <div key={project.id} className="project-card">
                            <div className="project-title">
                                <h3>{project.name}</h3>
                                <span className="status-badge">Active</span>
                            </div>
                            <div className="project-description">
                                {project.description}
                            </div>
                            <div className="card-footer">
                                <span className="active-tag">● Active</span>
                                <a href="#" className="view-link">View →</a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showNewProject && (
                <div className="modal-overlay" onClick={() => setShowNewProject(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Create New Project</h3>
                        <input
                            type="text"
                            placeholder="Project Name"
                            value={newProject.name}
                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        />
                        <textarea
                            placeholder="Description"
                            rows="3"
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        ></textarea>
                        <div className="modal-buttons">
                            <button className="cancel-btn" onClick={() => setShowNewProject(false)}>Cancel</button>
                            <button className="create-btn" onClick={handleCreateProject}>Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardNew;
