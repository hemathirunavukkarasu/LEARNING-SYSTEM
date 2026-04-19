import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTest } from '../context/TestContext';
import api from '../api/axios';

// ── Sub-component: MCQ / Paragraph question ──────────────────
function MCQQuestion({ question, answer, onAnswer }) {
  return (
    <div>
      {question.passage && (
        <div style={{
          background: '#f7fafc', border: '1px solid #e2e8f0',
          borderRadius: 8, padding: '1rem', marginBottom: '1rem',
          fontSize: '0.95rem', lineHeight: 1.7, color: '#4a5568'
        }}>
          <strong>📖 Read the passage:</strong><br />{question.passage}
        </div>
      )}
      <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#2d3748' }}>
        {question.question}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {question.options.map((opt, i) => (
          <label key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.65rem 1rem', borderRadius: 8, cursor: 'pointer',
            border: `2px solid ${answer === opt ? '#4f46e5' : '#e2e8f0'}`,
            background: answer === opt ? '#eef2ff' : '#fff',
            transition: 'all 0.15s'
          }}>
            <input
              type="radio" name={question._id}
              value={opt} checked={answer === opt}
              onChange={() => onAnswer(question._id, opt)}
              style={{ accentColor: '#4f46e5' }}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Sub-component: Match the Following ───────────────────────
function MatchQuestion({ question, answer, onAnswer }) {
  // answer is an array of selected right-side values for each left item
  const leftItems = question.matchPairs.map((p) => p.left);

  // Use shuffledOptions from DB; if missing, shuffle at runtime so order never hints the answer
  const rightOptions = React.useMemo(() => {
    if (question.shuffledOptions && question.shuffledOptions.length > 0) {
      return question.shuffledOptions;
    }
    const opts = question.matchPairs.map((p) => p.right);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [question._id]); // eslint-disable-line

  const currentAnswer = answer || leftItems.map(() => '');

  const handleSelect = (index, value) => {
    const updated = [...currentAnswer];
    updated[index] = value;
    onAnswer(question._id, updated);
  };

  return (
    <div>
      <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#2d3748' }}>
        {question.question}
      </p>

      {/* Column headers */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.4rem', paddingLeft: '0.2rem' }}>
        <div style={{ minWidth: 180, fontSize: '0.78rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Column A
        </div>
        <div style={{ width: 24 }} />
        <div style={{ flex: 1, fontSize: '0.78rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Column B
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {leftItems.map((left, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              minWidth: 180, padding: '0.5rem 0.9rem',
              background: '#eef2ff', border: '1px solid #c7d2fe',
              borderRadius: 8, fontWeight: 600, color: '#3730a3', fontSize: '0.9rem'
            }}>
              {i + 1}. {left}
            </div>
            <span style={{ color: '#a0aec0' }}>→</span>
            <select
              value={currentAnswer[i] || ''}
              onChange={(e) => handleSelect(i, e.target.value)}
              style={{
                padding: '0.5rem 0.9rem', borderRadius: 8, flex: 1,
                border: `2px solid ${currentAnswer[i] ? '#4f46e5' : '#e2e8f0'}`,
                background: currentAnswer[i] ? '#eef2ff' : '#fff',
                fontWeight: currentAnswer[i] ? 600 : 400,
                outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="">-- Select match --</option>
              {rightOptions.map((opt, j) => (
                <option key={j} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Right column reference box */}
      <div style={{ marginTop: '0.85rem', padding: '0.6rem 1rem', background: '#f7fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <span style={{ fontSize: '0.78rem', color: '#718096', fontWeight: 600 }}>Column B options: </span>
        {rightOptions.map((opt, i) => (
          <span key={i} style={{ fontSize: '0.82rem', color: '#4a5568', marginRight: '1rem' }}>
            ({String.fromCharCode(65 + i)}) {opt}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Test Page ────────────────────────────────────────────
export default function TestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTestResult } = useTest();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});   // { questionId: answer }
  const [current, setCurrent] = useState(0);    // current question index
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Subjects for the progress header
  const SUBJECTS = ['Tamil', 'English', 'Maths', 'Science', 'Social'];

  useEffect(() => {
    api.get('/questions')
      .then((res) => setQuestions(res.data.questions))
      .catch(() => setError('Failed to load questions. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const answered = Object.keys(answers).filter((id) => {
    const a = answers[id];
    if (Array.isArray(a)) return a.some(Boolean);
    return Boolean(a);
  }).length;

  const handleSubmit = async () => {
    if (answered < questions.length) {
      const unanswered = questions.length - answered;
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/results/submit', { answers });
      setTestResult(res.data.result);
      navigate('/result');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <div className="spinner" />
      <p>Loading your test...</p>
    </div>
  );

  if (error) return (
    <div className="page" style={{ textAlign: 'center' }}>
      <p className="error-msg">{error}</p>
    </div>
  );

  const q = questions[current];
  const subjectGroup = SUBJECTS.indexOf(q?.subject);

  // Progress per subject (4 questions each)
  const subjectProgress = SUBJECTS.map((sub) => {
    const subQs = questions.filter((q) => q.subject === sub);
    const subAnswered = subQs.filter((q) => answers[q._id]).length;
    return { sub, answered: subAnswered, total: subQs.length };
  });

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', marginBottom: 0 }}>📝 Assessment Test</h1>
            <p style={{ color: '#718096', fontSize: '0.9rem' }}>Hello, {user?.name}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-blue">{answered} / {questions.length} answered</span>
          </div>
        </div>

        {/* Subject progress bars */}
        <div className="card" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {subjectProgress.map(({ sub, answered: ans, total }) => (
              <div key={sub} style={{ flex: 1, minWidth: 120 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: '#4a5568' }}>{sub}</span>
                  <span style={{ color: '#a0aec0' }}>{ans}/{total}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(ans / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="badge badge-purple">{q.subject}</span>
            <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>
              Question {current + 1} of {questions.length}
            </span>
          </div>

          {(q.type === 'MCQ' || q.type === 'PARAGRAPH') && (
            <MCQQuestion
              question={q}
              answer={answers[q._id] || ''}
              onAnswer={handleAnswer}
            />
          )}
          {q.type === 'MATCH' && (
            <MatchQuestion
              question={q}
              answer={answers[q._id]}
              onAnswer={handleAnswer}
            />
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrent((c) => c - 1)}
            disabled={current === 0}
          >
            ← Previous
          </button>

          {/* Question dots */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: 30, height: 30, borderRadius: '50%', border: 'none',
                  cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                  background: i === current ? '#4f46e5' : answers[questions[i]._id] ? '#c6f6d5' : '#e2e8f0',
                  color: i === current ? '#fff' : answers[questions[i]._id] ? '#276749' : '#4a5568',
                  transition: 'all 0.15s'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {current < questions.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrent((c) => c + 1)}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : '✅ Submit Test'}
            </button>
          )}
        </div>

        {error && <p className="error-msg" style={{ textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
      </div>
    </div>
  );
}
