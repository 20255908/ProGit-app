const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./progit.db');

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        joinDate TEXT NOT NULL
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        invitationCode TEXT UNIQUE NOT NULL,
        createdBy INTEGER NOT NULL,
        createdAt TEXT NOT NULL
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS project_collaborators (
        projectId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        joinedAt TEXT NOT NULL,
        PRIMARY KEY (projectId, userId)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        deadline TEXT,
        completed INTEGER DEFAULT 0,
        assignedTo INTEGER,
        createdAt TEXT NOT NULL
    )`);
    
    // Add demo users
    db.get("SELECT * FROM users WHERE email = 'student@progit.com'", (err, row) => {
        if (!row) {
            const hashedPassword = bcrypt.hashSync('password123', 10);
            const today = new Date().toISOString().split('T')[0];
            db.run("INSERT INTO users (name, email, password, joinDate) VALUES (?, ?, ?, ?)",
                ['Keiran Reyes', 'student@progit.com', hashedPassword, today]);
            db.run("INSERT INTO users (name, email, password, joinDate) VALUES (?, ?, ?, ?)",
                ['May Joy Agunod', 'team@progit.com', hashedPassword, today]);
        }
    });
});

// Middleware to verify token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    try {
        const user = jwt.verify(token, 'progit_secret_key_2026');
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
}

// ============ AUTH ROUTES ============
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            'progit_secret_key_2026',
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, joinDate: user.joinDate }
        });
    });
});

app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, existing) => {
        if (existing) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        
        const hashedPassword = bcrypt.hashSync(password, 10);
        const joinDate = new Date().toISOString().split('T')[0];
        
        db.run("INSERT INTO users (name, email, password, joinDate) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, joinDate],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create user' });
                }
                
                const token = jwt.sign(
                    { id: this.lastID, email, name },
                    'progit_secret_key_2026',
                    { expiresIn: '7d' }
                );
                
                res.json({
                    token,
                    user: { id: this.lastID, name, email, joinDate }
                });
            }
        );
    });
});

// ============ PROJECT ROUTES ============
app.get('/api/projects', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    db.all(`
        SELECT p.*, 
               (SELECT COUNT(*) FROM tasks WHERE projectId = p.id) as taskCount,
               (SELECT COUNT(*) FROM tasks WHERE projectId = p.id AND completed = 1) as completedCount
        FROM projects p
        JOIN project_collaborators pc ON p.id = pc.projectId
        WHERE pc.userId = ?
        ORDER BY p.createdAt DESC
    `, [userId], (err, projects) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(projects || []);
    });
});

app.get('/api/projects/:id', authenticateToken, (req, res) => {
    const projectId = req.params.id;
    const userId = req.user.id;
    
    db.get("SELECT * FROM projects WHERE id = ?", [projectId], (err, project) => {
        if (err || !project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        db.all("SELECT u.id, u.name, u.email FROM users u JOIN project_collaborators pc ON u.id = pc.userId WHERE pc.projectId = ?", [projectId], (err, collaborators) => {
            db.all("SELECT t.*, u.name as assignedToName FROM tasks t LEFT JOIN users u ON t.assignedTo = u.id WHERE t.projectId = ? ORDER BY t.completed ASC, t.deadline ASC", [projectId], (err, tasks) => {
                res.json({ ...project, collaborators: collaborators || [], tasks: tasks || [] });
            });
        });
    });
});

app.post('/api/projects', authenticateToken, (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id;
    
    const invitationCode = 'PROGIT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const createdAt = new Date().toISOString().split('T')[0];
    
    db.run("INSERT INTO projects (name, description, invitationCode, createdBy, createdAt) VALUES (?, ?, ?, ?, ?)",
        [name, description, invitationCode, userId, createdAt],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create project' });
            }
            
            db.run("INSERT INTO project_collaborators (projectId, userId, joinedAt) VALUES (?, ?, ?)",
                [this.lastID, userId, createdAt]);
            
            res.json({ id: this.lastID, name, description, invitationCode, createdAt });
        }
    );
});

app.post('/api/projects/join', authenticateToken, (req, res) => {
    const { invitationCode } = req.body;
    const userId = req.user.id;
    
    db.get("SELECT * FROM projects WHERE invitationCode = ?", [invitationCode], (err, project) => {
        if (err || !project) {
            return res.status(404).json({ error: 'Invalid invitation code' });
        }
        
        db.get("SELECT * FROM project_collaborators WHERE projectId = ? AND userId = ?", [project.id, userId], (err, existing) => {
            if (existing) {
                return res.status(400).json({ error: 'Already a member' });
            }
            
            db.run("INSERT INTO project_collaborators (projectId, userId, joinedAt) VALUES (?, ?, ?)",
                [project.id, userId, new Date().toISOString().split('T')[0]],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to join' });
                    }
                    res.json({ success: true, projectName: project.name });
                });
        });
    });
});

// ============ TASK ROUTES ============
app.post('/api/tasks', authenticateToken, (req, res) => {
    const { projectId, title, description, deadline, assignedTo } = req.body;
    const createdAt = new Date().toISOString().split('T')[0];
    
    db.run("INSERT INTO tasks (projectId, title, description, deadline, assignedTo, createdAt, completed) VALUES (?, ?, ?, ?, ?, ?, 0)",
        [projectId, title, description, deadline, assignedTo || null, createdAt],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create task' });
            }
            res.json({ id: this.lastID, projectId, title, description, deadline, assignedTo, createdAt });
        });
});

app.patch('/api/tasks/:id/toggle', authenticateToken, (req, res) => {
    const taskId = req.params.id;
    
    db.get("SELECT completed FROM tasks WHERE id = ?", [taskId], (err, task) => {
        if (err || !task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        const newStatus = task.completed ? 0 : 1;
        db.run("UPDATE tasks SET completed = ? WHERE id = ?", [newStatus, taskId], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update task' });
            }
            res.json({ success: true, completed: newStatus === 1 });
        });
    });
});

// ============ USER ROUTES ============
app.get('/api/users', authenticateToken, (req, res) => {
    db.all("SELECT id, name, email, joinDate FROM users ORDER BY name", [], (err, users) => {
        res.json(users || []);
    });
});

app.get('/api/users/:id/stats', authenticateToken, (req, res) => {
    const userId = req.params.id;
    
    db.get(`
        SELECT 
            (SELECT COUNT(*) FROM project_collaborators WHERE userId = ?) as totalProjects,
            (SELECT COUNT(*) FROM tasks WHERE assignedTo = ? AND completed = 1) as completedTasks,
            (SELECT COUNT(*) FROM tasks WHERE assignedTo = ?) as totalTasks
    `, [userId, userId, userId], (err, stats) => {
        res.json({
            totalProjects: stats?.totalProjects || 0,
            completedProjects: 0,
            completedTasks: stats?.completedTasks || 0,
            totalTasks: stats?.totalTasks || 0,
            completionRate: stats?.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0
        });
    });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 ProGit Backend running on http://localhost:${PORT}`);
    console.log(`📝 API available at http://localhost:${PORT}/api`);
});