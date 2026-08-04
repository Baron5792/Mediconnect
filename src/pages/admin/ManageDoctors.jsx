import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, RefreshCw, Stethoscope } from 'lucide-react';
import { PageHeader, SearchBar, TableSkeleton, PaginationBar, StatusBadge, Modal, ConfirmModal, EmptyState } from '../../component/ui';
import { createDoctor, deleteDoctor, getAllDoctors, toggleDoctorStatus, updateDoctor } from '../../service/doctorService';
import { getAllDepartments } from '../../service/otherServices';

const LABEL = { fontSize: '0.82rem', fontWeight: 600 };
const EMPTY_FORM = { full_name:'', email:'', phone:'', password:'', specialization:'', department_id:'', license_number:'', experience_years:'', consultation_fee:'', bio:'' };

function Initials({ name }) {
  const parts = (name || '').trim().split(' ');
  const letters = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--mc-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0, textTransform: 'uppercase' }}>
      {letters || '?'}
    </div>
  );
}

export default function ManageDoctors() {
  const [doctors, setDoctors]       = useState([]);
  const [depts, setDepts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [confirmDoctor, setConfirmDoctor] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page: String(page), per_page: '10' };
    if (search)       params.search        = search;
    if (statusFilter) params.is_active     = statusFilter;
    if (deptFilter)   params.department_id = deptFilter;

    const [dRes, depRes] = await Promise.all([
      getAllDoctors(params),
      getAllDepartments(),
    ]);

    if (dRes.status === 'success') {
      setDoctors(dRes.data?.doctors || []);
      setTotal(dRes.data?.pagination?.total ?? 0);
      setTotalPages(dRes.data?.pagination?.total_pages ?? 1);
    } else {
      toast.error(dRes.message || 'Failed to load doctors.');
    }
    if (depRes.status === 'success') setDepts(depRes.data?.departments || []);
    setLoading(false);
  }, [page, search, statusFilter, deptFilter]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (d) => {
    setEditing(d);
    setForm({
      full_name: d.full_name || '', email: d.email || '', phone: d.phone || '',
      password: '', specialization: d.specialization || '',
      department_id: d.department_id || '', license_number: d.license_number || '',
      experience_years: d.experience_years || '', consultation_fee: d.consultation_fee || '',
      bio: d.bio || '',
    });
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = editing
      ? await updateDoctor(editing.id, form)
      : await createDoctor(form);
    setSaving(false);
    if (res.status === 'success') {
      toast.success(editing ? 'Doctor updated.' : 'Doctor added.');
      setShowModal(false);
      load();
    } else {
      toast.error(res.message || 'Save failed.');
    }
  };

  const toggle = async (id) => {
    const res = await toggleDoctorStatus(id);
    if (res.status === 'success') { toast.success('Status updated.'); load(); }
    else toast.error(res.message || 'Failed.');
  };

  const del = async (d) => {
    setConfirmDoctor(d);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    const res = await deleteDoctor(confirmDoctor.id);
    setDeleting(false);
    setConfirmDoctor(null);
    if (res.status === 'success') { toast.success('Doctor deleted.'); load(); }
    else toast.error(res.message || 'Failed.');
  };

  const resetFilters = () => { setSearch(''); setStatus(''); setDeptFilter(''); setPage(1); };
  const hasFilter = search || statusFilter || deptFilter;

  return (
    <div className="mc-page">
      <PageHeader
        title="Manage Doctors"
        subtitle={`${total} doctor${total !== 1 ? 's' : ''} registered`}
        action={
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={load} title="Refresh">
              <RefreshCw size={13} />
            </button>
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={openAdd}>
              <Plus size={14} /> Add Doctor
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="mc-section mb-3">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search name, specialization, dept…" />

          <select className="form-select form-select-sm" style={{ maxWidth: 160 }} value={statusFilter}
            onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>

          <select className="form-select form-select-sm" style={{ maxWidth: 180 }} value={deptFilter}
            onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
            <option value="">All Departments</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          {hasFilter && (
            <button className="btn btn-sm btn-outline-secondary" onClick={resetFilters}>Clear filters</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="mc-section">
        {loading ? <TableSkeleton rows={6} cols={7} /> : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Fee (GHS)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        icon={<Stethoscope size={32} color="var(--mc-text-muted)" />}
                        title="No doctors found"
                        description={hasFilter ? 'Try clearing your filters.' : 'Add the first doctor using the button above.'}
                      />
                    </td>
                  </tr>
                ) : doctors.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Initials name={d.full_name} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>{d.full_name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--mc-text-muted)' }}>{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{d.specialization || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{d.department_name || '—'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--mc-text-muted)' }}>{d.phone || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{d.consultation_fee ? `${Number(d.consultation_fee).toFixed(2)}` : '—'}</td>
                    <td><StatusBadge status={d.is_active == 1 ? 'active' : 'inactive'} /></td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-secondary" style={{ padding: '3px 8px' }} onClick={() => openEdit(d)} title="Edit"><Pencil size={13} /></button>
                        <button className="btn btn-sm btn-outline-secondary" style={{ padding: '3px 8px' }} onClick={() => toggle(d.id)} title={d.is_active == 1 ? 'Deactivate' : 'Activate'}>
                          {d.is_active == 1 ? <ToggleRight size={13} color="var(--mc-success)" /> : <ToggleLeft size={13} />}
                        </button>
                        <button className="btn btn-sm btn-outline-danger" style={{ padding: '3px 8px' }} onClick={() => del(d)} title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? `Edit Doctor` : 'Add New Doctor'}
        description={editing ? `Updating details for ${editing.full_name}` : 'Fill in the details to register a new doctor.'}
        icon={Stethoscope}
        size="lg"
      >
        <form onSubmit={save}>
          <div className="modal-body">
            <div className="row g-3">
              {/* Basic info */}
              <div className="col-12">
                <label className="form-label" style={LABEL}>Full Name *</label>
                <input className="form-control" value={form.full_name} onChange={f('full_name')} required />
              </div>
              <div className="col-md-6">
                <label className="form-label" style={LABEL}>Email *</label>
                <input type="email" className="form-control" value={form.email} onChange={f('email')} required disabled={!!editing} />
              </div>
              <div className="col-md-6">
                <label className="form-label" style={LABEL}>Phone</label>
                <input className="form-control" value={form.phone} onChange={f('phone')} placeholder="+233 …" />
              </div>

              {/* Professional */}
              <div className="col-12 mc-form-section">
                <p className="mc-form-section-label">Professional Info</p>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" style={LABEL}>Specialization</label>
                    <input className="form-control" value={form.specialization} onChange={f('specialization')} placeholder="e.g. Cardiology" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={LABEL}>Department</label>
                    <select className="form-select" value={form.department_id} onChange={f('department_id')}>
                      <option value="">Select department…</option>
                      {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={LABEL}>License Number</label>
                    <input className="form-control" value={form.license_number} onChange={f('license_number')} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={LABEL}>Experience (yrs)</label>
                    <input type="number" min="0" className="form-control" value={form.experience_years} onChange={f('experience_years')} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={LABEL}>Fee (GHS)</label>
                    <input type="number" min="0" step="0.01" className="form-control" value={form.consultation_fee} onChange={f('consultation_fee')} />
                  </div>
                  <div className="col-12">
                    <label className="form-label" style={LABEL}>Bio</label>
                    <textarea className="form-control" rows={3} value={form.bio} onChange={f('bio')} placeholder="Short professional biography…" />
                  </div>
                </div>
              </div>

              {/* Password — only for new doctors */}
              {!editing && (
                <div className="col-12 mc-form-section">
                  <p className="mc-form-section-label">Account</p>
                  <label className="form-label" style={LABEL}>Password *</label>
                  <input type="password" className="form-control" value={form.password} onChange={f('password')} required minLength={8} placeholder="Min. 8 characters" />
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? 'Saving…' : (editing ? 'Update Doctor' : 'Add Doctor')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        show={!!confirmDoctor}
        onClose={() => setConfirmDoctor(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Doctor"
        message={`Remove Dr. ${confirmDoctor?.full_name} from the system? All their appointments and consultation records will be retained but they will lose access.`}
        confirmLabel="Delete Doctor"
      />
    </div>
  );
}
