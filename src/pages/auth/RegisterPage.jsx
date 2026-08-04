import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Stethoscope, Eye, EyeOff, User, Stethoscope as DocIcon } from 'lucide-react';
import { registerUser } from '../../service/authService';

const ROLES = [
  { value: 'patient', label: 'Patient',      desc: 'Book appointments & track your health' },
  { value: 'doctor',  label: 'Doctor',        desc: 'Manage appointments & consultations'   },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm_password: '',
    date_of_birth: '', gender: '', address: '',
    specialization: '', license_number: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match.'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await registerUser({ ...form, role });
      if (res.status === 'success') {
        toast.success('Account created! Please sign in.');
        navigate('/login');
      } else {
        toast.error(res.message || 'Registration failed.');
      }
    } catch { toast.error('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mc-bg)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }} className="fade-up">
        {/* Logo */}
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none mb-4">
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, color: 'var(--mc-text)' }}>Mediconnect</span>
        </Link>

        <h3 style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, marginBottom: 4 }}>Create your account</h3>
        <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--mc-accent)', fontWeight: 600 }}>Sign in</Link>
        </p>

        {/* Role selector */}
        <div className="row g-3 mb-4">
          {ROLES.map(({ value, label, desc }) => (
            <div key={value} className="col-6">
              <div
                onClick={() => setRole(value)}
                style={{ border: `2px solid ${role === value ? 'var(--mc-accent)' : 'var(--mc-border)'}`, borderRadius: 12, padding: '1rem', cursor: 'pointer', background: role === value ? 'var(--mc-accent-light)' : 'var(--mc-surface)', transition: 'var(--mc-transition)' }}
              >
                <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '0.88rem', color: role === value ? 'var(--mc-accent)' : 'var(--mc-text)' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--mc-text-muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Full Name</label>
              <input type="text" className="form-control" placeholder="John Doe" value={form.full_name} onChange={e => handle('full_name', e.target.value)} required />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email</label>
              <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={e => handle('email', e.target.value)} required />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Phone</label>
              <input type="tel" className="form-control" placeholder="+233 XX XXX XXXX" value={form.phone} onChange={e => handle('phone', e.target.value)} />
            </div>

            {role === 'patient' && <>
              <div className="col-12 col-sm-6">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Date of Birth</label>
                <input type="date" className="form-control" value={form.date_of_birth} onChange={e => handle('date_of_birth', e.target.value)} required />
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Gender</label>
                <select className="form-select" value={form.gender} onChange={e => handle('gender', e.target.value)} required>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Address</label>
                <input type="text" className="form-control" placeholder="Your address" value={form.address} onChange={e => handle('address', e.target.value)} />
              </div>
            </>}

            {role === 'doctor' && <>
              <div className="col-12 col-sm-6">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Specialization</label>
                <input type="text" className="form-control" placeholder="e.g. Cardiologist" value={form.specialization} onChange={e => handle('specialization', e.target.value)} required />
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>License Number</label>
                <input type="text" className="form-control" placeholder="MD-XXXXX" value={form.license_number} onChange={e => handle('license_number', e.target.value)} required />
              </div>
            </>}

            <div className="col-12 col-sm-6">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} className="form-control" placeholder="Min. 8 characters" value={form.password} onChange={e => handle('password', e.target.value)} required style={{ paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mc-text-muted)', padding: 0 }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Confirm Password</label>
              <input type="password" className="form-control" placeholder="Re-enter password" value={form.confirm_password} onChange={e => handle('confirm_password', e.target.value)} required />
            </div>

            <div className="col-12 mt-2">
              <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading} style={{ fontSize: '0.95rem' }}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
