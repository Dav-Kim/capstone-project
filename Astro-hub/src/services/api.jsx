// src/services/api.js
const API_BASE = '/api';

// Initial seed matching db.json in case json-server is offline
const INITIAL_CREW = [
  { id: "c-01", name: "Cmdr. Ellen Ripley", email: "ripley@astrohub.org", password: "password123", role: "flight_director", sector: "Command Bridge", oxygenQuota: 100 },
  { id: "c-02", name: "Dr. Mark Watney", email: "watney@astrohub.org", password: "password123", role: "astronaut", sector: "Hydroponics Bay", oxygenQuota: 85 },
  { id: "c-03", name: "Lt. Joseph Cooper", email: "cooper@astrohub.org", password: "password123", role: "astronaut", sector: "Propulsion & Core", oxygenQuota: 92 },
  { id: "c-04", name: "Dr. Ryan Stone", email: "stone@astrohub.org", password: "password123", role: "astronaut", sector: "Airlock & EVA Bay", oxygenQuota: 88 }
];

const INITIAL_LOGS = [
  { id: "log-501", title: "Solar Array Panel 3 Alignment", category: "Maintenance", description: "Adjust tracking angle by 12 degrees to optimize solar intake after micro-meteoroid drift.", urgency: "High", status: "Pending Inspection", crewId: "c-02", timestamp: "2088-11-04" },
  { id: "log-502", title: "Hydroponics CO2 Scrubbing Valve Calibration", category: "Life-Support Check", description: "Recalibrated secondary atmospheric scrubber in Sector 4 to stabilize O2/CO2 equilibrium.", urgency: "Medium", status: "In Progress", crewId: "c-02", timestamp: "2088-11-05" },
  { id: "log-503", title: "EVA Spacewalk: Thermal Shield Inspection", category: "EVA Spacewalk", description: "Conducted a 4-hour extravehicular walk along the starboard radiator fins. Minor pitting patched with ceramic compound.", urgency: "High", status: "In Progress", crewId: "c-03", timestamp: "2088-11-06" },
  { id: "log-504", title: "Ion Propulsion Thruster 2 diagnostics", category: "Maintenance", description: "Verified magnetic coil containment field. Output nominal at 99.4% efficiency.", urgency: "Low", status: "Resolved", crewId: "c-03", timestamp: "2088-11-02" },
  { id: "log-505", title: "Airlock Alpha Outer Hatch Seal Replacement", category: "Emergency Repair", description: "Emergency pneumatic gasket replacement following pressure drop during ingress cycle.", urgency: "High", status: "Pending Inspection", crewId: "c-04", timestamp: "2088-11-07" },
  { id: "log-506", title: "Water Reclamation System UV Sterilization Cycle", category: "Life-Support Check", description: "Replaced UV mercury vapor lamp in greywater distillation circuit.", urgency: "Low", status: "Resolved", crewId: "c-02", timestamp: "2088-11-01" }
];

function getLocal(key, fallback) {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(item);
}

function setLocal(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const api = {
  // Crew API
  async getCrew() {
    try {
      const res = await fetch(`${API_BASE}/crew`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      setLocal('astro_crew', data);
      return data;
    } catch {
      return getLocal('astro_crew', INITIAL_CREW);
    }
  },

  async registerCrew(newMember) {
    try {
      const res = await fetch(`${API_BASE}/crew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember),
      });
      if (!res.ok) throw new Error('Failed to register via API');
      const data = await res.json();
      const local = getLocal('astro_crew', INITIAL_CREW);
      setLocal('astro_crew', [...local, data]);
      return data;
    } catch {
      const local = getLocal('astro_crew', INITIAL_CREW);
      const updated = [...local, newMember];
      setLocal('astro_crew', updated);
      return newMember;
    }
  },

  // Logs API
  async getLogs() {
    try {
      const res = await fetch(`${API_BASE}/logs`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      setLocal('astro_logs', data);
      return data;
    } catch {
      return getLocal('astro_logs', INITIAL_LOGS);
    }
  },

  async createLog(logItem) {
    try {
      const res = await fetch(`${API_BASE}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logItem),
      });
      if (!res.ok) throw new Error('Failed to create via API');
      const data = await res.json();
      const local = getLocal('astro_logs', INITIAL_LOGS);
      setLocal('astro_logs', [data, ...local]);
      return data;
    } catch {
      const local = getLocal('astro_logs', INITIAL_LOGS);
      const updated = [logItem, ...local];
      setLocal('astro_logs', updated);
      return logItem;
    }
  },

  async updateLogStatus(id, newStatus) {
    try {
      const res = await fetch(`${API_BASE}/logs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to patch via API');
      const data = await res.json();
      const local = getLocal('astro_logs', INITIAL_LOGS);
      const updated = local.map((l) => (l.id === id ? { ...l, status: newStatus } : l));
      setLocal('astro_logs', updated);
      return data;
    } catch {
      const local = getLocal('astro_logs', INITIAL_LOGS);
      const updated = local.map((l) => (l.id === id ? { ...l, status: newStatus } : l));
      setLocal('astro_logs', updated);
      return { id, status: newStatus };
    }
  },

  async deleteLog(id) {
    try {
      const res = await fetch(`${API_BASE}/logs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete via API');
    } catch {
      // Handled locally
    }
    const local = getLocal('astro_logs', INITIAL_LOGS);
    const updated = local.filter((l) => l.id !== id);
    setLocal('astro_logs', updated);
    return true;
  }
};