import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const PCT_COLOR = (p) => p >= 75 ? '#38a169' : p >= 50 ? '#d69e2e' : '#e53e3e';
const PCT_BG    = (p) => p >= 75 ? '#c6f6d5' : p >= 50 ? '#fefcbf' : '#fed7d7';

const GROUP_COLORS = { Arts: '#9f7aea', ComputerScience: '#4299e1', Biology: '#48bb78', General: '#a0aec0' };
const GROUP_LABELS = { Arts: 'Arts', ComputerScience: 'Computer Science', Biology: 'Biology', General: 'General' };

function Badge({ text, bg = '#e9d8fd', color = '#553c9a' }) {
  return (
    <span style={{ background: bg, color, padding: '0.15rem 0.65rem', borderRadius: 999, fontWeight: 700, fontSize: '0.78rem' }}>
      {text}
    </span>
  );
}

export default function AllReportsPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filterGroup, setFilterGroup]         = useState('');
  const [filterAttendance, setFilterAttendance] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/report');
        setReports(res.data.reports);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = reports.filter(r => {
    const matchName       = r.studentName.toLowerCase().includes(search.toLowerCase());
    const matchGroup      = filterGroup      ? r.recommendedGroup === filterGroup      : true;
    const matchAttendance = filterAttendance === 'below80' ? !r.attendanceAllowed
                          : filterAttendance === 'above80' ? r.attendanceAllowed : true;
    return matchName && matchGroup && matchAttendance;
  });

  const stats = {
    total:         reports.length,
    needsRemedial: reports.filter(r => r.needsRemedial).length,
    lowAttendance: reports.filter(r => !r.attendanceAllowed).length,
    avgScore:      reports.length ? Math.round(reports.reduce((s, r) => s + r.percentage, 0) / reports.length) : 0,
  };

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div className="spinner" />
      <p style={{ color: '#718096', marginTop: 12 }}>Loading all reports…</p>
    </div>
  );

  if (error) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <p className="error-msg">{error}</p>
    </div>
  );

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1>📋 All Student Performance Reports</h1>
            <p style={{ color: '#718096' }}>Welcome, {user?.name} — comprehensive overview of all students</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => navigate('/dashboard')}>← Dashboard</button>
            <button className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Students', value: stats.total,         color: '#4f46e5' },
            { label: 'Avg Score',      value: `${stats.avgScore}%`, color: '#38a169' },
            { label: 'Need Remedial',  value: stats.needsRemedial,  color: '#e53e3e' },
            { label: 'Low Attendance', value: stats.lowAttendance,  color: '#d69e2e' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <strong style={{ color: '#4a5568', fontSize: '0.9rem' }}>🔍 Filter & Search:</strong>
          <input
            type="text"
            placeholder="Search student name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.88rem', minWidth: 180, outline: 'none' }}
          />
          <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.88rem' }}>
            <option value="">All Streams</option>
            <option value="Arts">Arts</option>
            <option value="ComputerScience">Computer Science</option>
            <option value="Biology">Biology</option>
          </select>
          <select value={filterAttendance} onChange={(e) => setFilterAttendance(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.88rem' }}>
            <option value="">All Attendance</option>
            <option value="above80">Above 80%</option>
            <option value="below80">Below 80% ⚠️</option>
          </select>
          {(search || filterGroup || filterAttendance) && (
            <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.35rem 0.8rem' }}
              onClick={() => { setSearch(''); setFilterGroup(''); setFilterAttendance(''); }}>
              Clear
            </button>
          )}
          <span style={{ marginLeft: 'auto', color: '#718096', fontSize: '0.85rem' }}>Showing {filtered.length} of {reports.length}</span>
        </div>

        {/* Reports table */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Student', 'Course / Dept', 'Score', 'Attendance', 'Stream', 'Weak Subjects', 'Remedial', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 0.85rem', textAlign: 'left', color: '#4a5568', fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#a0aec0' }}>No records match your filters.</td></tr>
              ) : filtered.map((r, i) => {
                const gc = GROUP_COLORS[r.recommendedGroup] || '#a0aec0';
                return (
                  <tr key={r.studentId} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, fontSize: '0.88rem' }}>{r.studentName}</td>
                    <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.82rem', color: '#4a5568' }}>
                      {r.course}<br /><span style={{ color: '#a0aec0' }}>{r.department}</span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span style={{ fontWeight: 700, color: PCT_COLOR(r.percentage) }}>{r.percentage}%</span>
                      <br /><span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{r.difficultyLevel}</span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span style={{ background: r.attendanceAllowed ? '#c6f6d5' : '#fed7d7', color: r.attendanceAllowed ? '#276749' : '#c53030', padding: '0.15rem 0.6rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 700 }}>
                        {r.attendance}%
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <Badge text={GROUP_LABELS[r.recommendedGroup] || r.recommendedGroup} bg={gc + '22'} color={gc} />
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: r.weakSubjects.length ? '#c53030' : '#38a169' }}>
                      {r.weakSubjects.length ? r.weakSubjects.join(', ') : '—'}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      {r.needsRemedial
                        ? <Badge text="Required" bg="#fed7d7" color="#c53030" />
                        : <Badge text="Not needed" bg="#c6f6d5" color="#276749" />}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      {!r.attendanceAllowed
                        ? <Badge text="🚨 Follow-up" bg="#fed7d7" color="#c53030" />
                        : r.needsRemedial
                          ? <Badge text="⚠️ Review" bg="#fefcbf" color="#b7791f" />
                          : <Badge text="✅ On track" bg="#c6f6d5" color="#276749" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p style={{ color: '#a0aec0', fontSize: '0.78rem', textAlign: 'center', marginTop: '1rem', paddingBottom: '2rem' }}>
          Individual detailed reports are available via GET /api/report/:studentId
        </p>
      </div>
    </div>
  );
}
