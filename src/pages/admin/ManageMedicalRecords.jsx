import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader, SearchBar, TableSkeleton, PaginationBar, Modal } from '../../component/ui';
import { getAllMedicalRecords } from '../../service/otherServices';

export default function ManageMedicalRecords() {
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
    const res = await getAllMedicalRecords(params);
    if (res.status === 'success') { setItems(res.data?.records || []); setTotalPages(res.data?.pagination?.total_pages ?? 1); }
    setLoading(false);
  }, [page, search]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="mc-page">
      <PageHeader title="Medical Records" subtitle="View all patient medical records" />
      <div className="mc-section">
        <div className="mb-3"><SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by patient…" /></div>
        {loading ? <TableSkeleton rows={6} cols={5} /> : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>#</th><th>Patient</th><th>Title</th><th>Type</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {items.length === 0
                  ? <tr><td colSpan={6} className="text-center" style={{ color: 'var(--mc-text-muted)', padding: '2rem' }}>No records found.</td></tr>
                  : items.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontSize: '0.82rem', color: 'var(--mc-text-muted)' }}>#{r.id}</td>
                      <td style={{ fontWeight: 500, fontSize: '0.88rem' }}>{r.patient_name}</td>
                      <td style={{ fontSize: '0.85rem' }}>{r.title}</td>
                      <td style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{r.record_type}</td>
                      <td style={{ fontSize: '0.85rem' }}>{r.created_at?.slice(0,10)}</td>
                      <td><button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.72rem', padding: '3px 8px' }} onClick={() => setView(r)}>View</button></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
        <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <Modal show={!!view} onClose={() => setView(null)} title="Medical Record">
        {view && (
          <>
            <div className="modal-body">
              {[['Patient', view.patient_name], ['Doctor', view.doctor_name], ['Title', view.title], ['Type', view.record_type], ['Diagnosis', view.diagnosis], ['Treatment', view.treatment], ['Prescriptions', view.prescriptions], ['Notes', view.notes]].map(([k, v]) => v && (
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
