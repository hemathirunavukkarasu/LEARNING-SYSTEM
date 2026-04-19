import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../context/TestContext';
import { useAuth } from '../context/AuthContext';

const SUBJECT_COLORS = {
  Tamil:   { bg: '#fefcbf', color: '#744210', border: '#f6e05e' },
  English: { bg: '#bee3f8', color: '#2b6cb0', border: '#90cdf4' },
  Maths:   { bg: '#c6f6d5', color: '#276749', border: '#9ae6b4' },
  Science: { bg: '#fed7d7', color: '#9b2c2c', border: '#feb2b2' },
  Social:  { bg: '#e9d8fd', color: '#553c9a', border: '#d6bcfa' },
};

function DifficultyBadge({ level }) {
  const styles = {
    'High Difficulty':    { bg: '#fed7d7', color: '#c53030', icon: '🔴' },
    'Moderate Difficulty':{ bg: '#fefcbf', color: '#b7791f', icon: '🟡' },
    'Good Understanding': { bg: '#c6f6d5', color: '#276749', icon: '🟢' },
  };
  const s = styles[level] || styles['Moderate Difficulty'];
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '0.4rem 1.1rem', borderRadius: 999,
      fontWeight: 700, fontSize: '1rem'
    }}>
      {s.icon} {level}
    </span>
  );
}

export default function ResultPage() {
  const navigate = useNavigate();
  const { testResult } = useTest();
  const { user, logout } = useAuth();

  // If no result in context (e.g. page refresh), redirect
  if (!testResult) {
    return (
      <div className="page" style={{ textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 400, margin: '4rem auto' }}>
          <p style={{ marginBottom: '1rem' }}>No result found. Please take the test first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/test')}>Go to Test</button>
        </div>
      </div>
    );
  }

  const { subjectScores, totalScore, percentage, difficultyLevel } = testResult;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h1>📊 Your Results</h1>
        </div>

        {/* Score overview */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#718096', marginBottom: '0.5rem' }}>Hello, {user?.name}!</p>

          {/* Big score circle */}
          <div style={{
            width: 130, height: 130, borderRadius: '50%', margin: '0 auto 1.25rem',
            background: percentage >= 75 ? '#c6f6d5' : percentage >= 40 ? '#fefcbf' : '#fed7d7',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: `4px solid ${percentage >= 75 ? '#48bb78' : percentage >= 40 ? '#ecc94b' : '#fc8181'}`
          }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#1a202c' }}>{totalScore}</span>
            <span style={{ fontSize: '0.85rem', color: '#718096' }}>out of 20</span>
          </div>

          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {percentage}%
          </div>

          <DifficultyBadge level={difficultyLevel} />

          {/* Score range guide */}
          <div style={{
            display: 'flex', gap: '0.5rem', justifyContent: 'center',
            marginTop: '1.25rem', flexWrap: 'wrap'
          }}>
            {[
              { range: '0–7', label: 'High Difficulty', color: '#fed7d7' },
              { range: '8–14', label: 'Moderate', color: '#fefcbf' },
              { range: '15–20', label: 'Good Understanding', color: '#c6f6d5' },
            ].map(({ range, label, color }) => (
              <span key={range} style={{
                background: color, padding: '0.25rem 0.7rem',
                borderRadius: 999, fontSize: '0.8rem', fontWeight: 600
              }}>
                {range}: {label}
              </span>
            ))}
          </div>
        </div>

        {/* Subject-wise scores */}
        <div className="card">
          <h2>Subject-wise Performance</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
            {Object.entries(subjectScores).map(([subject, score]) => {
              const pct = Math.round((score / 4) * 100);
              const c = SUBJECT_COLORS[subject];
              return (
                <div key={subject}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{
                      fontWeight: 600, background: c.bg, color: c.color,
                      padding: '0.2rem 0.7rem', borderRadius: 999, fontSize: '0.9rem'
                    }}>
                      {subject}
                    </span>
                    <span style={{ fontWeight: 700, color: '#2d3748' }}>
                      {score}/4 &nbsp;
                      <span style={{ color: '#718096', fontWeight: 400 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 75 ? '#48bb78' : pct >= 50 ? '#ecc94b' : '#fc8181'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '0.8rem 2.5rem', fontSize: '1.05rem' }}
            onClick={() => navigate('/group')}
          >
            See Group Suggestion →
          </button>
        </div>
      </div>
    </div>
  );
}
