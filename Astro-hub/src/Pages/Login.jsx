// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication sequence failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    try {
      await login(demoEmail, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-terminal-tag">[ ASTRO-AUTH PROTOCOL v7.2 ]</span>
          <h2>CREW VERIFICATION</h2>
          <p>Provide mission identity credentials to initialize orbital terminal.</p>
        </div>

        {error && <div className="alert-box-critical">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <label>
            Orbital Comms Email
            <input
              type="email"
              required
              placeholder="e.g., ripley@astrohub.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Station Security Key
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'INITIALIZE UPLINK'}
          </button>
        </form>

        <div className="quick-access-box">
          <span className="quick-access-label">ORBITAL PRESET CREW CREDENTIALS</span>
          <div className="quick-btns">
            <button onClick={() => handleQuickLogin('ripley@astrohub.org')}>
              Cmdr. Ripley (Director)
            </button>
            <button onClick={() => handleQuickLogin('watney@astrohub.org')}>
              Dr. Watney (Hydroponics)
            </button>
            <button onClick={() => handleQuickLogin('cooper@astrohub.org')}>
              Lt. Cooper (Propulsion)
            </button>
            <button onClick={() => handleQuickLogin('stone@astrohub.org')}>
              Dr. Stone (EVA Bay)
            </button>
          </div>
        </div>

        <div className="auth-footer-links">
          <span>Unregistered astronaut?</span>
          <Link to="/register">Initiate Crew Enlistment</Link>
        </div>
      </div>
    </div>
  );
}