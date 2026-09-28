// src/components/NewLogModal.jsx
import React, { useState } from 'react';
import { useAuth } from './Context/AuthContext';

export default function NewLogModal({ isOpen, onClose, onCreated }) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [urgency, setUrgency] = useState('Medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    const newLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      category,
      urgency,
      status: 'Pending Inspection',
      crewId: currentUser.id,
      timestamp: new Date().toISOString().split('T')[0],
      description: description.trim()
    };

    await onCreated(newLog);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-terminal">
        <div className="modal-header">
          <h3>// CREATE MAINTENANCE RECORD</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Ticket Title:
            <input
              type="text"
              required
              placeholder="e.g., Radiator Glycol Pressure Check"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <div className="form-row">
            <label>
              Category:
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Maintenance">Maintenance</option>
                <option value="Life-Support Check">Life-Support Check</option>
                <option value="EVA Spacewalk">EVA Spacewalk</option>
                <option value="Emergency Repair">Emergency Repair</option>
              </select>
            </label>

            <label>
              Urgency Protocol:
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="Low">Low - Nominal</option>
                <option value="Medium">Medium - Attention</option>
                <option value="High">High - Critical Priority</option>
              </select>
            </label>
          </div>

          <label>
            Technical Description / Sensor Telemetry:
            <textarea
              required
              rows={4}
              placeholder="Detail diagnostics, valve telemetry, or extravehicular observations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              ABORT
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'TRANSMITTING...' : 'TRANSMIT TICKET'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}