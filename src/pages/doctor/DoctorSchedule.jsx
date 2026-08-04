import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Clock } from 'lucide-react';
import { PageHeader, SkeletonLoader, Modal, ConfirmModal } from '../../component/ui';
import { createScheduleSlot, deleteScheduleSlot, getDoctorSchedule } from '../../service/doctorService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorSchedule() {
  const [slots, setSlots]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [form, setForm] = useState({ day_of_week: 'Monday', start_time: '09:00', end_time: '17:00', is_available: true });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getDoctorSchedule();
    if (res.status === 'success') setSlots(res.data || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    const res = await createScheduleSlot(form);
    if (res.status === 'success') { toast.success('Schedule slot added.'); setShowModal(false); load(); }
    else toast.error(res.message || 'Failed.');
  };

  const confirmDelete = async () => {
    setDeleting(true);
    const res = await deleteScheduleSlot(confirmId);
    setDeleting(false);
    setConfirmId(null);
    if (res.status === 'success') { toast.success('Slot removed.'); load(); }
    else toast.error(res.message);
  };

  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = slots.filter(s => s.day_of_week === d);
    return acc;
  }, {});

  return (
    <div className="mc-page">
      <PageHeader title="My Schedule" subtitle="Set your weekly availability for appointments" action={<button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => setShowModal(true)}><Plus size={14} />Add Slot</button>} />

      {loading ? <SkeletonLoader count={7} height={70} /> : (
        <div className="row g-3">
          {DAYS.map(day => (
            <div key={day} className="col-12 col-sm-6 col-lg-4">
              <div className="card p-3 h-100" style={{ borderTop: byDay[day].length > 0 ? '3px solid var(--mc-accent)' : '3px solid var(--mc-border)' }}>
                <p style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, fontSize: '0.92rem', margin: '0 0 0.75rem' }}>{day}</p>
                {byDay[day].length === 0
                  ? <p style={{ fontSize: '0.8rem', color: 'var(--mc-text-muted)', margin: 0 }}>Not available</p>
                  : byDay[day].map(s => (
                    <div key={s.id} className="d-flex align-items-center justify-content-between mb-1">
                      <span style={{ fontSize: '0.85rem', color: s.is_available ? 'var(--mc-text)' : 'var(--mc-text-muted)', textDecoration: s.is_available ? 'none' : 'line-through' }}>
                        {s.start_time} – {s.end_time}
                      </span>
                      <button className="btn btn-sm" style={{ background: 'transparent', border: 'none', padding: '2px 4px' }} onClick={() => setConfirmId(s.id)}><Trash2 size={13} color="var(--mc-danger)" /></button>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} title="Add Availability Slot" description="Define a recurring weekly time block for appointments." icon={Clock}>
        <form onSubmit={save}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Day of Week</label>
              <select className="form-select" value={form.day_of_week} onChange={e => setForm(p => ({ ...p, day_of_week: e.target.value }))}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="row g-3">
              <div className="col-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Start Time</label><input type="time" className="form-control" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} required /></div>
              <div className="col-6"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>End Time</label><input type="time" className="form-control" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} required /></div>
            </div>
            <div className="form-check mt-3">
              <input className="form-check-input" type="checkbox" id="avail" checked={form.is_available} onChange={e => setForm(p => ({ ...p, is_available: e.target.checked }))} />
              <label className="form-check-label" htmlFor="avail" style={{ fontSize: '0.85rem' }}>Mark as Available</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Add Slot</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        show={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Remove Time Slot"
        message="Remove this availability slot? Existing appointments in this window will not be affected."
        confirmLabel="Remove Slot"
      />
    </div>
  );
}
