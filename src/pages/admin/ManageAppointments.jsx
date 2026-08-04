import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader, SearchBar, TableSkeleton, PaginationBar, StatusBadge, Modal, ConfirmModal } from '../../component/ui';
import { CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { getAllAppointments, updateAppointmentStatus } from '../../service/appointmentService';

export default function ManageAppointments() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [status, setStatus]         = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView]             = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page: String(page), per_page: '10' };
    if (search) params.search = search;
    if (status) params.status = status;
    const res = await getAllAppointments(params);
    if (res.status === 'success') { setItems(res.data?.appointments || []); setTotalPages(res.data?.pagination?.total_pages ?? 1); }
    setLoading(false);
  }, [page, search, status]);
  useEffect(() => { load(); }, [load]);

  const confirmCancel = async () => {
    setCancelling(true);
    const res = await updateAppointmentStatus(confirmId, 'cancelled', 'Cancelled by admin');
    setCancelling(false);
    setConfirmId(null);
    if (res.status === 'success') { toast.success('Appointment cancelled.'); load(); }
    else toast.error(res.message);
  };

  return (
    <div className="mc-page">
      <PageHeader title="Manage Appointments" subtitle="View and manage all system appointments" />
      <div className="mc-section">
        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search patient or doctor…" />
          <select className="form-select form-select-sm" style={{ width: 160 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {['pending','confirmed','completed','cancelled','rejected'].map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
        {loading ? <TableSkeleton rows={6} cols={7} /> : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>#</th><th>Patient</th><th>Doctor</th><th>Department</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {items.length === 0
                  ? <tr><td colSpan={7} className="text-center" style={{ color: 'var(--mc-text-muted)', padding: '2rem' }}>No appointments found.</td></tr>
                  : items.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontSize: '0.82rem', color: 'var(--mc-text-muted)' }}>#{a.id}</td>
                      <td style={{ fontWeight: 500, fontSize: '0.88rem' }}>{a.patient_name}</td>
                      <td style={{ fontSize: '0.85rem' }}>{a.doctor_name}</td>
                      <td style={{ fontSize: '0.85rem' }}>{a.department_name || '—'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{a.appointment_date} {a.appointment_time}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.72rem', padding: '3px 8px' }} onClick={() => setView(a)}>View</button>
                          {['pending','confirmed'].includes(a.status) && <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '0.72rem', padding: '3px 8px' }} onClick={() => setConfirmId(a.id)}>Cancel</button>}
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
        <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal show={!!view} onClose={() => setView(null)} title="Appointment Details" description={view ? `${view.patient_name} with ${view.doctor_name}` : ''} icon={CalendarDays}>
        {view && (
          <>
            <div className="modal-body">
              {[['Patient', view.patient_name], ['Doctor', view.doctor_name], ['Department', view.department_name], ['Date', view.appointment_date], ['Time', view.appointment_time], ['Status', view.status], ['Reason', view.reason], ['Notes', view.notes]].map(([k, v]) => v && (
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
        message="Are you sure you want to cancel this appointment? The patient and doctor will be notified."
        confirmLabel="Yes, Cancel It"
        cancelLabel="Keep Appointment"
      />
    </div>
  );
}
