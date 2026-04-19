import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const DIFFICULTY_BADGE = {
  'High Difficulty':     'badge-red',
  'Moderate Difficulty': 'badge-yellow',
  'Good Understanding':  'badge-green',
};

const GROUP_BADGE = {
  Arts:            'badge-purple',
  ComputerScience: 'badge-blue',
  Biology:         'badge-green',
};

const GROUP_LABELS = {
  Arts: 'Arts',
  ComputerScience: 'Comp. Sci',
  Biology: 'Biology',
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ difficulty: '', group: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.group) params.append('group', filters.group);

      const res = await api.get(`/dashboard?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <div className="spinner" />
      <p>Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <p className="error-msg">{error}</p>
    </div>
  );

  const { results, analytics } = data;

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1>👩‍🏫 Teacher Dashboard</h1>
            <p style={{ color: '#718096' }}>Welcome, {user?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" style={{ fontSize: '0.85rem' }} onClick={() => navigate('/reports')}>
              📋 All Reports
            </button>
          </div>
        </div>

        {/* Analytics summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Students', value: analytics.totalStudents, color: '#4f46e5' },
            { label: 'Avg Score', value: `${analytics.avgScore} / 20`, color: '#38a169' },
            { label: 'High Difficulty', value: analytics.difficultyDistribution['High Difficulty'], color: '#e53e3e' },
            { label: 'Good Understanding', value: analytics.difficultyDistribution['Good Understanding'], color: '#38a169' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: '#fff', borderRadius: 12, padding: '1.1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: '0.82rem', color: '#718096', marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Distribution charts (simple bar representations) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

          {/* Difficulty distribution */}
          <div className="card">
            <h3>Difficulty Distribution</h3>
            {Object.entries(analytics.difficultyDistribution).map(([level, count]) => {
              const pct = analytics.totalStudents > 0 ? Math.round((count / analytics.totalStudents) * 100) : 0;
              return (
                <div key={level} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: '#4a5568' }}>{level}</span>
                    <span style={{ fontWeight: 600 }}>{count} ({pct}%)</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{
                      width: `${pct}%`,
                      background: level === 'High Difficulty' ? '#fc8181' : level === 'Moderate Difficulty' ? '#ecc94b' : '#68d391'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Group distribution */}
          <div className="card">
            <h3>Group Recommendations</h3>
            {Object.entries(analytics.groupDistribution).map(([group, count]) => {
              const pct = analytics.totalStudents > 0 ? Math.round((count / analytics.totalStudents) * 100) : 0;
              const colors = { Arts: '#9f7aea', ComputerScience: '#63b3ed', Biology: '#68d391' };
              return (
                <div key={group} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: '#4a5568' }}>{GROUP_LABELS[group]}</span>
                    <span style={{ fontWeight: 600 }}>{count} ({pct}%)</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: colors[group] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject averages */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>Class Subject Averages</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {Object.entries(analytics.subjectAverages).map(([subject, avg]) => (
              <div key={subject} style={{
                flex: '1 1 100px', textAlign: 'center', padding: '0.75rem',
                background: '#f7fafc', borderRadius: 10, border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: avg >= 70 ? '#38a169' : avg >= 50 ? '#d69e2e' : '#e53e3e' }}>
                  {avg}%
                </div>
                <div style={{ fontSize: '0.82rem', color: '#718096', marginTop: '0.2rem' }}>{subject}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <strong style={{ color: '#4a5568', fontSize: '0.9rem' }}>🔍 Filter:</strong>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              style={{ padding: '0.45rem 0.8rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
            >
              <option value="">All Difficulty Levels</option>
              <option value="High Difficulty">High Difficulty</option>
              <option value="Moderate Difficulty">Moderate Difficulty</option>
              <option value="Good Understanding">Good Understanding</option>
            </select>
            <select
              value={filters.group}
              onChange={(e) => setFilters({ ...filters, group: e.target.value })}
              style={{ padding: '0.45rem 0.8rem', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
            >
              <option value="">All Groups</option>
              <option value="Arts">Arts</option>
              <option value="ComputerScience">Computer Science</option>
              <option value="Biology">Biology</option>
            </select>
            {(filters.difficulty || filters.group) && (
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem' }}
                onClick={() => setFilters({ difficulty: '', group: '' })}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Student results table */}
        <div className="card" style={{ overflowX: 'auto' }}>
          <h2 style={{ marginBottom: '1rem' }}>Student Results ({results.length})</h2>
          {results.length === 0 ? (
            <p style={{ color: '#a0aec0', textAlign: 'center', padding: '2rem' }}>
              No results found. Students need to complete the test first.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Tamil</th>
                  <th>English</th>
                  <th>Maths</th>
                  <th>Science</th>
                  <th>Social</th>
                  <th>Difficulty</th>
                  <th>Group</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{r.studentName}</td>
                    <td style={{ fontWeight: 700, color: r.percentage >= 75 ? '#38a169' : r.percentage >= 40 ? '#d69e2e' : '#e53e3e' }}>
                      {r.totalScore}/20 <span style={{ color: '#a0aec0', fontWeight: 400 }}>({r.percentage}%)</span>
                    </td>
                    {['Tamil','English','Maths','Science','Social'].map((sub) => (
                      <td key={sub} style={{ color: '#4a5568' }}>{r.subjectScores[sub]}/4</td>
                    ))}
                    <td><span className={`badge ${DIFFICULTY_BADGE[r.difficultyLevel] || 'badge-yellow'}`} style={{ fontSize: '0.78rem' }}>{r.difficultyLevel}</span></td>
                    <td><span className={`badge ${GROUP_BADGE[r.recommendedGroup] || 'badge-blue'}`} style={{ fontSize: '0.78rem' }}>{GROUP_LABELS[r.recommendedGroup] || r.recommendedGroup}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
