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

    // Get user initials
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

    // Get display name
    const getDisplayName = () => {
        if (user?.fullName) return user.fullName;
        if (user?.name) return user.name;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    };

    // Get first name for greeting
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
    const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length);
    const initials = getUserInitials();
    const displayName = getDisplayName();
    const firstName = getFirstName();

    return (
        <div className="dashboard-new-container">
            {/* Header */}
            <div className="dashboard-new-header">
                <div className="dashboard-new-logo">
                    <span className="logo-icon">🚀</span>
                    <span className="logo-text">ProGit</span>
                </div>
                <div className="dashboard-new-user">
                    <div className="user-avatar">{initials}</div>
                    <div className="user-details">
                        <span className="user-name">{displayName}</span>
                        <span className="user-role">Product Studio</span>
                    </div>
                    <button className="logout-button" onClick={onLogout}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>

            <div className="dashboard-new-content">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1>Dashboard</h1>
                    <p>Welcome back, {firstName}. Here's what's happening with your projects.</p>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{projects.length}</div>
                        <div className="stat-label">Active Projects</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{totalTasks}/{totalAllTasks}</div>
                        <div className="stat-label">Tasks Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">5</div>
                        <div className="stat-label">Team Members</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{avgProgress}%</div>
                        <div className="stat-label">Avg Progress</div>
                    </div>
                </div>

                {/* Projects Section */}
                <div className="projects-section">
                    <div className="projects-header">
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
                                <p className="project-description">{project.description}</p>
                                <div className="progress-section">
                                    <div className="progress-label">
                                        <span>Progress</span>
                                        <span>{project.progress}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                                    </div>
                                </div>
                                <div className="project-footer">
                                    <span className="due-date">📅 Due {new Date(project.dueDate).toLocaleDateString()}</span>
                                    <span className="task-count">✅ {project.tasks.completed}/{project.tasks.total} tasks</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="bottom-section">
                    {/* Recent Activity */}
                    <div className="activity-card">
                        <h2>🕐 Recent Activity</h2>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-avatar kr">KR</div>
                                <div className="activity-content">
                                    <strong>Keiran Reyes</strong> completed task <strong>"Design Database Schema"</strong> in <span className="project-name">E-Learning Platform</span>
                                    <div className="activity-time">2 hours ago</div>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-avatar mj">MJ</div>
                                <div className="activity-content">
                                    <strong>May Joy Agunod</strong> added new task <strong>"User Authentication"</strong> in <span className="project-name">E-Learning Platform</span>
                                    <div className="activity-time">5 hours ago</div>
                                </div>
                            </div>
                            <div className="activity-item">
                                <div className="activity-avatar kd">KD</div>
                                <div className="activity-content">
                                    <strong>Karylle Dampiles</strong> joined project <span className="project-name">Mobile Weather App</span>
                                    <div className="activity-time">1 day ago</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="team-card">
                        <h2>👥 Team Members</h2>
                        <div className="team-list">
                            <div className="team-member">
                                <div className="member-avatar kr">KR</div>
                                <div className="member-info">
                                    <div className="member-name">Keiran Reyes</div>
                                    <div className="member-role">Project Lead</div>
                                </div>
                                <div className="member-status online"></div>
                            </div>
                            <div className="team-member">
                                <div className="member-avatar mj">MJ</div>
                                <div className="member-info">
                                    <div className="member-name">May Joy Agunod</div>
                                    <div className="member-role">Frontend Dev</div>
                                </div>
                                <div className="member-status online"></div>
                            </div>
                            <div className="team-member">
                                <div className="member-avatar kd">KD</div>
                                <div className="member-info">
                                    <div className="member-name">Karylle Dampiles</div>
                                    <div className="member-role">Backend Dev</div>
                                </div>
                                <div className="member-status offline"></div>
                            </div>
                            <div className="team-member">
                                <div className="member-avatar mf">MF</div>
                                <div className="member-info">
                                    <div className="member-name">Merdy Francisco</div>
                                    <div className="member-role">UI/UX Designer</div>
                                </div>
                                <div className="member-status online"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Project Modal */}
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
