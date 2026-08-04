import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Save, Plus, Paperclip } from 'lucide-react';
import { PageHeader, SkeletonLoader, Modal } from '../../component/ui';
import { getAppointmentHistory } from '../../service/appointmentService';
import { createConsultation, getDoctorConsultations } from '../../service/consultationService';

export default function ConsultationNotes() {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected]         = useState('');
  const [consultations, setConsultations] = useState([]);
  const [loadingA, setLoadingA]         = useState(true);
  const [loadingC, setLoadingC]         = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [form, setForm] = useState({ diagnosis: '', prescription: '', recommendations: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAppointmentHistory({ status: 'confirmed', per_page: '50' }).then(res => {
      if (res.status === 'success') setAppointments(res.data?.appointments || []);
    }).finally(() => setLoadingA(false));
  }, []);

  useEffect(() => {
    setLoadingC(true);
    getDoctorConsultations({ per_page: '20' }).then(res => {
      if (res.status === 'success') setConsultations(res.data || []);
    }).finally(() => setLoadingC(false));
  }, []);


  const save = async (e) => {
    e.preventDefault();
    if (!selected) { toast.error('Please select a completed appointment.'); return; }
    setSaving(true);
    if (!form.diagnosis && !form.prescription && !form.recommendations && !form.notes) {
      toast.error('Please fill every field to proceed.');
      setSaving(false);
      return;
    }

    const toasterId = toast.loading("Processing...", {id: 'processing'});
    try {
      const res = await createConsultation({ ...form, appointment_id: selected });
        if (res.status === 'success') {
          toast.success('Consultation saved.', {id: toasterId});
          setShowNew(false);
          setForm({ diagnosis: '', prescription: '', recommendations: '', notes: '' });
          getDoctorConsultations({ per_page: '20' }).then(r => { if (r.status === 'success') setConsultations(r.data || []); });
        } else {
          toast.error(res.message || 'Failed.', {id: toasterId});
        };
        setSaving(false);
    }

    catch (e) {
      toast.error(e.message || "Something went wrong", {id: toasterId});
    }
  };

  return (
    <div className="mc-page">
      <PageHeader title="Consultation Notes" subtitle="Record and view patient consultation details" action={<button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => setShowNew(true)}><Plus size={14} />New Consultation</button>} />

      {loadingC ? <SkeletonLoader count={4} height={90} /> : consultations.length === 0
        ? <div className="text-center py-5" style={{ color: 'var(--mc-text-muted)' }}>No consultation notes yet.</div>
        : consultations.map(c => (
          <div key={c.id} className="card p-3 mb-3">
            <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem' }}>{c.patient_name}</p>
              <span style={{ fontSize: '0.78rem', color: 'var(--mc-text-muted)' }}>{c.created_at?.slice(0,10)}</span>
            </div>
            {c.diagnosis     && <p style={{ margin: '0 0 3px', fontSize: '0.85rem' }}><strong>Diagnosis:</strong> {c.diagnosis}</p>}
            {c.prescription  && <p style={{ margin: '0 0 3px', fontSize: '0.85rem' }}><strong>Prescription:</strong> {c.prescription}</p>}
            {c.recommendations && <p style={{ margin: '0 0 3px', fontSize: '0.85rem' }}><strong>Recommendations:</strong> {c.recommendations}</p>}
          </div>
        ))
      }

      <Modal show={showNew} onClose={() => setShowNew(false)} title="New Consultation Note" size="lg" centered className={'centered'}>
        <form onSubmit={save}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Appointment (Completed)</label>
              {loadingA ? <div className="skeleton" style={{ height: 38 }} /> : (
                <select className="form-select" value={selected} onChange={e => setSelected(e.target.value)} required>
                  <option value="">Select appointment…</option>
                  {appointments.map(a => <option key={a.id} value={a.id}>{a.patient_name} — {a.appointment_date} {a.appointment_time}</option>)}
                </select>
              )}
            </div>
            <div className="mb-3"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Diagnosis</label><textarea className="form-control" rows={2} value={form.diagnosis} onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))} /></div>
            <div className="mb-3"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Prescription</label><textarea className="form-control" rows={2} value={form.prescription} onChange={e => setForm(p => ({ ...p, prescription: e.target.value }))} /></div>
            <div className="mb-3"><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Recommendations</label><textarea className="form-control" rows={2} value={form.recommendations} onChange={e => setForm(p => ({ ...p, recommendations: e.target.value }))} /></div>
            <div><label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Additional Notes</label><textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowNew(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm d-flex align-items-center gap-1" disabled={saving}><Save size={13} />{saving ? 'Saving…' : 'Complete Consultation'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
