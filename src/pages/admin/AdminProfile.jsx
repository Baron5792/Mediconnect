import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '../../component/ui';
import { useAuth } from '../../context/AuthContext';
import { changePassword, updateProfile } from '../../service/authService';

export default function AdminProfile() {
  const { user, setUser } = useAuth();
  const [form, setForm]       = useState({ full_name: '', email: '', phone: '' });
  const [pw, setPw]           = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving]   = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [tab, setTab]         = useState('profile');

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || '', email: user.email || '', phone: user.phone || '' });
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error('Full name is required.'); return; }
    setSaving(true);
    const res = await updateProfile({ full_name: form.full_name, phone: form.phone });
    setSaving(false);
    if (res.status === 'success') {
      toast.success('Profile updated.');
      if (setUser) setUser(p => ({ ...p, full_name: form.full_name, phone: form.phone }));
    } else {
      toast.error(res.message || 'Failed to update profile.');
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) { toast.error('Passwords do not match.'); return; }
    if (pw.next.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setSavingPw(true);
    const res = await changePassword(pw.current, pw.next, pw.confirm);
    setSavingPw(false);
    if (res.status === 'success') { toast.success('Password changed.'); setPw({ current: '', next: '', confirm: '' }); }
    else toast.error(res.message || 'Failed.');
  };

  return (
    <div className="mc-page">
      <PageHeader title="My Profile" />
      <div style={{ maxWidth: 600 }}>
        {/* Avatar */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.6rem', fontFamily: 'var(--mc-font-heading)' }}>{(user?.full_name || 'A').charAt(0)}</span>
          </div>
          <div>
            <h5 style={{ fontFamily: 'var(--mc-font-heading)', margin: 0 }}>{user?.full_name}</h5>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--mc-text-muted)' }}>Administrator</p>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-pills mb-4">
          <li className="nav-item"><button className={`nav-link ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')} style={{ fontSize: '0.85rem' }}>Profile Info</button></li>
          <li className="nav-item"><button className={`nav-link ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')} style={{ fontSize: '0.85rem' }}>Change Password</button></li>
        </ul>

        {tab === 'profile' && (
          <div className="mc-section">
            <form onSubmit={saveProfile}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Full Name</label>
                  <input className="form-control" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email</label>
                  <input type="email" className="form-control" value={form.email} disabled style={{ background: 'var(--mc-muted)', cursor: 'not-allowed' }} />
                  <small style={{ color: 'var(--mc-text-muted)', fontSize: '0.75rem' }}>Email cannot be changed.</small>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Phone</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {tab === 'password' && (
          <div className="mc-section">
            <form onSubmit={savePassword}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Current Password</label>
                  <input type="password" className="form-control" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>New Password</label>
                  <input type="password" className="form-control" value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Confirm Password</label>
                  <input type="password" className="form-control" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} required />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary" disabled={savingPw}>{savingPw ? 'Updating…' : 'Update Password'}</button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
