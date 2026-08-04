import React, { useEffect, useState, useCallback } from 'react';
import { Eye, FileText } from 'lucide-react';
import { PageHeader, SkeletonLoader, PaginationBar, Modal } from '../../component/ui';
import { getMyMedicalRecords } from '../../service/patientService';

export default function PatientMedicalRecords() {
  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView]             = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getMyMedicalRecords({ page: String(page), per_page: '10' });
    if (res.status === 'success') { setRecords(res.data || []); setTotalPages(res.pagination?.total_pages ?? 1); }
    setLoading(false);
  }, [page]);
  useEffect(() => { load(); }, [load]);

  const TYPE_COLORS = { lab: '#1d4ed8', diagnosis: 'var(--mc-accent)', prescription: '#15803d', imaging: '#7e22ce', other: '#b45309' };

  return (
    <div className="mc-page">
      <PageHeader title="Medical Records" subtitle="Your complete health history" />

      {loading ? <SkeletonLoader count={4} height={90} /> : records.length === 0
        ? (
          <div className="text-center py-5" style={{ color: 'var(--mc-text-muted)' }}>
            <FileText size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p>No medical records yet.</p>
          </div>
        )
        : (
          <>
            <div className="row g-3 mb-3">
              {records.map(r => {
                const color = TYPE_COLORS[r.record_type] || TYPE_COLORS.other;
                return (
                  <div key={r.id} className="col-12 col-md-6">
                    <div className="card p-3 h-100" style={{ borderLeft: `4px solid ${color}` }}>
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                          <p style={{ margin: '0 0 6px', fontSize: '0.76rem', color: 'var(--mc-text-muted)' }}>
                            <span style={{ background: color + '18', color, padding: '2px 8px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize', marginRight: 6 }}>{r.record_type}</span>
                            {r.created_at?.slice(0, 10)}
                          </p>
                          {r.diagnosis && <p style={{ margin: '0 0 2px', fontSize: '0.83rem' }}><strong>Diagnosis:</strong> {r.diagnosis}</p>}
                          {r.treatment  && <p style={{ margin: 0, fontSize: '0.83rem' }}><strong>Treatment:</strong> {r.treatment}</p>}
                        </div>
                        <button className="btn btn-sm btn-outline-secondary" style={{ padding: '4px 10px', flexShrink: 0 }} onClick={() => setView(r)}>
                          <Eye size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )
      }

      <Modal show={!!view} onClose={() => setView(null)} title="Medical Record" size="lg">
        {view && (
          <>
            <div className="modal-body">
              {[['Title', view.title], ['Type', view.record_type], ['Doctor', view.doctor_name], ['Date', view.created_at], ['Diagnosis', view.diagnosis], ['Treatment', view.treatment], ['Prescriptions', view.prescriptions], ['Notes', view.notes]].map(([k, v]) => v && (
                <div key={k} className="mb-3">
                  <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: 'var(--mc-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</p>
                  <p style={{ margin: 0, fontSize: '0.88rem', textTransform: k === 'Type' ? 'capitalize' : 'none', whiteSpace: 'pre-wrap' }}>{v}</p>
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
