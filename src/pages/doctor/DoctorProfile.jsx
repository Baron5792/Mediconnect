import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, SkeletonLoader } from '../../component/ui';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../service/authService';
import { getDoctorProfile, updateDoctorProfile } from '../../service/doctorService';

export default function DoctorProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm]   = useState({ full_name: '', email: '', phone: '', specialization: '' });
  const [pw, setPw]       = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving]   = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [tab, setTab]     = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorProfile().then(res => {
      if (res.status === 'success' && res.data) {
        const d = res.data;
        setForm({ full_name: d.full_name || '', email: d.email || '', phone: d.phone || '', specialization: d.specialization || '' });
      }
    }).finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateDoctorProfile(form);
    if (res.status === 'success') { toast.success('Profile updated.'); if (setUser) setUser(p => ({ ...p, ...form })); }
    else toast.error(res.message || 'Failed.');
    setSaving(false);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) { toast.error('Passwords do not match.'); return; }
    setSavingPw(true);
    const res = await changePassword(pw.current, pw.next, pw.confirm);
    if (res.status === 'success') { toast.success('Password changed.'); setPw({ current: '', next: '', confirm: '' }); }
    else toast.error(res.message || 'Failed.');
    setSavingPw(false);
  };

  if (loading) return <div className="mc-page"><SkeletonLoader count={6} height={44} /></div>;

  return (
    <div className="mc-page">
      <PageHeader title="My Profile" />
      <div style={{ maxWidth: 600 }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.6rem', fontFamily: 'var(--mc-font-heading)' }}>{(user?.full_name || 'D').charAt(0)}</span>
          </div>
          <div>
            <h5 style={{ fontFamily: 'var(--mc-font-heading)', margin: 0 }}>Dr. {user?.full_name}</h5>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--mc-text-muted)' }}>{form.specialization || 'Doctor'}</p>
          </div>
        </div>

        <ul className="nav nav-pills mb-4">
          <li className="nav-item"><button className={`nav-link ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')} style={{ fontSize: '0.85rem' }}>Profile Info</button></li>
          <li className="nav-item"><button className={`nav-link ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')} style={{ fontSize: '0.85rem' }}>Change Password</button></li>
        </ul>

        {tab === 'profile' && (
          <div className="mc-section">
            <form onSubmit={saveProfile}>
              <div className="row g-3">
                <div className="col-12"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Full Name</label><input className="form-control" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} /></div>
                <div className="col-12 col-sm-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div className="col-12 col-sm-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                <div className="col-12"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Specialization</label><input className="form-control" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} /></div>
                <div className="col-12"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button></div>
              </div>
            </form>
          </div>
        )}

        {tab === 'password' && (
          <div className="mc-section">
            <form onSubmit={savePassword}>
              <div className="row g-3">
                <div className="col-12"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Current Password</label><input type="password" className="form-control" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} required /></div>
                <div className="col-12 col-sm-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>New Password</label><input type="password" className="form-control" value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} required /></div>
                <div className="col-12 col-sm-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Confirm Password</label><input type="password" className="form-control" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} required /></div>
                <div className="col-12"><button type="submit" className="btn btn-primary" disabled={savingPw}>{savingPw ? 'Updating…' : 'Update Password'}</button></div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
