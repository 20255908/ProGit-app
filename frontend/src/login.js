import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify({ email: user.email }));
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Please create an account first.');
      setPassword('');
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.find(u => u.email === email);

    if (userExists) {
      setError('Account already exists. Please sign in.');
      return;
    }

    // Create new user
    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    setSuccess('Account created successfully! Redirecting to login...');
    
    // Switch back to login after 2 seconds
    setTimeout(() => {
      setIsSignup(false);
      setSuccess('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }, 2000);
  };

  return (
    <div className="auth-container">
      <div className="circle-bg-1"></div>
      <div className="circle-bg-2"></div>
      
      {!isSignup ? (
        // LOGIN FORM
        <div className="auth-card login-card">
          <div className="logo">ProGit</div>
          <div className="title">Sign in</div>
          
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn">Sign in</button>
          </form>
          
          <div className="link">
            <a href="#" onClick={(e) => {
              e.preventDefault();
              setIsSignup(true);
              setError('');
              setSuccess('');
            }}>Create Account</a>
          </div>
        </div>
      ) : (
        // SIGNUP FORM
        <div className="auth-card signup-card">
          <div className="logo">ProGit</div>
          <div className="title">Create Account</div>
          
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}
          
          <form onSubmit={handleSignup}>
            <div className="input-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="btn">Create Account</button>
          </form>
          
          <div className="link">
            <a href="#" onClick={(e) => {
              e.preventDefault();
              setIsSignup(false);
              setError('');
              setSuccess('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}>← Back to Sign In</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
