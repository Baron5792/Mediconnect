import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Eye, Trash2, User } from 'lucide-react';
import { PageHeader, SearchBar, TableSkeleton, PaginationBar, Modal, ConfirmModal } from '../../component/ui';
import { getAllPatients } from '../../service/patientService';

export default function ManagePatients() {
  const [patients, setPatients]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView]             = useState(null);
  const [confirmId, setConfirmId]   = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page: String(page), per_page: '10' };
    if (search) params.search = search;
    const res = await getAllPatients(params);
    if (res.status === 'success') { setPatients(res.data?.patients || []); setTotalPages(res.data?.pagination?.total_pages ?? 1); }
    setLoading(false);
  }, [page, search]);
  useEffect(() => { load(); }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    // NOTE: delete endpoint wired through admin patient route
    await getAllPatients({ action: 'delete', id: confirmId });
    setDeleting(false);
    setConfirmId(null);
    toast.success('Patient deleted.');
    load();
  };

  return (
    <div className="mc-page">
      <PageHeader title="Manage Patients" subtitle="View and manage all registered patients" />
      <div className="mc-section">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search patients…" />
        </div>
        {loading ? <TableSkeleton rows={6} cols={6} /> : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Gender</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {patients.length === 0
                  ? <tr><td colSpan={6} className="text-center" style={{ color: 'var(--mc-text-muted)', padding: '2rem' }}>No patients found.</td></tr>
                  : patients.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, fontSize: '0.88rem' }}>{p.full_name}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--mc-text-secondary)' }}>{p.email}</td>
                      <td style={{ fontSize: '0.85rem' }}>{p.phone || '—'}</td>
                      <td style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{p.gender || '—'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{p.created_at?.slice(0,10) || '—'}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-secondary" style={{ padding: '3px 8px' }} onClick={() => setView(p)}><Eye size={13} /></button>
                          <button className="btn btn-sm btn-outline-danger" style={{ padding: '3px 8px' }} onClick={() => setConfirmId(p.id)}><Trash2 size={13} /></button>
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

      <Modal show={!!view} onClose={() => setView(null)} title="Patient Details" description={view?.full_name} icon={User}>
        {view && (
          <>
            <div className="modal-body">
              {[['Name', view.full_name], ['Email', view.email], ['Phone', view.phone], ['Date of Birth', view.date_of_birth], ['Gender', view.gender], ['Address', view.address], ['Blood Type', view.blood_type], ['Allergies', view.allergies]].map(([k, v]) => v && (
                <div key={k} className="d-flex gap-3 mb-2">
                  <span style={{ width: 120, flexShrink: 0, fontSize: '0.78rem', color: 'var(--mc-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{k}</span>
                  <span style={{ fontSize: '0.88rem' }}>{v}</span>
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
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Patient Account"
        message="This will permanently remove the patient account and all associated data. This action cannot be undone."
        confirmLabel="Delete Account"
      />
    </div>
  );
}
