import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '../context/TestContext';

const GROUP_INFO = {
  Arts: {
    icon: '🎨',
    color: '#553c9a',
    bg: '#e9d8fd',
    border: '#d6bcfa',
    subjects: 'Tamil, English, Social',
    description: 'Strong in languages and humanities. Great for literature, history, political science, and social studies.',
    careers: 'Journalist, Lawyer, Historian, Teacher, Writer',
  },
  ComputerScience: {
    icon: '💻',
    color: '#2b6cb0',
    bg: '#bee3f8',
    border: '#90cdf4',
    subjects: 'Maths, Science',
    description: 'Excels in logical thinking and analytical subjects. Perfect for programming, engineering, and technology.',
    careers: 'Software Engineer, Data Scientist, Researcher, Architect',
  },
  Biology: {
    icon: '🔬',
    color: '#276749',
    bg: '#c6f6d5',
    border: '#9ae6b4',
    subjects: 'Science, Maths',
    description: 'Strong foundation in sciences. Ideal for medicine, life sciences, and research fields.',
    careers: 'Doctor, Pharmacist, Biologist, Nurse, Lab Scientist',
  },
};

const GROUP_LABELS = {
  Arts: 'Arts Group',
  ComputerScience: 'Computer Science Group',
  Biology: 'Biology Group',
};

export default function GroupSuggestionPage() {
  const navigate = useNavigate();
  const { testResult } = useTest();

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

  const { groupScores, recommendedGroup, subjectScores } = testResult;

  // Determine which subjects drove the recommendation
  const reasonMap = {
    Arts: ['Tamil', 'English', 'Social'],
    ComputerScience: ['Maths', 'Science'],
    Biology: ['Science', 'Maths'],
  };
  const keySubjects = reasonMap[recommendedGroup] || [];
  const topSubjectScore = keySubjects.map((s) => `${s} (${Math.round((subjectScores[s] / 4) * 100)}%)`).join(', ');

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate('/result')}
            style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem', padding: 0 }}
          >
            ← Back to Results
          </button>
          <h1>🎯 Group Suggestion</h1>
          <p style={{ color: '#718096' }}>Based on your subject strengths</p>
        </div>

        {/* Recommended group highlight */}
        {(() => {
          const g = GROUP_INFO[recommendedGroup];
          if (!g) return null;
          return (
            <div style={{
              border: `2px solid ${g.border}`,
              background: g.bg, borderRadius: 12,
              padding: '1.75rem', marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '2.5rem' }}>{g.icon}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h2 style={{ marginBottom: 0, color: g.color }}>{GROUP_LABELS[recommendedGroup]}</h2>
                    <span style={{
                      background: '#ffd700', color: '#744210',
                      fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                      borderRadius: 999
                    }}>⭐ RECOMMENDED</span>
                  </div>
                  <p style={{ color: g.color, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    Key subjects: {g.subjects}
                  </p>
                </div>
              </div>
              <p style={{ color: '#4a5568', marginBottom: '0.75rem' }}>{g.description}</p>
              <p style={{ fontSize: '0.9rem', color: '#718096' }}>
                <strong>Career paths:</strong> {g.careers}
              </p>
              <div style={{
                marginTop: '1rem', background: 'rgba(255,255,255,0.7)',
                borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.9rem', color: g.color
              }}>
                💡 <strong>Why this group?</strong> Your strongest scores were in {topSubjectScore}, which align with {GROUP_LABELS[recommendedGroup]}.
              </div>
            </div>
          );
        })()}

        {/* All group scores */}
        <div className="card">
          <h2>All Group Percentages</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '0.75rem' }}>
            {Object.entries(groupScores).map(([group, score]) => {
              const g = GROUP_INFO[group];
              if (!g) return null;
              const isRecommended = group === recommendedGroup;
              return (
                <div key={group}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{g.icon}</span>
                      <span style={{ fontWeight: isRecommended ? 700 : 600, color: g.color }}>
                        {GROUP_LABELS[group]}
                      </span>
                      {isRecommended && (
                        <span style={{ fontSize: '0.75rem', background: '#ffd700', color: '#744210', padding: '0.1rem 0.5rem', borderRadius: 999, fontWeight: 700 }}>
                          Best fit
                        </span>
                      )}
                    </div>
                    <span style={{ fontWeight: 700, color: '#1a202c', fontSize: '1.05rem' }}>{score}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${score}%`,
                        background: isRecommended ? g.color : '#a0aec0',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject breakdown for reference */}
        <div className="card">
          <h2>Your Subject Scores</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {Object.entries(subjectScores).map(([subject, score]) => (
              <div key={subject} style={{
                flex: '1 1 120px', textAlign: 'center', padding: '0.75rem',
                background: '#f7fafc', borderRadius: 10, border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontWeight: 700, fontSize: '1.4rem', color: '#1a202c' }}>
                  {Math.round((score / 4) * 100)}%
                </div>
                <div style={{ fontSize: '0.85rem', color: '#718096', marginTop: '0.2rem' }}>{subject}</div>
                <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>{score}/4</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/report')}>
            📋 View Full Performance Report
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/test')}>
            Retake Test
          </button>
        </div>
      </div>
    </div>
  );
}
