import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Stethoscope, Mail } from 'lucide-react';
import { forgotPassword } from '../../service/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.status === 'success') { setSent(true); toast.success('Reset link sent to your email.'); }
      else toast.error(res.message || 'Failed to send reset link.');
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

        {sent ? (
          <div className="text-center py-4">
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--mc-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Mail size={28} color="var(--mc-success)" />
            </div>
            <h4 style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700 }}>Check your inbox</h4>
            <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>We've sent a password reset link to <strong>{email}</strong>.</p>
            <Link to="/login" className="btn btn-primary px-5">Back to Sign In</Link>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, marginBottom: 4 }}>Forgot password?</h3>
            <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>Enter your email and we'll send you a reset link.</p>
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email address</label>
                <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary w-100 py-2 mb-3" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <div className="text-center">
                <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--mc-accent)' }}>← Back to Sign In</Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
