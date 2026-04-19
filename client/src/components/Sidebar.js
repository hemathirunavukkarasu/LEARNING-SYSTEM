import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Nav items per role ──────────────────────────────────────
const STUDENT_LINKS = [
  { path: '/test',   icon: '📝', label: 'Take Test'       },
  { path: '/result', icon: '📊', label: 'My Result'       },
  { path: '/group',  icon: '🎯', label: 'Stream Advice'   },
  { path: '/report', icon: '📋', label: 'Full Report'     },
];

const TEACHER_LINKS = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard'     },
  { path: '/reports',   icon: '📂', label: 'All Reports'   },
];

export default function Sidebar({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return <>{children}</>;

  const links = user.role === 'teacher' ? TEACHER_LINKS : STUDENT_LINKS;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: collapsed ? 64 : 220,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 100,
      }}>

        {/* Logo / toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '1.25rem 0' : '1.25rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>🎓</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                LearnSystem
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: 6, color: '#fff', cursor: 'pointer',
              fontSize: 16, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* User info */}
        {!collapsed && (
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: '#fff', fontSize: '0.95rem',
              marginBottom: 8,
            }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{
              display: 'inline-block', marginTop: 4,
              background: user.role === 'teacher' ? 'rgba(251,191,36,0.2)' : 'rgba(99,102,241,0.3)',
              color: user.role === 'teacher' ? '#fbbf24' : '#a5b4fc',
              fontSize: '0.72rem', fontWeight: 700,
              padding: '2px 8px', borderRadius: 999,
              textTransform: 'capitalize',
            }}>
              {user.role}
            </div>
          </div>
        )}

        {collapsed && (
          <div style={{ padding: '0.75rem 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: '#fff', fontSize: '0.9rem',
            }}>
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0.75rem 0' }}>
          {links.map(({ path, icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={collapsed ? label : undefined}
                style={{
                  width: '100%', display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? 0 : 12,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  borderLeft: active ? '3px solid #818cf8' : '3px solid transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                {!collapsed && (
                  <span style={{
                    color: active ? '#fff' : 'rgba(255,255,255,0.75)',
                    fontSize: '0.88rem', fontWeight: active ? 700 : 500,
                    whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: collapsed ? '1rem 0' : '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            style={{
              width: '100%', display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: 'rgba(239,68,68,0.15)',
              border: 'none', borderRadius: 8,
              color: '#fca5a5', cursor: 'pointer',
              padding: collapsed ? '0.6rem 0' : '0.6rem 0.9rem',
              fontSize: '0.85rem', fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.28)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, minWidth: 0, background: '#f0f4f8' }}>
        {children}
      </main>
    </div>
  );
}
