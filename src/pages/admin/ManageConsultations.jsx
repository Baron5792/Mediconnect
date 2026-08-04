import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader, SearchBar, TableSkeleton, PaginationBar, Modal } from '../../component/ui';
import { getAllConsultations } from '../../service/consultationService';

export default function ManageConsultations() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages]= useState(1);
  const [view, setView]           = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page: String(page), per_page: '10' };
    if (search) params.search = search;
    const res = await getAllConsultations(params);
    if (res.status === 'success') { setItems(res.data?.consultations || []); setTotalPages(res.data?.pagination?.total_pages ?? 1); }
    setLoading(false);
  }, [page, search]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="mc-page">
      <PageHeader title="Manage Consultations" subtitle="View all consultation records" />
      <div className="mc-section">
        <div className="mb-3"><SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by patient or doctor…" /></div>
        {loading ? <TableSkeleton rows={6} cols={5} /> : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>#</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Diagnosis</th><th>Action</th></tr></thead>
              <tbody>
                {items.length === 0
                  ? <tr><td colSpan={6} className="text-center" style={{ color: 'var(--mc-text-muted)', padding: '2rem' }}>No consultations found.</td></tr>
                  : items.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontSize: '0.82rem', color: 'var(--mc-text-muted)' }}>#{c.id}</td>
                      <td style={{ fontWeight: 500, fontSize: '0.88rem' }}>{c.patient_name}</td>
                      <td style={{ fontSize: '0.85rem' }}>{c.doctor_name}</td>
                      <td style={{ fontSize: '0.85rem' }}>{c.created_at?.slice(0,10)}</td>
                      <td style={{ fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.diagnosis || '—'}</td>
                      <td><button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.72rem', padding: '3px 8px' }} onClick={() => setView(c)}>View</button></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
        <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal show={!!view} onClose={() => setView(null)} title="Consultation Details" size="lg">
        {view && (
          <>
            <div className="modal-body">
              {[['Patient', view.patient_name], ['Doctor', view.doctor_name], ['Date', view.created_at], ['Diagnosis', view.diagnosis], ['Prescription', view.prescription], ['Recommendations', view.recommendations], ['Notes', view.notes]].map(([k, v]) => v && (
                <div key={k} className="mb-3">
                  <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: 'var(--mc-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</p>
                  <p style={{ margin: 0, fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>{v}</p>
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
