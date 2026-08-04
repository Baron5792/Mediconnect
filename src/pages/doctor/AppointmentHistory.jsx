import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader, SearchBar, StatusBadge, TableSkeleton, PaginationBar } from '../../component/ui';
import { getAppointmentHistory } from '../../service/appointmentService';

export default function AppointmentHistory() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages]= useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: String(page), per_page: '10' };
      if (search) params.search = search;
      const res = await getAppointmentHistory(params);
      if (res.status === 'success') { 
          setItems(res.data?.appointments || []); 
          setTotalPages(res.data?.pagination?.total_pages ?? 1); 
      }
      
      setLoading(false);
    }

    catch (error) {
      console.log(error || 'Something went wrong');
    }
  }, [page, search]);
  useEffect(() => { load();  document.title = `Appointment History - ${import.meta.env.VITE_APP_NAME}` }, [load]);

  return (
    <div className="mc-page">
      <PageHeader title="Appointment History" subtitle="All past appointments" />
      <div className="mc-section">
        <div className="mb-3"><SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search patient name…" /></div>
        {loading ? <TableSkeleton rows={6} cols={5} /> : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead>
              <tbody>
                {items.length === 0
                  ? <tr><td colSpan={5} className="text-center" style={{ color: 'var(--mc-text-muted)', padding: '2rem' }}>No history found.</td></tr>
                  : items.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500, fontSize: '0.88rem' }}>{a.patient_name}</td>
                      <td style={{ fontSize: '0.85rem' }}>{a.appointment_date}</td>
                      <td style={{ fontSize: '0.85rem' }}>{a.appointment_time}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--mc-text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason || '—'}</td>
                      <td><StatusBadge status={a.status} /></td>
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
