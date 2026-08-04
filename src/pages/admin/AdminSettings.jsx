import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader, SkeletonLoader } from '../../component/ui';
import { getSettings, updateSettings } from '../../service/otherServices';

export default function AdminSettings() {
  const [form, setForm]   = useState({ site_name: '', site_email: '', support_phone: '', notifications_enabled: true, appointment_reminder_hours: 24 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    getSettings().then(res => {
      if (res.status === 'success' && res.data) setForm(p => ({ ...p, ...res.data }));
    }).finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateSettings(form);
    if (res.status === 'success') toast.success('Settings saved.');
    else toast.error(res.message || 'Failed.');
    setSaving(false);
  };

  if (loading) return <div className="mc-page"><SkeletonLoader count={6} height={48} /></div>;

  return (
    <div className="mc-page">
      <PageHeader title="System Settings" subtitle="Configure platform-wide settings" />
      <div className="mc-section" style={{ maxWidth: 600 }}>
        <form onSubmit={save}>
          <div className="row g-3">
            <div className="col-12"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Site Name</label><input className="form-control" value={form.site_name} onChange={e => setForm(p => ({ ...p, site_name: e.target.value }))} /></div>
            <div className="col-12 col-sm-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Contact Email</label><input type="email" className="form-control" value={form.site_email} onChange={e => setForm(p => ({ ...p, site_email: e.target.value }))} /></div>
            <div className="col-12 col-sm-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Support Phone</label><input className="form-control" value={form.support_phone} onChange={e => setForm(p => ({ ...p, support_phone: e.target.value }))} /></div>
            <div className="col-12 col-sm-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Appointment Reminder (hours before)</label><input type="number" className="form-control" value={form.appointment_reminder_hours} onChange={e => setForm(p => ({ ...p, appointment_reminder_hours: e.target.value }))} /></div>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="notif" checked={!!form.notifications_enabled} onChange={e => setForm(p => ({ ...p, notifications_enabled: e.target.checked }))} style={{ accentColor: 'var(--mc-accent)' }} />
                <label className="form-check-label" htmlFor="notif" style={{ fontSize: '0.88rem' }}>Enable Email Notifications</label>
              </div>
            </div>
            <div className="col-12 mt-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
