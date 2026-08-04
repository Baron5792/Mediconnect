import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, SkeletonLoader } from '../../component/ui';
import { useTheme } from '../../context/ThemeContext';
import { getUserPrefs, updateUserPrefs } from '../../service/otherServices';

export default function PatientSettings() {
  const { dark, toggle } = useTheme();
  const [prefs, setPrefs]     = useState({ email_notifications: true, appointment_reminders: true, sms_notifications: false });
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
    else toast.error('Failed to save.');
    setSaving(false);
  };

  if (loading) return <div className="mc-page"><SkeletonLoader count={5} height={52} /></div>;

  return (
    <div className="mc-page">
      <PageHeader title="Settings" subtitle="Manage your account preferences" />
      <div className="mc-section" style={{ maxWidth: 520 }}>
        <form onSubmit={save}>
          {/* Appearance */}
          <p style={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mc-text-muted)', marginBottom: '0.75rem' }}>Appearance</p>
          <ToggleRow label="Dark Mode" desc="Switch between light and dark theme" checked={dark} onChange={toggle} />

          <hr style={{ margin: '1.25rem 0', borderColor: 'var(--mc-border)' }} />

          {/* Notifications */}
          <p style={{ fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mc-text-muted)', marginBottom: '0.75rem' }}>Notifications</p>
          {[
            { key: 'email_notifications',   label: 'Email Notifications',    desc: 'Get appointment updates in your inbox' },
            { key: 'appointment_reminders', label: 'Appointment Reminders',  desc: 'Receive reminders before your appointments' },
            { key: 'sms_notifications',     label: 'SMS Notifications',      desc: 'Receive SMS alerts for important events' },
          ].map(({ key, label, desc }) => (
            <ToggleRow key={key} label={label} desc={desc} checked={!!prefs[key]} onChange={e => setPrefs(p => ({ ...p, [key]: e.target.checked }))} />
          ))}

          <div className="mt-4">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="d-flex align-items-center justify-content-between p-3 mb-2" style={{ background: 'var(--mc-muted)', borderRadius: 10 }}>
      <div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--mc-text-muted)' }}>{desc}</p>
      </div>
      <div className="form-check form-switch mb-0">
        <input className="form-check-input" type="checkbox" style={{ width: 40, height: 22, cursor: 'pointer', accentColor: 'var(--mc-accent)' }} checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}
