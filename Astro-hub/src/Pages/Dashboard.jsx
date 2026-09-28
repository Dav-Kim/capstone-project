// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {NavBar} from'./Components/NavBar';
import {NewLogModal} from './Components/NewLogModal';
import { api } from './services/api';
import { useAuth } from '../Context/AuthContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [crew, setCrew] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [onlyMySector, setOnlyMySector] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [allLogs, allCrew] = await Promise.all([api.getLogs(), api.getCrew()]);
      setLogs(allLogs);
      setCrew(allCrew);
      setLoading(false);
    }
    loadData();
  }, []);

  const crewMap = useMemo(() => {
    return crew.reduce((acc, member) => {
      acc[member.id] = member;
      return acc;
    }, {});
  }, [crew]);

  // Telemetry Calculations
  const stats = useMemo(() => {
    const total = logs.length;
    const pending = logs.filter((l) => l.status === 'Pending Inspection').length;
    const inProgress = logs.filter((l) => l.status === 'In Progress').length;
    const resolved = logs.filter((l) => l.status === 'Resolved').length;
    const highUrgency = logs.filter((l) => l.urgency === 'High' && l.status !== 'Resolved').length;
    return { total, pending, inProgress, resolved, highUrgency };
  }, [logs]);

  // Filtering Logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.title.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
      const matchesUrgency = selectedUrgency === 'ALL' || log.urgency === selectedUrgency;
      const matchesStatus = selectedStatus === 'ALL' || log.status === selectedStatus;
      const matchesSector = !onlyMySector || log.crewId === currentUser.id;

      return matchesSearch && matchesCategory && matchesUrgency && matchesStatus && matchesSector;
    });
  }, [logs, search, selectedCategory, selectedUrgency, selectedStatus, onlyMySector, currentUser]);

  const handleStatusChange = async (id, newStatus) => {
    await api.updateLogStatus(id, newStatus);
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Confirm purging ticket #${id} from orbital log?`)) return;
    await api.deleteLog(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleLogCreated = (newLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="terminal-screen">
      <Navbar />

      <main className="dashboard-content">
        {/* Telemetry Overview Cards */}
        <section className="telemetry-grid">
          <div className="telemetry-card">
            <span className="card-label">TOTAL LOGGED MISSIONS</span>
            <div className="card-value">{stats.total}</div>
            <span className="card-sub">Ledger records</span>
          </div>

          <div className="telemetry-card alert">
            <span className="card-label">CRITICAL ATTENTION</span>
            <div className="card-value alert">{stats.highUrgency}</div>
            <span className="card-sub">High Urgency Open</span>
          </div>

          <div className="telemetry-card warning">
            <span className="card-label">IN PROGRESS</span>
            <div className="card-value warning">{stats.inProgress}</div>
            <span className="card-sub">Under active repair</span>
          </div>

          <div className="telemetry-card nominal">
            <span className="card-label">INSPECTION RESOLVED</span>
            <div className="card-value nominal">{stats.resolved}</div>
            <span className="card-sub">Nominal certification</span>
          </div>
        </section>

        {/* Action & Filter Bar */}
        <section className="controls-panel">
          <div className="controls-left">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search ticket title, anomaly description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Life-Support Check">Life-Support Check</option>
              <option value="EVA Spacewalk">EVA Spacewalk</option>
              <option value="Emergency Repair">Emergency Repair</option>
            </select>

            <select value={selectedUrgency} onChange={(e) => setSelectedUrgency(e.target.value)}>
              <option value="ALL">All Urgencies</option>
              <option value="High">High Urgency</option>
              <option value="Medium">Medium Urgency</option>
              <option value="Low">Low Urgency</option>
            </select>

            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="Pending Inspection">Pending Inspection</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <label className="checkbox-filter">
              <input
                type="checkbox"
                checked={onlyMySector}
                onChange={(e) => setOnlyMySector(e.target.checked)}
              />
              Show Only My Tickets
            </label>
          </div>

          <div className="controls-right">
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              + DISPATCH MAINTENANCE TICKET
            </button>
          </div>
        </section>

        {/* Logs Table / Grid */}
        <section className="logs-panel">
          {loading ? (
            <div className="loading-state">RECEIVING ORBITAL TELEMETRY UPLINK...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="empty-state">No matching orbital tickets located in station logs.</div>
          ) : (
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>CODE</th>
                    <th>MISSION TICKET</th>
                    <th>CATEGORY</th>
                    <th>URGENCY</th>
                    <th>STATUS</th>
                    <th>OFFICER ASSIGNED</th>
                    <th>DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((item) => {
                    const officer = crewMap[item.crewId] || { name: 'Unassigned', sector: 'General' };
                    return (
                      <tr key={item.id} className={`urgency-row-${item.urgency.toLowerCase()}`}>
                        <td className="log-code">{item.id}</td>
                        <td className="log-main-info">
                          <strong>{item.title}</strong>
                          <p className="log-description-text">{item.description}</p>
                        </td>
                        <td>
                          <span className="category-pill">{item.category}</span>
                        </td>
                        <td>
                          <span className={`urgency-badge ${item.urgency.toLowerCase()}`}>
                            {item.urgency.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <select
                            className={`status-select ${item.status.replace(/\s+/g, '-').toLowerCase()}`}
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          >
                            <option value="Pending Inspection">Pending Inspection</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>
                        <td className="officer-col">
                          <span className="officer-name">{officer.name}</span>
                          <span className="officer-sector">{officer.sector}</span>
                        </td>
                        <td className="log-timestamp">{item.timestamp}</td>
                        <td>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(item.id)}
                            title="Purge Record"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <NewLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleLogCreated}
      />
    </div>
  );
}