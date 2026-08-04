import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, SkeletonLoader } from '../../component/ui';
import { useTheme } from '../../context/ThemeContext';
import { getUserPrefs, updateUserPrefs } from '../../service/otherServices';

export default function DoctorSettings() {
  const { dark, toggle } = useTheme();
  const [prefs, setPrefs]   = useState({ email_notifications: true, appointment_reminders: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    getUserPrefs().then(res => {
      if (res.status === 'success' && res.data) setPrefs(p => ({ ...p, ...res.data }));
    }).finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateUserPrefs(prefs);
    if (res.status === 'success') toast.success('Settings saved.');
    else toast.error('Failed to save settings.');
    setSaving(false);
  };

  if (loading) return <div className="mc-page"><SkeletonLoader count={4} height={48} /></div>;

  return (
    <div className="mc-page">
      <PageHeader title="Settings" />
      <div className="mc-section" style={{ maxWidth: 500 }}>
        <form onSubmit={save}>
          <p style={{ fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mc-text-muted)', marginBottom: '1rem' }}>Appearance</p>
          <div className="d-flex align-items-center justify-content-between mb-4 p-3" style={{ background: 'var(--mc-muted)', borderRadius: 10 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>Dark Mode</p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--mc-text-muted)' }}>Switch between light and dark theme</p>
            </div>
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" style={{ width: 40, height: 22, accentColor: 'var(--mc-accent)', cursor: 'pointer' }} checked={dark} onChange={toggle} />
            </div>
          </div>

          <p style={{ fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mc-text-muted)', marginBottom: '1rem' }}>Notifications</p>
          {[
            { key: 'email_notifications',   label: 'Email Notifications',    desc: 'Receive appointment alerts via email' },
            { key: 'appointment_reminders', label: 'Appointment Reminders',  desc: 'Get reminded before your appointments' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="d-flex align-items-center justify-content-between mb-2 p-3" style={{ background: 'var(--mc-muted)', borderRadius: 10 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--mc-text-muted)' }}>{desc}</p>
              </div>
              <div className="form-check form-switch mb-0">
                <input className="form-check-input" type="checkbox" style={{ width: 40, height: 22, accentColor: 'var(--mc-accent)', cursor: 'pointer' }} checked={!!prefs[key]} onChange={e => setPrefs(p => ({ ...p, [key]: e.target.checked }))} />
              </div>
            </div>
          ))}

          <div className="mt-4">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
