import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ── Colour helpers ────────────────────────────────────────────────────────────
const PCT_COLOR   = (p) => p >= 75 ? '#38a169' : p >= 50 ? '#d69e2e' : '#e53e3e';
const PCT_BG      = (p) => p >= 75 ? '#c6f6d5' : p >= 50 ? '#fefcbf' : '#fed7d7';
const SUB_COLORS  = {
  Tamil:   { bg: '#fefcbf', color: '#744210' },
  English: { bg: '#bee3f8', color: '#2b6cb0' },
  Maths:   { bg: '#c6f6d5', color: '#276749' },
  Science: { bg: '#fed7d7', color: '#9b2c2c' },
  Social:  { bg: '#e9d8fd', color: '#553c9a' },
};
const GROUP_COLORS = {
  Arts: '#9f7aea', ComputerScience: '#4299e1', Biology: '#48bb78', General: '#a0aec0',
};
const GROUP_LABELS = {
  Arts: 'Arts', ComputerScience: 'Computer Science', Biology: 'Biology', General: 'General',
};

// ── Sub-components ────────────────────────────────────────────────────────────
function Section({ title, icon, children, accent = '#4f46e5' }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '1.5rem',
      boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: '1.25rem',
      borderLeft: `5px solid ${accent}`,
    }}>
      <h2 style={{ color: '#1a202c', marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ color: '#718096', fontSize: '0.9rem' }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor || '#2d3748', fontSize: '0.9rem' }}>{value}</span>
    </div>
  );
}

function Badge({ text, bg = '#e9d8fd', color = '#553c9a' }) {
  return (
    <span style={{ background: bg, color, padding: '0.2rem 0.8rem', borderRadius: 999, fontWeight: 700, fontSize: '0.82rem' }}>
      {text}
    </span>
  );
}

function ProgressBar({ pct }) {
  return (
    <div style={{ background: '#edf2f7', borderRadius: 999, height: 10, overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 999,
        background: PCT_COLOR(pct), transition: 'width 0.8s ease',
      }} />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ReportPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/report/${user?.userId || user?._id || user?.id}`);
        setReport(res.data.report);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchReport();
  }, [user]);

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div className="spinner" />
      <p style={{ color: '#718096', marginTop: '1rem' }}>Generating your performance report…</p>
    </div>
  );

  if (error) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div className="card" style={{ maxWidth: 400, margin: '0 auto' }}>
        <p className="error-msg">{error}</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/test')}>
          Take the Test First
        </button>
      </div>
    </div>
  );

  if (!report) return null;

  const {
    studentInfo, departmentInfo, examSummary,
    subjectAnalysis, attendanceStatus,
    recommendedActions, motivationalFeedback, nextSteps,
  } = report;

  const groupColor = GROUP_COLORS[departmentInfo.recommendedGroup] || '#a0aec0';

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem' }}>📋 Performance Report</h1>
            <p style={{ color: '#718096', fontSize: '0.88rem' }}>
              Generated: {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* ── 1. Student Info ── */}
        <Section title="Student Information" icon="👤" accent="#4f46e5">
          <InfoRow label="Full Name"   value={studentInfo.name} />
          <InfoRow label="Department"  value={departmentInfo.department} />
          <InfoRow label="Course"      value={departmentInfo.course} />
          <InfoRow label="Recommended Stream" value={
            <Badge text={GROUP_LABELS[departmentInfo.recommendedGroup] || departmentInfo.recommendedGroup} bg={groupColor + '33'} color={groupColor} />
          } />
        </Section>

        {/* ── 2. Course Introduction ── */}
        <Section title={`About the ${GROUP_LABELS[departmentInfo.recommendedGroup] || departmentInfo.recommendedGroup} Stream`} icon="📖" accent="#38a169">
          <p style={{ color: '#4a5568', lineHeight: 1.7, fontSize: '0.93rem' }}>
            {departmentInfo.courseIntroduction}
          </p>
        </Section>

        {/* ── 3. Exam Marks ── */}
        <Section title="Exam Summary" icon="📊" accent="#d69e2e">
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              width: 110, height: 110, borderRadius: '50%',
              background: PCT_BG(examSummary.percentage),
              border: `4px solid ${PCT_COLOR(examSummary.percentage)}`,
              marginBottom: '0.5rem',
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a202c' }}>{examSummary.totalScore}</span>
              <span style={{ fontSize: '0.75rem', color: '#718096' }}>/ {examSummary.maxScore}</span>
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: PCT_COLOR(examSummary.percentage) }}>
              {examSummary.percentage}%
            </div>
            <Badge
              text={examSummary.difficultyLevel}
              bg={PCT_BG(examSummary.percentage)}
              color={PCT_COLOR(examSummary.percentage)}
            />
          </div>

          {/* Group scores */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {Object.entries(examSummary.groupScores || {}).map(([g, score]) => (
              <div key={g} style={{
                flex: '1 1 90px', textAlign: 'center', padding: '0.6rem',
                background: '#f7fafc', borderRadius: 10, border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: GROUP_COLORS[g] || '#718096' }}>{score}%</div>
                <div style={{ fontSize: '0.75rem', color: '#718096' }}>{GROUP_LABELS[g] || g}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 4. Subject-wise Feedback ── */}
        <Section title="Subject-wise Performance & Feedback" icon="📝" accent="#9f7aea">
          {subjectAnalysis.map((sub) => {
            const c = SUB_COLORS[sub.subject] || { bg: '#f0f0f0', color: '#333' };
            return (
              <div key={sub.subject} style={{ marginBottom: '1.25rem', padding: '1rem', background: '#fafafa', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ background: c.bg, color: c.color, padding: '0.2rem 0.8rem', borderRadius: 999, fontWeight: 700, fontSize: '0.9rem' }}>
                    {sub.subject}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#2d3748' }}>{sub.rawScore}/{sub.maxScore}</span>
                    <span style={{ color: '#718096', fontSize: '0.85rem' }}>({sub.percentage}%)</span>
                    <span style={{ fontSize: '0.82rem' }}>{sub.status}</span>
                    <Badge text={`Grade ${sub.grade}`} bg={PCT_BG(sub.percentage)} color={PCT_COLOR(sub.percentage)} />
                  </div>
                </div>
                <ProgressBar pct={sub.percentage} />
                <p style={{ color: '#4a5568', fontSize: '0.87rem', marginTop: '0.6rem', lineHeight: 1.6 }}>
                  💬 {sub.feedback}
                </p>
              </div>
            );
          })}
        </Section>

        {/* ── 5. Attendance Status ── */}
        <Section title="Attendance Status" icon="🗓️" accent={attendanceStatus.allowed ? '#38a169' : '#e53e3e'}>
          <div style={{
            padding: '1rem', borderRadius: 10,
            background: attendanceStatus.allowed ? '#c6f6d5' : '#fed7d7',
            marginBottom: '0.75rem',
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: attendanceStatus.allowed ? '#276749' : '#c53030' }}>
              {attendanceStatus.badge}  &nbsp;|&nbsp; {attendanceStatus.percentage}% Attendance
            </div>
            <p style={{ marginTop: '0.4rem', fontSize: '0.88rem', color: '#4a5568' }}>{attendanceStatus.message}</p>
          </div>
          {attendanceStatus.action && (
            <div style={{ padding: '0.75rem 1rem', background: '#fff5f5', borderRadius: 8, border: '1px solid #feb2b2' }}>
              <strong style={{ color: '#c53030', fontSize: '0.85rem' }}>⚠️ Action Required: </strong>
              <span style={{ fontSize: '0.85rem', color: '#4a5568' }}>{attendanceStatus.action}</span>
            </div>
          )}
        </Section>

        {/* ── 6. Parental Communication ── */}
        <Section title="Send Report to Parent" icon="📧" accent="#4299e1">

          {/* Info */}
          <p style={{ fontSize: '0.88rem', color: '#4a5568', marginBottom: '1rem', lineHeight: 1.6 }}>
            Enter your parent's email address below. The full performance report will be sent directly to them with your exam marks, subject feedback, attendance status, and recommended study materials.
          </p>

          {/* Email Input Row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
            <input
              type="email"
              placeholder="Enter parent's email address..."
              onChange={(e) => { setParentEmailInput(e.target.value); setEmailStatus(''); setEmailMessage(''); }}
              style={{
                flex: 1, minWidth: 240, padding: '0.6rem 1rem',
                fontSize: '0.9rem', outline: 'none',
              }}
            />
            <button
              className="btn btn-primary"
              style={{
                padding: '0.6rem 1.4rem', fontSize: '0.9rem',
              }}
            >
            </button>
          </div>

          {/* Status message */}
            <div style={{
              padding: '0.7rem 1rem', borderRadius: 8, fontSize: '0.88rem', fontWeight: 600,
            }}>
            </div>
          )}

          {/* What will be sent */}
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#ebf8ff', borderRadius: 8, border: '1px solid #bee3f8' }}>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#2b6cb0', fontWeight: 600 }}>📋 The email will include:</p>
            <ul style={{ margin: '6px 0 0', paddingLeft: '1.25rem' }}>
              {['Student name, course & department', 'Exam score & subject-wise marks', 'Attendance status & eligibility', 'Recommended books for weak subjects', 'Remedial class schedule (if needed)', 'Motivational message & action plan'].map((item, i) => (
                <li key={i} style={{ fontSize: '0.82rem', color: '#4a5568', marginBottom: '3px' }}>{item}</li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ── 7. Recommended Actions ── */}
        {(recommendedActions.books.length > 0 || recommendedActions.remedialSessions.length > 0) && (
          <Section title="Recommended Study Materials & Actions" icon="📚" accent="#e53e3e">

            {recommendedActions.books.length > 0 && (
              <>
                <h3 style={{ fontSize: '0.95rem', color: '#2d3748', marginBottom: '0.75rem' }}>📕 Model Revision Books</h3>
                {recommendedActions.books.map(({ subject, books }) => {
                  const c = SUB_COLORS[subject] || { bg: '#f0f0f0', color: '#333' };
                  return (
                    <div key={subject} style={{ marginBottom: '1rem' }}>
                      <Badge text={subject} bg={c.bg} color={c.color} />
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {books.map((book, i) => (
                          <div key={i} style={{ padding: '0.5rem 0.75rem', background: '#f7fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                            <strong>{book.title}</strong> — <span style={{ color: '#718096' }}>{book.author}</span>
                            <span style={{ marginLeft: 8, background: '#e2e8f0', borderRadius: 999, padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>{book.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {recommendedActions.remedialSessions.length > 0 && (
              <>
                <h3 style={{ fontSize: '0.95rem', color: '#2d3748', margin: '1rem 0 0.75rem' }}>🏫 Remedial / Extra Classes</h3>
                {recommendedActions.remedialSessions.map(({ subject, sessions }) => (
                  <div key={subject} style={{ marginBottom: '0.85rem' }}>
                    <Badge text={subject} bg="#fed7d7" color="#9b2c2c" />
                    <ul style={{ marginTop: '0.4rem', paddingLeft: '1.25rem' }}>
                      {sessions.map((s, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: '#4a5568', marginBottom: '0.25rem' }}>{s}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </Section>
        )}

        {/* ── 8. Motivational Feedback ── */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 14, padding: '1.5rem', marginBottom: '1.25rem', color: '#fff',
        }}>
          <h2 style={{ marginBottom: '0.75rem', fontSize: '1.05rem' }}>💡 Personal Message for {studentInfo.name}</h2>
          <p style={{ lineHeight: 1.8, fontSize: '0.95rem', opacity: 0.95 }}>{motivationalFeedback}</p>
        </div>

        {/* ── 9. Next Steps ── */}
        <Section title="Next Steps & Action Plan" icon="🎯" accent="#38a169">
          <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
            {nextSteps.map((step, i) => (
              <li key={i} style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.6rem', lineHeight: 1.6 }}>
                {step}
              </li>
            ))}
          </ol>
        </Section>

        {/* Footer nav */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', paddingBottom: '2rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/group')}>← Group Suggestion</button>
          <button className="btn btn-primary" onClick={() => navigate('/test')}>Retake Test</button>
        </div>

      </div>
    </div>
  );
}
