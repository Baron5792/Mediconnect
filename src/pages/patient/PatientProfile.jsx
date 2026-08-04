import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, SkeletonLoader } from '../../component/ui';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../service/authService';
import { getPatientProfile, updatePatientProfile } from '../../service/patientService';

export default function PatientProfile() {
  const { user, setUser } = useAuth();
  const [tab, setTab]     = useState('profile');
  const [form, setForm]   = useState({ full_name: '', email: '', phone: '', date_of_birth: '', gender: '', address: '', blood_type: '', allergies: '' });
  const [pw, setPw]       = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving]     = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getPatientProfile().then(res => {
      if (res.status === 'success' && res.data) {
        const d = res.data;
        setForm({
          full_name: d.full_name || '', email: d.email || '', phone: d.phone || '',
          date_of_birth: d.date_of_birth || '', gender: d.gender || '',
          address: d.address || '', blood_type: d.blood_type || '', allergies: d.allergies || '',
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updatePatientProfile(form);
    if (res.status === 'success') { toast.success('Profile updated.'); if (setUser) setUser(p => ({ ...p, full_name: form.full_name, email: form.email })); }
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

  if (loading) return <div className="mc-page"><SkeletonLoader count={8} height={44} /></div>;

  return (
    <div className="mc-page">
      <PageHeader title="My Profile" />
      <div style={{ maxWidth: 600 }}>
        {/* Avatar strip */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.6rem', fontFamily: 'var(--mc-font-heading)' }}>{(user?.full_name || 'P').charAt(0)}</span>
          </div>
          <div>
            <h5 style={{ fontFamily: 'var(--mc-font-heading)', margin: '0 0 2px' }}>{user?.full_name}</h5>
            <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--mc-text-muted)' }}>Patient Account</p>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-pills mb-4">
          <li className="nav-item"><button className={`nav-link ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')} style={{ fontSize: '0.85rem' }}>Personal Info</button></li>
          <li className="nav-item"><button className={`nav-link ${tab === 'health' ? 'active' : ''}`} onClick={() => setTab('health')} style={{ fontSize: '0.85rem' }}>Health Info</button></li>
          <li className="nav-item"><button className={`nav-link ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')} style={{ fontSize: '0.85rem' }}>Change Password</button></li>
        </ul>

        {tab === 'profile' && (
          <div className="mc-section">
            <form onSubmit={saveProfile}>
              <div className="row g-3">
                <div className="col-12"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Full Name</label><input className="form-control" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} /></div>
                <div className="col-12 col-sm-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div className="col-12 col-sm-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                <div className="col-12 col-sm-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Date of Birth</label><input type="date" className="form-control" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} /></div>
                <div className="col-12 col-sm-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Gender</label>
                  <select className="form-select" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select…</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-12"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Address</label><input className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
                <div className="col-12"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button></div>
              </div>
            </form>
          </div>
        )}

        {tab === 'health' && (
          <div className="mc-section">
            <form onSubmit={saveProfile}>
              <div className="row g-3">
                <div className="col-12 col-sm-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Blood Type</label>
                  <select className="form-select" value={form.blood_type} onChange={e => setForm(p => ({ ...p, blood_type: e.target.value }))}>
                    <option value="">Select…</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-12"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Allergies</label><textarea className="form-control" rows={3} placeholder="List any known allergies…" value={form.allergies} onChange={e => setForm(p => ({ ...p, allergies: e.target.value }))} /></div>
                <div className="col-12"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Health Info'}</button></div>
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
