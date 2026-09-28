import React, { useState, useEffect } from 'react';
import {useAuth}  from "../Context/AuthContext";

export const DirectorDashboard = () => {
  const { currentUser, refreshUser } = useAuth();
  const [crewList, setCrewList] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCrew, setEditingCrew] = useState(null);
  const [newSector, setNewSector] = useState('');

  // Fetch full station roster and all station logs
  const loadCommandData = async () => {
    try {
      setLoading(true);
      const [resCrew, resLogs] = await Promise.all([
        fetch('http://localhost:3000/crew'),
        fetch('http://localhost:3000/logs')
      ]);

      const dataCrew = await resCrew.json();
      const dataLogs = await resLogs.json();

      setCrewList(dataCrew);
      setAllLogs(dataLogs);
    } catch (err) {
      console.error('Failed to load command bridge data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommandData();
  }, []);

  // 1. Crew Management: Revoke / Delete Security Clearance (DELETE)
  const handleRevokeCrew = async (id, name) => {
    if (id === currentUser.id) {
      alert('Security violation: You cannot revoke your own active Flight Director clearance.');
      return;
    }

    if (!window.confirm(`Revoke all clearances and delete crew member ${name} [${id}]?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/crew/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to revoke crew credentials');
      setCrewList(crewList.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // 2. Crew Management: Reassign Sector (PATCH)
  const handleUpdateSector = async (e) => {
    e.preventDefault();
    if (!editingCrew || !newSector) return;

    try {
      const res = await fetch(`http://localhost:3000/crew/${editingCrew.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: newSector })
      });
      if (!res.ok) throw new Error('Failed to update sector');
      
      setCrewList(crewList.map((c) => (c.id === editingCrew.id ? { ...c, sector: newSector } : c)));
      if (editingCrew.id === currentUser.id) {
        refreshUser();
      }
      setEditingCrew(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Global Override: Force-Approve Log (PATCH)
  const handleForceApprove = async (logId) => {
    try {
      const res = await fetch(`http://localhost:3000/logs/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
      if (!res.ok) throw new Error('Failed to force-approve log');
      
      setAllLogs(allLogs.map((l) => (l.id === logId ? { ...l, status: 'Resolved' } : l)));
    } catch (err) {
      alert(err.message);
    }
  };

  // 4. Global Override: Admin Purge Log (DELETE)
  const handleAdminDeleteLog = async (logId) => {
    if (!window.confirm(`Execute flight director override to purge log [${logId}]?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/logs/${logId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete log');
      setAllLogs(allLogs.filter((l) => l.id !== logId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          HIGH CLEARANCE // LEVEL 5 SECURITY PRIVILEGES
        </div>
        <h1>Flight Director Command Bridge</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Retrieving global station telemetry and personnel dossiers...
        </div>
      ) : (
        <>
          {/* SECTION 1: CREW ROSTER MANAGEMENT */}
          <div className="astro-card" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2>Station Personnel Roster</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Manage crew credentials, sector reallocations, and security clearances
                </p>
              </div>
              <span className="badge badge-low">{crewList.length} Active Personnel</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="astro-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Crew Member</th>
                    <th>Role Clearance</th>
                    <th>Assigned Sector</th>
                    <th>O2 Quota</th>
                    <th style={{ textAlign: 'right' }}>Direct Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {crewList.map((crew) => (
                    <tr key={crew.id}>
                      <td className="mono" style={{ color: 'var(--text-muted)' }}>{crew.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{crew.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{crew.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${crew.role === 'flight_director' ? 'badge-high' : 'badge-low'}`}>
                          {crew.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--accent-cyan)' }}>{crew.sector}</span>
                      </td>
                      <td className="mono">{crew.oxygenQuota}%</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setEditingCrew(crew);
                              setNewSector(crew.sector);
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            Reassign Sector
                          </button>
                          {crew.id !== currentUser.id && (
                            <button
                              onClick={() => handleRevokeCrew(crew.id, crew.name)}
                              className="btn btn-danger btn-sm"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: GLOBAL STATION LOG OVERRIDES */}
          <div className="astro-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2>Station-Wide Log Overrides</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Supervise all station module logs and exercise administrative override authority
                </p>
              </div>
              <span className="badge badge-medium">{allLogs.length} Total Logs</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="astro-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Objective / Category</th>
                    <th>Submitting Crew</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Command Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allLogs.map((log) => {
                    const author = crewList.find((c) => c.id === log.crewId);
                    return (
                      <tr key={log.id}>
                        <td className="mono" style={{ color: 'var(--text-muted)' }}>{log.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{log.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{log.category} // {log.timestamp}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{author ? author.name : `Crew: ${log.crewId}`}</div>
                        </td>
                        <td>
                          <span className={`badge badge-${log.urgency.toLowerCase()}`}>{log.urgency}</span>
                        </td>
                        <td>
                          <span style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: 600,
                            color: log.status === 'Resolved' ? '#34d399' : log.status === 'In Progress' ? '#38bdf8' : '#fbbf24' 
                          }}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            {log.status !== 'Resolved' && (
                              <button
                                onClick={() => handleForceApprove(log.id)}
                                className="btn btn-success btn-sm"
                                title="Force log to Resolved status"
                              >
                                ✓ Force-Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleAdminDeleteLog(log.id)}
                              className="btn btn-danger btn-sm"
                              title="Delete log permanently"
                            >
                              Purge
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Sector Reassignment Modal */}
      {editingCrew && (
        <div className="modal-overlay" onClick={() => setEditingCrew(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', color: '#00e5ff' }}>
              Reassign Sector: {editingCrew.name}
            </h3>

            <form onSubmit={handleUpdateSector}>
              <div className="form-group">
                <label className="form-label">New Orbital Sector Module</label>
                <select
                  className="form-select"
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                >
                  <option value="Command Bridge">Command Bridge</option>
                  <option value="Hydroponics Bay">Hydroponics Bay</option>
                  <option value="Propulsion & Core">Propulsion & Core</option>
                  <option value="Airlock & EVA Bay">Airlock & EVA Bay</option>
                  <option value="Medical Subsystem">Medical Subsystem</option>
                  <option value="Communications Array">Communications Array</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingCrew(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};