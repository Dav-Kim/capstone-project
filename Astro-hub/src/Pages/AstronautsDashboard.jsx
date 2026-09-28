import React, { useState, useEffect, useCallback } from 'react';
import  {useAuth}  from"../Context/AuthContext";

export const AstronautDashboard = () => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Maintenance',
    urgency: 'Medium',
    description: '',
    status: 'Pending Inspection'
  });

  // Fetch only logs assigned to the active user (Read - R)
  const fetchMyLogs = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/logs?crewId=${currentUser.id}`);
      if (!res.ok) throw new Error('Failed to retrieve maintenance tickets');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMyLogs();
  }, [fetchMyLogs]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingLog(null);
    setFormData({
      title: '',
      category: 'Maintenance',
      urgency: 'Medium',
      description: '',
      status: 'Pending Inspection'
    });
    setIsModalOpen(true);
  };

  // Open modal for Update (Edit details)
  const handleOpenEditModal = (log) => {
    setEditingLog(log);
    setFormData({
      title: log.title,
      category: log.category,
      urgency: log.urgency,
      description: log.description,
      status: log.status
    });
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveLog = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in both log title and detailed description.');
      return;
    }

    try {
      if (editingLog) {
        // UPDATE (U)
        const res = await fetch(`http://localhost:3000/logs/${editingLog.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        // CREATE (C)
        const newLogPayload = {
          id: `log-${Date.now().toString().slice(-4)}`,
          ...formData,
          crewId: currentUser.id,
          timestamp: new Date().toISOString().split('T')[0]
        };

        const res = await fetch('http://localhost:3000/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLogPayload)
        });
        if (!res.ok) throw new Error('Failed to create maintenance ticket');
      }

      setIsModalOpen(false);
      fetchMyLogs();
    } catch (err) {
      alert(err.message);
    }
  };

  // Quick Advance Status (U): Pending Inspection -> In Progress -> Resolved
  const handleAdvanceStatus = async (log) => {
    let nextStatus = 'Pending Inspection';
    if (log.status === 'Pending Inspection') nextStatus = 'In Progress';
    else if (log.status === 'In Progress') nextStatus = 'Resolved';
    else nextStatus = 'Pending Inspection';

    try {
      const res = await fetch(`http://localhost:3000/logs/${log.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error('Status transition failed');
      fetchMyLogs();
    } catch (err) {
      alert(err.message);
    }
  };

  // DELETE (D): Purge or Cancel Log
  const handleDeleteLog = async (id, status) => {
    if (!window.confirm(`Are you sure you want to purge ticket [${id}] from the station log?`)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/logs/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Deletion failed');
      setLogs(logs.filter((l) => l.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    const matchesUrgency = filterUrgency === 'ALL' || log.urgency === filterUrgency;
    const matchesSearch =
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesUrgency && matchesSearch;
  });

  return (
    <div className="container">
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            FIELD CREW WORKSTATION // SECTOR: {currentUser?.sector}
          </div>
          <h1>Operational Maintenance Logs</h1>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          ➕ Log New Maintenance / EVA
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="astro-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 300px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search logs by keyword, system, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Urgency:</span>
            {['ALL', 'High', 'Medium', 'Low'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterUrgency(lvl)}
                className={`btn btn-sm ${filterUrgency === lvl ? 'btn-primary' : 'btn-secondary'}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Connecting to Orbital Core DB...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="astro-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛠️</div>
          <h3>No Maintenance Logs Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {searchTerm || filterUrgency !== 'ALL' ? 'Try adjusting your search criteria.' : 'Create your first maintenance or EVA spacewalk log using the button above.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredLogs.map((log) => (
            <div key={log.id} className="astro-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>[{log.id}]</span>
                    <span className={`badge badge-${log.urgency.toLowerCase()}`}>{log.urgency} Urgency</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'rgba(0, 229, 255, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {log.category}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', color: '#f8fafc' }}>{log.title}</h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleAdvanceStatus(log)}
                    className="btn btn-secondary btn-sm"
                    title="Click to cycle status"
                  >
                    Status: <b style={{ color: log.status === 'Resolved' ? '#34d399' : log.status === 'In Progress' ? '#38bdf8' : '#fbbf24' }}>{log.status} ↻</b>
                  </button>
                  <button onClick={() => handleOpenEditModal(log)} className="btn btn-secondary btn-sm">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDeleteLog(log.id, log.status)} className="btn btn-danger btn-sm">
                    🗑️ Purge
                  </button>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {log.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                <span>Logged Date: {log.timestamp}</span>
                <span>Submitting Crew ID: <code>{log.crewId}</code></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for Create & Edit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.25rem', color: '#00e5ff' }}>
              {editingLog ? `Edit Maintenance Ticket [${editingLog.id}]` : 'Create Station Maintenance / EVA Log'}
            </h3>

            <form onSubmit={handleSaveLog}>
              <div className="form-group">
                <label className="form-label">Ticket Title / Objective</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Oxygen Recirculation Pump Replacement"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="EVA Spacewalk">EVA Spacewalk</option>
                    <option value="Life-Support Check">Life-Support Check</option>
                    <option value="Emergency Repair">Emergency Repair</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Urgency Level</label>
                  <select
                    className="form-select"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Current Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pending Inspection">Pending Inspection</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Technical Summary / Description</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Detail symptoms, actions taken, required components, or spacewalk coordinates..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLog ? 'Save Updates' : 'Publish Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};