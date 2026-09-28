import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'astronaut',
    sector: 'Hydroponics Bay'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Please fill in all mandatory crew attributes.');
      return;
    }

    const result = await signup(formData);
    if (result.success) {
      if (result.user.role === 'flight_director') {
        navigate('/director-dashboard');
      } else {
        navigate('/astronaut-dashboard');
      }
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '520px', marginTop: '2.5rem' }}>
      <div className="astro-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
          <h2>New Personnel Onboarding</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Register new crew credentials into AstroHub-7 core database
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            padding: '0.75rem',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
             {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name & Rank</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Lt. Kara Thrace"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Station Comm Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="thrace@astrohub.org"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Security Keyphrase (Password)</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Assigned Sector</label>
              <select
                name="sector"
                className="form-select"
                value={formData.sector}
                onChange={handleChange}
              >
                <option value="Hydroponics Bay">Hydroponics Bay</option>
                <option value="Command Bridge">Command Bridge</option>
                <option value="Propulsion & Core">Propulsion & Core</option>
                <option value="Airlock & EVA Bay">Airlock & EVA Bay</option>
                <option value="Medical Subsystem">Medical Subsystem</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Clearance Role</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="astronaut">Astronaut (Field Crew)</option>
                <option value="flight_director">Flight Director (Admin)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} disabled={loading}>
            {loading ? 'Initializing Roster Profile...' : 'Complete Onboarding'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>Authenticate at Terminal</Link>
        </div>
      </div>
    </div>
  );
};