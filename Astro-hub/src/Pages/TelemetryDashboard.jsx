import React, { useState, useEffect } from 'react';

export const TelemetryDashboard = () => {
  const [crew, setCrew] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        setLoading(true);
        const [resCrew, resLogs] = await Promise.all([
          fetch('http://localhost:3000/crew'),
          fetch('http://localhost:3000/logs')
        ]);
        const crewData = await resCrew.json();
        const logsData = await resLogs.json();
        setCrew(crewData);
        setLogs(logsData);
      } catch (err) {
        console.error('Telemetry fetch failure:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();
  }, []);

  // Aggregated Analytics
  const totalCrew = crew.length;
  const totalLogs = logs.length;

  const urgencyCounts = {
    High: logs.filter((l) => l.urgency === 'High').length,
    Medium: logs.filter((l) => l.urgency === 'Medium').length,
    Low: logs.filter((l) => l.urgency === 'Low').length
  };

  const statusCounts = {
    pending: logs.filter((l) => l.status === 'Pending Inspection').length,
    inProgress: logs.filter((l) => l.status === 'In Progress').length,
    resolved: logs.filter((l) => l.status === 'Resolved').length
  };

  // High-urgency unresolved tickets determines Station Health State
  const criticalPending = logs.filter(
    (l) => l.urgency === 'High' && l.status !== 'Resolved'
  ).length;

  let healthStatus = {
    color: '#10b981',
    label: 'OPTIMAL / GREEN',
    message: 'All station critical systems nominal. No critical high-urgency bottlenecks detected.'
  };

  if (criticalPending >= 3) {
    healthStatus = {
      color: '#ef4444',
      label: 'CRITICAL / RED ALERT',
      message: `Emergency: ${criticalPending} high-urgency maintenance tickets require immediate clearance!`
    };
  } else if (criticalPending > 0) {
    healthStatus = {
      color: '#f59e0b',
      label: 'CAUTION / YELLOW',
      message: `Warning: ${criticalPending} high-urgency maintenance task(s) currently open.`
    };
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          ORBITAL SENSORS & REAL-TIME ANALYTICS
        </div>
        <h1>Station Telemetry & Health Metrics</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Computing station telemetry metrics...
        </div>
      ) : (
        <>
          {/* Station Visual Health Indicator */}
          <div className="astro-card" style={{ marginBottom: '2rem', borderColor: healthStatus.color }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: healthStatus.color,
                boxShadow: `0 0 25px ${healthStatus.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                ⚡
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                  Station Operational Integrity Status
                </div>
                <h2 style={{ color: healthStatus.color, margin: '0.2rem 0' }}>{healthStatus.label}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{healthStatus.message}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: healthStatus.color }}>
                  {criticalPending}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  High-Urgency Unresolved
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div className="astro-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Crew Onboard</div>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)', margin: '0.25rem 0' }}>
                {totalCrew}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Active Roster</div>
            </div>

            <div className="astro-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Mission Logs</div>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc', margin: '0.25rem 0' }}>
                {totalLogs}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cumulative Records</div>
            </div>

            <div className="astro-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pending Inspection</div>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-amber)', margin: '0.25rem 0' }}>
                {statusCounts.pending}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting Verification</div>
            </div>

            <div className="astro-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Resolved & Certified</div>
              <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-emerald)', margin: '0.25rem 0' }}>
                {statusCounts.resolved}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completion Rate: {totalLogs ? Math.round((statusCounts.resolved / totalLogs) * 100) : 0}%</div>
            </div>
          </div>

          {/* Breakdown Grids */}
          <div className="grid-2">
            {/* Urgency Distribution */}
            <div className="astro-card">
              <h3 style={{ marginBottom: '1.25rem', color: '#00e5ff' }}>Logs By Urgency Breakdown</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#f87171', fontWeight: 600 }}>High Urgency</span>
                    <span className="mono">{urgencyCounts.High} ({totalLogs ? Math.round((urgencyCounts.High / totalLogs) * 100) : 0}%)</span>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ background: '#ef4444', width: `${totalLogs ? (urgencyCounts.High / totalLogs) * 100 : 0}%`, height: '100%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 600 }}>Medium Urgency</span>
                    <span className="mono">{urgencyCounts.Medium} ({totalLogs ? Math.round((urgencyCounts.Medium / totalLogs) * 100) : 0}%)</span>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ background: '#f59e0b', width: `${totalLogs ? (urgencyCounts.Medium / totalLogs) * 100 : 0}%`, height: '100%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>Low Urgency</span>
                    <span className="mono">{urgencyCounts.Low} ({totalLogs ? Math.round((urgencyCounts.Low / totalLogs) * 100) : 0}%)</span>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ background: '#38bdf8', width: `${totalLogs ? (urgencyCounts.Low / totalLogs) * 100 : 0}%`, height: '100%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Progress */}
            <div className="astro-card">
              <h3 style={{ marginBottom: '1.25rem', color: '#00e5ff' }}>Ticket Resolution Pipeline</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 600 }}>Pending Inspection</span>
                    <span className="mono">{statusCounts.pending} tickets</span>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ background: '#fbbf24', width: `${totalLogs ? (statusCounts.pending / totalLogs) * 100 : 0}%`, height: '100%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>In Progress (Under Repair)</span>
                    <span className="mono">{statusCounts.inProgress} tickets</span>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ background: '#38bdf8', width: `${totalLogs ? (statusCounts.inProgress / totalLogs) * 100 : 0}%`, height: '100%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>Resolved & Certified</span>
                    <span className="mono">{statusCounts.resolved} tickets</span>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ background: '#10b981', width: `${totalLogs ? (statusCounts.resolved / totalLogs) * 100 : 0}%`, height: '100%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};