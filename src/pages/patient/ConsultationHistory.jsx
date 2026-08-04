import React, { useEffect, useState, useCallback } from 'react';
import { Download, Eye } from 'lucide-react';
import { PageHeader, SkeletonLoader, PaginationBar, Modal } from '../../component/ui';
import { toast } from 'sonner';
import { downloadConsultationSummary, getMyConsultations } from '../../service/consultationService';

export default function ConsultationHistory() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView]             = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getMyConsultations({ page: String(page), per_page: '10' });
    if (res.status === 'success') { setItems(res.data || []); setTotalPages(res.pagination?.total_pages ?? 1); }
    setLoading(false);
  }, [page]);
  useEffect(() => { load(); }, [load]);

  const download = async (id) => {
    try {
      await downloadConsultationSummary(id);
      toast.success('Summary downloaded.');
    } catch { toast.error('Download failed.'); }
  };

  return (
    <div className="mc-page">
      <PageHeader title="Consultation History" subtitle="All your past consultation notes and prescriptions" />

      {loading ? <SkeletonLoader count={4} height={110} /> : items.length === 0
        ? (
          <div className="text-center py-5" style={{ color: 'var(--mc-text-muted)' }}>
            <p>No consultation records yet.</p>
          </div>
        )
        : (
          <>
            {items.map(c => (
              <div key={c.id} className="card p-4 mb-3">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.95rem' }}>Dr. {c.doctor_name}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--mc-text-muted)' }}>{c.created_at?.slice(0, 10)}</p>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }} onClick={() => setView(c)}>
                      <Eye size={12} /> View
                    </button>
                    {/* <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }} onClick={() => download(c.id)}>
                      <Download size={12} /> Summary
                    </button> */}
                  </div>
                </div>

                <div className="row g-3">
                  {[
                    { label: 'Diagnosis',        value: c.diagnosis },
                    { label: 'Prescription',     value: c.prescription },
                    { label: 'Recommendations',  value: c.recommendations },
                  ].map(({ label, value }) => value && (
                    <div key={label} className="col-12 col-md-4">
                      <p style={{ margin: '0 0 2px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mc-text-muted)', fontWeight: 600 }}>{label}</p>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--mc-text)' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )
      }

      <Modal show={!!view} onClose={() => setView(null)} title="Consultation Details" size="lg">
        {view && (
          <>
            <div className="modal-body">
              {[['Doctor', view.doctor_name], ['Date', view.created_at], ['Diagnosis', view.diagnosis], ['Prescription', view.prescription], ['Recommendations', view.recommendations], ['Notes', view.notes]].map(([k, v]) => v && (
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
