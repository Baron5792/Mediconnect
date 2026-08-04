import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { PageHeader, SkeletonLoader, Modal, ConfirmModal } from '../../component/ui';
import { createDepartment, deleteDepartment, getAllDepartments, updateDepartment } from '../../service/otherServices';

export default function ManageDepartments() {
  const [depts, setDepts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({ name: '', description: '' });
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAllDepartments();
    if (res.status === 'success') setDepts(res.data?.departments || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const open = (d = null) => { setEditing(d); setForm({ name: d?.name || '', description: d?.description || '' }); setShowModal(true); };

  const save = async (e) => {
    e.preventDefault();
    const res = editing ? await updateDepartment(editing.id, form) : await createDepartment(form);
    if (res.status === 'success') { toast.success(editing ? 'Department updated.' : 'Department added.'); setShowModal(false); load(); }
    else toast.error(res.message || 'Failed.');
  };

  const confirmDelete = async () => {
    setDeleting(true);
    const res = await deleteDepartment(confirmId);
    setDeleting(false);
    setConfirmId(null);
    if (res.status === 'success') { toast.success('Department deleted.'); load(); }
    else toast.error(res.message);
  };

  return (
    <div className="mc-page">
      <PageHeader title="Manage Departments" subtitle="Organise clinical departments" action={<button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => open()}><Plus size={14} />Add Department</button>} />
      <div className="row g-3">
        {loading ? <div className="col-12"><SkeletonLoader count={4} height={80} /></div> : depts.length === 0
          ? <div className="col-12 text-center" style={{ color: 'var(--mc-text-muted)', padding: '3rem' }}>No departments yet.</div>
          : depts.map(d => (
            <div key={d.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card p-3 d-flex flex-row align-items-center gap-3">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--mc-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, color: 'var(--mc-accent)', fontSize: '1.1rem' }}>{d.name.charAt(0)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</p>
                  {d.description && <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--mc-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.description}</p>}
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                  <button className="btn btn-sm btn-outline-secondary" style={{ padding: '3px 8px' }} onClick={() => open(d)}><Pencil size={13} /></button>
                  <button className="btn btn-sm btn-outline-danger" style={{ padding: '3px 8px' }} onClick={() => setConfirmId(d.id)}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Department' : 'New Department'} description={editing ? 'Update department details below.' : 'Add a new clinical department.'} icon={Building2}>
        <form onSubmit={save}>
          <div className="modal-body">
            <div className="mb-3"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Department Name</label><input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        show={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Department"
        message="Are you sure you want to delete this department? Doctors assigned to it will be unlinked."
        confirmLabel="Delete"
      />
    </div>
  );
}
