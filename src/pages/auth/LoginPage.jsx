import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Stethoscope, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await login(form.email, form.password, form.remember);
      if (res.status === 'success') {
        toast.success('Welcome back!');
        const role = res.data?.role;
        navigate(role === 'admin' ? '/admin/dashboard' : role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      } else {
        toast.error(res.message || 'Invalid credentials.');
      }
    } catch { toast.error('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--mc-bg)' }}>
      {/* Left panel */}
      <div className="d-none d-lg-flex flex-column justify-content-between p-5" style={{ width: 440, background: 'var(--mc-primary)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(139,30,30,0.4)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-15%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(139,30,30,0.2)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-5">
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>Mediconnect</span>
          </Link>
          <h2 style={{ fontFamily: 'var(--mc-font-heading)', color: '#fff', fontWeight: 800, fontSize: '2.4rem', lineHeight: 1.15, marginBottom: '1rem' }}>
            Healthcare,<br /><span style={{ color: '#f87171', fontStyle: 'italic' }}>simplified.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.8 }}>
            Connect with your healthcare providers, manage your appointments, and access your medical history — all in one place.
          </p>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.76rem', position: 'relative', zIndex: 1 }}>© {new Date().getFullYear()} Mediconnect</p>
      </div>

      {/* Right — form */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div style={{ width: '100%', maxWidth: 420 }} className="fade-up">
          {/* Mobile logo */}
          <Link to="/" className="d-flex d-lg-none align-items-center gap-2 text-decoration-none mb-4">
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={16} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, color: 'var(--mc-text)' }}>Mediconnect</span>
          </Link>

          <h3 style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, marginBottom: 4 }}>Sign in</h3>
          <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--mc-accent)', fontWeight: 600 }}>Create one</Link>
          </p>

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email address</label>
              <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={e => handle('email', e.target.value)} required />
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label mb-0" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--mc-accent)' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} className="form-control" placeholder="••••••••" value={form.password} onChange={e => handle('password', e.target.value)} required style={{ paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mc-text-muted)', padding: 0 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="form-check mb-4">
              <input className="form-check-input" type="checkbox" id="remember" checked={form.remember} onChange={e => handle('remember', e.target.checked)} style={{ accentColor: 'var(--mc-accent)' }} />
              <label className="form-check-label" htmlFor="remember" style={{ fontSize: '0.82rem' }}>Remember me for 30 days</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading} style={{ fontSize: '0.95rem' }}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
