// src/components/Navbar.jsx
import React from 'react';
import { useAuth } from './Context/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="terminal-header">
      <div className="header-brand">
        <div className="terminal-logo-icon">▲</div>
        <div>
          <h1 className="terminal-title">ASTROHUB-7</h1>
          <span className="terminal-subtitle">ORBITAL COMMAND & TELEMETRY TERMINAL</span>
        </div>
      </div>

      {currentUser && (
        <div className="header-meta">
          <div className="crew-badge">
            <span className="crew-name">{currentUser.name}</span>
            <span className={`crew-role-tag ${currentUser.role}`}>
              {currentUser.role === 'flight_director' ? '★ FLIGHT DIRECTOR' : '◈ ASTRONAUT'}
            </span>
            <span className="crew-sector">Sector: {currentUser.sector}</span>
          </div>

          <div className="oxygen-meter-box">
            <div className="oxygen-label-row">
              <span>OXYGEN QUOTA</span>
              <strong>{currentUser.oxygenQuota}%</strong>
            </div>
            <div className="oxygen-track">
              <div
                className={`oxygen-bar ${currentUser.oxygenQuota < 85 ? 'warning' : 'nominal'}`}
                style={{ width: `${currentUser.oxygenQuota}%` }}
              />
            </div>
          </div>

          <button onClick={logout} className="btn-logout" title="Terminate Session">
            DISCONNECT
          </button>
        </div>
      )}
    </header>
  );
}