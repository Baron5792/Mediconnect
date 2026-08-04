import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';
import { PageHeader, StatusBadge, TableSkeleton, PaginationBar } from '../../component/ui';
import { getUpcomingAppointments, updateAppointmentStatus } from '../../service/appointmentService';

export default function UpcomingAppointments() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages]= useState(1);
  const [from, setFrom]           = useState('');
  const [to, setTo]               = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page: String(page), per_page: '10' };
    if (from) params.from = from;
    if (to)   params.to   = to;
    const res = await getUpcomingAppointments(params);
    if (res.status === 'success') { setItems(res.data || []); setTotalPages(res.pagination?.total_pages ?? 1); }
    setLoading(false);
  }, [page, from, to]);
  useEffect(() => { load(); }, [load]);

  const action = async (id, status) => {
    const toaterId = toast.loading('Processing', {id: 'process'});
    const res = await updateAppointmentStatus(id, status);
    if (res.status === 'success') { 
      toast.success(`Appointment ${status}.`, {id: toaterId}); load();
    }

    else toast.error(res.message, {id: toaterId});
  };

  return (
    <div className="mc-page">
      <PageHeader title="Upcoming Appointments" subtitle="Future confirmed and pending appointments" />
      <div className="mc-section">
        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <label style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>From</label>
            <input type="date" className="form-control form-control-sm" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 150 }} />
          </div>
          <div className="d-flex align-items-center gap-2">
            <label style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>To</label>
            <input type="date" className="form-control form-control-sm" value={to} onChange={e => setTo(e.target.value)} style={{ width: 150 }} />
          </div>
        </div>
        {loading ? <TableSkeleton rows={6} cols={5} /> : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {items.length === 0
                  ? <tr><td colSpan={6} className="text-center" style={{ color: 'var(--mc-text-muted)', padding: '2rem' }}>No upcoming appointments.</td></tr>
                  : items.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500, fontSize: '0.88rem' }}>{a.patient_name}</td>
                      <td style={{ fontSize: '0.85rem' }}>{a.appointment_date}</td>
                      <td style={{ fontSize: '0.85rem' }}>{a.appointment_time}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--mc-text-secondary)' }}>{a.reason || '—'}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td>
                        <div className="d-flex gap-1">
                          {a.status === 'pending' && <>
                            <button className="btn btn-sm" style={{ background: 'var(--mc-success-bg)', color: 'var(--mc-success)', border: 'none', fontSize: '0.72rem', padding: '3px 8px' }} onClick={() => action(a.id, 'confirmed')}><CheckCircle size={12} /></button>
                            <button className="btn btn-sm" style={{ background: 'var(--mc-danger-bg)', color: 'var(--mc-danger)', border: 'none', fontSize: '0.72rem', padding: '3px 8px' }} onClick={() => action(a.id, 'rejected')}><XCircle size={12} /></button>
                          </>}
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
    </div>
  );
}
