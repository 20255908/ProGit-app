import React, { useState } from 'react';

function DashboardNew({ user, onLogout }) {
    const [projects, setProjects] = useState([
        { id: 1, name: 'Website Redesign', description: 'Revamp the landing page UI and UX flows for Q3 launch.', progress: 65, dueDate: '2026-05-15', tasks: { completed: 8, total: 12 } },
        { id: 2, name: 'API Integration', description: 'Connect payment gateway and third-party auth services.', progress: 40, dueDate: '2026-05-20', tasks: { completed: 4, total: 10 } },
        { id: 3, name: 'Mobile App', description: 'React Native app — sprint 2 in progress.', progress: 75, dueDate: '2026-05-10', tasks: { completed: 15, total: 20 } },
        { id: 4, name: 'Data Pipeline', description: 'ETL pipeline for analytics dashboard ingestion.', progress: 25, dueDate: '2026-05-30', tasks: { completed: 3, total: 12 } },
    ]);

    const [showNewProject, setShowNewProject] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });

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

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Navbar */}
            <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.8rem' }}>🚀</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>ProGit</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#374151' }}>Hello, {user?.name?.split(' ')[0] || 'User'}</span>
                    <button onClick={onLogout} style={{ background: '#f56565', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
                </div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                {/* Welcome Section */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', color: '#1f2937', marginBottom: '0.25rem' }}>Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
                    <p style={{ color: '#6b7280' }}>Here's what's happening with your projects today.</p>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#667eea' }}>{projects.length}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Active Projects</div>
                    </div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#667eea' }}>{totalTasks}/{totalAllTasks}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Tasks Completed</div>
                    </div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#667eea' }}>5</div>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Team Members</div>
                    </div>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#667eea' }}>{avgProgress}%</div>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Avg Progress</div>
                    </div>
                </div>

                {/* Projects Section */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.3rem', color: '#1f2937' }}>📁 My Projects</h2>
                        <button onClick={() => setShowNewProject(true)} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>+ New Project</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                        {projects.map(project => (
                            <div key={project.id} style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>{project.name}</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.4' }}>{project.description}</p>

                                <div style={{ marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                        <span>Progress</span>
                                        <span>{project.progress}%</span>
                                    </div>
                                    <div style={{ background: '#e5e7eb', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
                                        <div style={{ width: `${project.progress}%`, height: '100%', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '10px' }}></div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f0f2f5' }}>
                                    <span>📅 Due {new Date(project.dueDate).toLocaleDateString()}</span>
                                    <span>✅ {project.tasks.completed}/{project.tasks.total} tasks</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
                    {/* Recent Activity */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.1rem', color: '#1f2937', marginBottom: '1rem' }}>🕐 Recent Activity</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '10px', padding: '0.5rem', borderRadius: '8px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>KR</div>
                                <div><strong>Keiran Reyes</strong> completed task <strong>"Design Database Schema"</strong> <span style={{ color: '#667eea' }}>in E-Learning Platform</span><div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>2 hours ago</div></div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', padding: '0.5rem', borderRadius: '8px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#48bb78', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>MJ</div>
                                <div><strong>May Joy Agunod</strong> added new task <strong>"User Authentication"</strong> <span style={{ color: '#667eea' }}>in E-Learning Platform</span><div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>5 hours ago</div></div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', padding: '0.5rem', borderRadius: '8px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>KD</div>
                                <div><strong>Karylle Dampiles</strong> joined project <span style={{ color: '#667eea' }}>Mobile Weather App</span><div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>1 day ago</div></div>
                            </div>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.1rem', color: '#1f2937', marginBottom: '1rem' }}>👥 Team Members</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.5rem', borderRadius: '8px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>KR</div>
                                <div style={{ flex: 1 }}><div style={{ fontWeight: '600' }}>Keiran Reyes</div><div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Project Lead</div></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.5rem', borderRadius: '8px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#48bb78', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>MJ</div>
                                <div style={{ flex: 1 }}><div style={{ fontWeight: '600' }}>May Joy Agunod</div><div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Frontend Dev</div></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.5rem', borderRadius: '8px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>KD</div>
                                <div style={{ flex: 1 }}><div style={{ fontWeight: '600' }}>Karylle Dampiles</div><div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Backend Dev</div></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9ca3af' }}></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.5rem', borderRadius: '8px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>MF</div>
                                <div style={{ flex: 1 }}><div style={{ fontWeight: '600' }}>Merdy Francisco</div><div style={{ fontSize: '0.7rem', color: '#6b7280' }}>UI/UX Designer</div></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Project Modal */}
            {showNewProject && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowNewProject(false)}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', width: '400px', maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Create New Project</h3>
                        <input
                            type="text"
                            placeholder="Project Name"
                            value={newProject.name}
                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem' }}
                        />
                        <textarea
                            placeholder="Description"
                            rows="3"
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit' }}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowNewProject(false)} style={{ flex: 1, padding: '0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleCreateProject} style={{ flex: 1, padding: '0.5rem', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardNew;