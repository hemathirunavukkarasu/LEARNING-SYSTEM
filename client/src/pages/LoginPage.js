import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    attendance: '', department: 'General', course: 'Standard X',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isRegister && form.role === 'student') {
      const att = Number(form.attendance);
      if (form.attendance === '' || isNaN(att) || att < 0 || att > 100) {
        setError('Please enter a valid attendance percentage (0–100).');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload  = isRegister
        ? {
            name:        form.name,
            email:       form.email,
            password:    form.password,
            role:        form.role,
            attendance:  form.role === 'student' ? Number(form.attendance) : 100,
            department:  form.department,
            course:      form.course,
          }
        : { email: form.email, password: form.password };

      const res = await api.post(endpoint, payload);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'teacher' ? '/dashboard' : '/test');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const att      = Number(form.attendance);
  const attColor = att >= 80 ? '#38a169' : att >= 60 ? '#d69e2e' : '#e53e3e';
  const attBg    = att >= 80 ? '#c6f6d5' : att >= 60 ? '#fefcbf' : '#fed7d7';
  const attLabel = att >= 80 ? '✅ Eligible' : att >= 60 ? '⚠️ At Risk' : '❌ Below Threshold';

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <h1 style={{ fontSize: '1.5rem' }}>Learning Difficulty Detection</h1>
          <p style={{ color: '#718096', marginTop: '0.25rem' }}>
            {isRegister ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>

            {isRegister && (
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" type="text" placeholder="e.g. Arun Kumar"
                  value={form.name} onChange={handleChange} required />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="you@email.com"
                value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>

            {isRegister && (
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            )}

            {/* ── Student-only registration fields ── */}
            {isRegister && form.role === 'student' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1rem 0 0.9rem' }}>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                  <span style={{ fontSize: '0.78rem', color: '#a0aec0', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    STUDENT DETAILS
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                </div>

                {/* Attendance */}
                <div className="form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Attendance Percentage <span style={{ color: '#e53e3e' }}>*</span></span>
                    {form.attendance !== '' && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, background: attBg, color: attColor, padding: '2px 10px', borderRadius: 999 }}>
                        {attLabel}
                      </span>
                    )}
                  </label>

                  <div style={{ position: 'relative' }}>
                    <input
                      name="attendance" type="number" min="0" max="100" step="0.1"
                      placeholder="e.g. 85"
                      value={form.attendance} onChange={handleChange} required
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <span style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)', color: '#a0aec0',
                      fontWeight: 700, fontSize: '0.9rem', pointerEvents: 'none',
                    }}>%</span>
                  </div>

                  {form.attendance !== '' && !isNaN(att) && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 6, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(att, 100)}%`, height: '100%',
                          background: attColor, borderRadius: 999, transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#a0aec0', marginTop: 3 }}>
                        <span>0%</span>
                        <span style={{ color: '#e53e3e', fontWeight: 600 }}>80% required</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize: '0.78rem', color: '#a0aec0', marginTop: 6 }}>
                    Minimum 80% attendance required to be eligible for tests.
                  </p>
                </div>

                {/* Course */}
                <div className="form-group">
                  <label>Course</label>
                  <select name="course" value={form.course} onChange={handleChange}>
                    <option value="Standard X">Standard X</option>
                    <option value="Standard IX">Standard IX</option>
                    <option value="Standard XI">Standard XI</option>
                    <option value="Standard XII">Standard XII</option>
                  </select>
                </div>

                {/* Department */}
                <div className="form-group">
                  <label>Department</label>
                  <select name="department" value={form.department} onChange={handleChange}>
                    <option value="General">General</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <div style={{
                background: '#fff5f5', border: '1px solid #feb2b2',
                borderRadius: 8, padding: '0.75rem 1rem', marginTop: '0.5rem',
              }}>
                <p className="error-msg" style={{ margin: 0 }}>⚠️ {error}</p>
                {error.toLowerCase().includes('already registered') && (
                  <button
                    type="button"
                    onClick={() => { setIsRegister(false); setError(''); }}
                    style={{
                      marginTop: '0.5rem', background: '#4f46e5', color: '#fff',
                      border: 'none', borderRadius: 6, padding: '0.4rem 1rem',
                      fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    → Sign In with this email
                  </button>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.9rem', color: '#718096' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 600 }}>
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>

        <div style={{ background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#2b6cb0' }}>
          <strong>Demo accounts:</strong><br />
          Student: student@test.com / student123<br />
          Teacher: teacher@test.com / teacher123
        </div>
      </div>
    </div>
  );
}
