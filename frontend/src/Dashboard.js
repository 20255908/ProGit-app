import React, { useState } from "react";

function DashboardNew({ user, onLogout }) {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Website Redesign",
      description: "Revamp the landing page UI and UX flows for Q3 launch.",
    },
    {
      id: 2,
      name: "API Integration",
      description: "Connect payment gateway and third-party auth services.",
    },
    {
      id: 3,
      name: "Mobile App",
      description: "React Native app — sprint 2 in progress.",
    },
    {
      id: 4,
      name: "Data Pipeline",
      description: "ETL pipeline for analytics dashboard ingestion.",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ 
    name: "", 
    description: "",
    goalDate: "",
    goalTime: ""
  });
  
  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;

    setProjects([
      ...projects,
      {
        id: projects.length + 1,
        name: newProject.name,
        description: newProject.description || "No description provided",
      },
    ]);

    setNewProject({ name: "", description: "", goalDate: "", goalTime: "" });
    setShowModal(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          borderBottom: "2px solid #06b6d4",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem", color: "#22d3ee" }}>
            ProGit
          </span>
          <span style={{ color: "#64748b" }}>/ Dashboard</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span>Dashboard</span>
          <span>Project</span>

          <div
            style={{
              background: "#0891b2",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {user?.name?.[0] || "U"}
          </div>

          <span>{user?.name || "john_doe"}</span>

          <button
            onClick={onLogout}
            style={{
              background: "#ef4444",
              border: "none",
              padding: "6px 12px",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>
          Dashboard
        </h1>

        <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
          Welcome back, {user?.name || "john_doe"}.
        </p>

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              borderBottom: "2px solid #06b6d4",
              display: "inline-block",
              paddingBottom: "4px",
            }}
          >
            My Projects
          </h2>

          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "#06b6d4",
              color: "#022c22",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            + New Project
          </button>
        </div>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "3fr 1fr",
            gap: "1.5rem",
          }}
        >
          {/* PROJECTS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1.5rem",
            }}
          >
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  background: "#020617",
                  border: "1px solid #0f172a",
                  borderTop: "3px solid #06b6d4",
                  borderRadius: "10px",
                  padding: "1.2rem",
                }}
              >
                <h3>{project.name}</h3>
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>
                  {project.description}
                </p>
              </div>
            ))}
          </div>

          {/* TEAM */}
          <div
            style={{
              background: "#020617",
              border: "1px solid #0f172a",
              borderTop: "3px solid #06b6d4",
              borderRadius: "10px",
              padding: "1rem",
            }}
          >
            <h3>Team Members</h3>

            {[
              { name: "Keiran Reyes", role: "Lead", color: "#06b6d4" },
              { name: "May Joy Agunod", role: "Frontend", color: "#22c55e" },
              { name: "Karylle Dampiles", role: "Backend", color: "#f59e0b" },
              { name: "Merdy Francisco", role: "UI/UX", color: "#ef4444" },
            ].map((m, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: m.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {m.name.split(" ").map((n) => n[0]).join("")}
                </div>

                <div>
                  <div>{m.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                    {m.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL - Styled like your Create New Task design */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0f172a",
              borderRadius: "12px",
              borderTop: "3px solid #06b6d4",
              padding: "2rem",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <h2 style={{
              color: "white",
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}>
              Create New Project
            </h2>

            <p style={{
              color: "#64748b",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
            }}>
              Fill in the details below to add a new project.
            </p>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{
                display: "block",
                color: "white",
                fontSize: "0.875rem",
                marginBottom: "0.5rem",
              }}>
                Project Name <span style={{ color: "#ef4444" }}>required</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Website Redesign"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "0.875rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{
                display: "block",
                color: "white",
                fontSize: "0.875rem",
                marginBottom: "0.5rem",
              }}>
                Description
              </label>
              <textarea
                placeholder="Describe the project, goals, requirements..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "0.875rem",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}>
              <div>
                <label style={{
                  display: "block",
                  color: "white",
                  fontSize: "0.875rem",
                  marginBottom: "0.5rem",
                }}>
                  Goal Date
                </label>
                <input
                  type="text"
                  placeholder="MM / DD / YYYY"
                  value={newProject.goalDate}
                  onChange={(e) => setNewProject({ ...newProject, goalDate: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: "block",
                  color: "white",
                  fontSize: "0.875rem",
                  marginBottom: "0.5rem",
                }}>
                  Goal Time
                </label>
                <input
                  type="text"
                  placeholder="HH : MM"
                  value={newProject.goalTime}
                  onChange={(e) => setNewProject({ ...newProject, goalTime: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
            }}>
              <button
                onClick={handleCreateProject}
                style={{
                  padding: "0.75rem 2rem",
                  background: "#06b6d4",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => e.target.style.background = "#0891b2"}
                onMouseOut={(e) => e.target.style.background = "#06b6d4"}
              >
                Create Project
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "0.75rem 2rem",
                  background: "#475569",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => e.target.style.background = "#64748b"}
                onMouseOut={(e) => e.target.style.background = "#475569"}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardNew;