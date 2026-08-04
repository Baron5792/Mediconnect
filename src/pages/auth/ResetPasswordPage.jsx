import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Stethoscope, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../../service/authService';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match.'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await resetPassword(token, form.password, form.confirm);
      if (res.status === 'success') { toast.success('Password updated! Please sign in.'); navigate('/login'); }
      else toast.error(res.message || 'Reset failed. Link may be expired.');
    } catch { toast.error('Network error.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--mc-bg)' }}>
      <div style={{ width: '100%', maxWidth: 400 }} className="fade-up">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-4">
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, color: 'var(--mc-text)' }}>Mediconnect</span>
        </Link>

        <h3 style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, marginBottom: 4 }}>Set new password</h3>
        <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>Choose a strong password for your account.</p>

        {!token && <div className="alert alert-danger">Invalid or missing reset token. <Link to="/forgot-password">Request a new link.</Link></div>}

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} className="form-control" placeholder="Min. 8 characters" value={form.password} onChange={e => handle('password', e.target.value)} required style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mc-text-muted)', padding: 0 }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Confirm Password</label>
            <input type="password" className="form-control" placeholder="Re-enter new password" value={form.confirm} onChange={e => handle('confirm', e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2 mb-3" disabled={loading || !token}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            {loading ? 'Updating…' : 'Update Password'}
          </button>
          <div className="text-center">
            <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--mc-accent)' }}>← Back to Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
