import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { XCircle, Eye, CalendarDays } from 'lucide-react';
import { PageHeader, StatusBadge, SkeletonLoader, PaginationBar, Modal, ConfirmModal } from '../../component/ui';
import { getMyAppointments, updateAppointmentStatus } from '../../service/appointmentService';

const TABS = [
  { key: '',            label: 'All' },
  { key: 'pending',     label: 'Pending' },
  { key: 'confirmed',   label: 'Confirmed' },
  { key: 'completed',   label: 'Completed' },
  { key: 'cancelled',   label: 'Cancelled' },
];

export default function PatientAppointments() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView]             = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page: String(page), per_page: '10' };
    if (tab) params.status = tab;
    const res = await getMyAppointments(params);
    if (res.status === 'success') { setItems(res.data?.appointments || []); setTotalPages(res.data?.pagination?.total_pages ?? 1); }
    setLoading(false);
  }, [page, tab]);
  useEffect(() => { load(); }, [load]);

  const confirmCancel = async () => {
    setCancelling(true);
    const res = await updateAppointmentStatus(confirmId, 'cancelled', 'Cancelled by patient');
    setCancelling(false);
    setConfirmId(null);
    if (res.status === 'success') { toast.success('Appointment cancelled.'); load(); }
    else toast.error(res.message);
  };

  return (
    <div className="mc-page">
      <PageHeader title="My Appointments" subtitle="Track all your appointment bookings" />

      <ul className="nav nav-pills mb-4 flex-wrap gap-1">
        {TABS.map(t => (
          <li key={t.key} className="nav-item">
            <button className={`nav-link ${tab === t.key ? 'active' : ''}`} style={{ fontSize: '0.82rem', padding: '5px 14px' }}
              onClick={() => { setTab(t.key); setPage(1); }}>{t.label}</button>
          </li>
        ))}
      </ul>

      {loading ? <SkeletonLoader count={4} height={100} /> : items.length === 0
        ? (
          <div className="text-center py-5" style={{ color: 'var(--mc-text-muted)' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>No appointments found.</p>
            <a href="/patient/book-appointment" className="btn btn-primary btn-sm">Book Appointment</a>
          </div>
        )
        : (
          <>
            <div className="row g-3 mb-3">
              {items.map(a => (
                <div key={a.id} className="col-12">
                  <div className="card p-3">
                    <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                      <div className="d-flex gap-3 align-items-start">
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--mc-accent-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(139,30,30,0.15)' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--mc-font-heading)', color: 'var(--mc-accent)', lineHeight: 1 }}>{a.appointment_date?.slice(8, 10)}</span>
                          <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--mc-accent)', fontWeight: 700 }}>{monthAbbr(a.appointment_date)}</span>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.95rem' }}>Dr. {a.doctor_name}</p>
                          <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--mc-text-muted)' }}>{a.department_name || 'General'} · {a.appointment_time}</p>
                          {a.reason && <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--mc-text-secondary)' }}>{a.reason}</p>}
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-2">
                        <StatusBadge status={a.status} />
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" style={{ fontSize: '0.76rem', padding: '3px 10px' }} onClick={() => setView(a)}>
                            <Eye size={12} /> Details
                          </button>
                          {['pending', 'confirmed'].includes(a.status) && (
                            <button className="btn btn-sm d-flex align-items-center gap-1" style={{ fontSize: '0.76rem', padding: '3px 10px', background: 'var(--mc-danger-bg)', color: 'var(--mc-danger)', border: 'none' }} onClick={() => setConfirmId(a.id)}>
                              <XCircle size={12} /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )
      }

      <Modal show={!!view} onClose={() => setView(null)} title="Appointment Details" description={view ? `Dr. ${view.doctor_name} · ${view.appointment_date}` : ''} icon={CalendarDays}>
        {view && (
          <>
            <div className="modal-body">
              {[['Doctor', view.doctor_name], ['Department', view.department_name], ['Date', view.appointment_date], ['Time', view.appointment_time], ['Status', view.status], ['Reason', view.reason], ['Notes', view.notes]].map(([k, v]) => v && (
                <div key={k} className="d-flex gap-3 mb-2">
                  <span style={{ width: 100, flexShrink: 0, fontSize: '0.76rem', color: 'var(--mc-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{k}</span>
                  <span style={{ fontSize: '0.88rem', textTransform: k === 'Status' ? 'capitalize' : 'none' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setView(null)}>Close</button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmModal
        show={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={confirmCancel}
        loading={cancelling}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be reversed."
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep It"
      />
    </div>
  );
}

function monthAbbr(d) {
  if (!d) return '';
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(d.slice(5,7),10)-1] || '';
}


