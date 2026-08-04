import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { PageHeader, StatusBadge, SkeletonLoader, Modal } from '../../component/ui';
import { getTodayAppointments, updateAppointmentStatus } from '../../service/appointmentService';

export default function TodayAppointments() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getTodayAppointments();
    if (res.status === 'success') setItems(res.data || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const action = async (id, status, note = '') => {
    const res = await updateAppointmentStatus(id, status, note);
    if (res.status === 'success') { toast.success(`Appointment ${status}.`); load(); }
    else toast.error(res.message);
  };

  return (
    <div className="mc-page">
      <PageHeader title="Today's Appointments" subtitle={new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />

      {loading ? <SkeletonLoader count={4} height={100} /> : items.length === 0
        ? <div className="text-center py-5" style={{ color: 'var(--mc-text-muted)' }}><p style={{ fontFamily: 'var(--mc-font-heading)', fontSize: '1.1rem' }}>No appointments today.</p></div>
        : <div className="row g-3">
          {items.map(a => (
            <div key={a.id} className="col-12 col-md-6">
              <div className="card p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.95rem' }}>{a.patient_name}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--mc-text-muted)' }}>{a.appointment_time} · {a.reason || 'General consultation'}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="d-flex gap-2 mt-2 flex-wrap">
                  <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }} onClick={() => setView(a)}><Eye size={12} />Details</button>
                  {a.status === 'pending' && <>
                    <button className="btn btn-sm d-flex align-items-center gap-1" style={{ background: 'var(--mc-success-bg)', color: 'var(--mc-success)', border: 'none', fontSize: '0.78rem' }} onClick={() => action(a.id, 'confirmed')}><CheckCircle size={12} />Approve</button>
                    <button className="btn btn-sm d-flex align-items-center gap-1" style={{ background: 'var(--mc-danger-bg)', color: 'var(--mc-danger)', border: 'none', fontSize: '0.78rem' }} onClick={() => action(a.id, 'rejected')}><XCircle size={12} />Reject</button>
                  </>}
                  {a.status === 'confirmed' && (
                    <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }} onClick={() => action(a.id, 'completed')}>Mark Completed</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      }

      <Modal show={!!view} onClose={() => setView(null)} title="Appointment Details">
        {view && (
          <>
            <div className="modal-body">
              {[['Patient', view.patient_name], ['Date', view.appointment_date], ['Time', view.appointment_time], ['Status', view.status], ['Reason', view.reason], ['Notes', view.notes]].map(([k, v]) => v && (
                <div key={k} className="d-flex gap-3 mb-2">
                  <span style={{ width: 80, flexShrink: 0, fontSize: '0.76rem', color: 'var(--mc-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{k}</span>
                  <span style={{ fontSize: '0.88rem', textTransform: k === 'Status' ? 'capitalize' : 'none' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer"><button className="btn btn-outline-secondary btn-sm" onClick={() => setView(null)}>Close</button></div>
          </>
        )}
      </Modal>
    </div>
  );
}
