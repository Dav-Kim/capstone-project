// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sector, setSector] = useState('Command Bridge');
  const [role, setRole] = useState('astronaut');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        sector,
        role,
        oxygenQuota: 95
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Crew registration protocol aborted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-terminal-tag">[ CREW ONBOARDING TERMINAL ]</span>
          <h2>ASTRONAUT ENLISTMENT</h2>
          <p>Register identity and sector assignment onto AstroHub-7 core ledger.</p>
        </div>

        {error && <div className="alert-box-critical">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <label>
            Full Name & Rank
            <input
              type="text"
              required
              placeholder="e.g., Spec. Frank Poole"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label>
            Orbital Comms Email
            <input
              type="email"
              required
              placeholder="poole@astrohub.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Station Passphrase
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <div className="form-row">
            <label>
              Station Sector
              <select value={sector} onChange={(e) => setSector(e.target.value)}>
                <option value="Command Bridge">Command Bridge</option>
                <option value="Hydroponics Bay">Hydroponics Bay</option>
                <option value="Propulsion & Core">Propulsion & Core</option>
                <option value="Airlock & EVA Bay">Airlock & EVA Bay</option>
                <option value="Life Support Ring">Life Support Ring</option>
              </select>
            </label>

            <label>
              Operational Role
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="astronaut">Astronaut</option>
                <option value="flight_director">Flight Director</option>
              </select>
            </label>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'ENROLLING CREW...' : 'FINALIZE REGISTRATION'}
          </button>
        </form>

        <div className="auth-footer-links">
          <span>Already registered on station?</span>
          <Link to="/login">Access Terminal Login</Link>
        </div>
      </div>
    </div>
  );
}