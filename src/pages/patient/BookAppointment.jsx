import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Search, ChevronRight, Calendar } from 'lucide-react';
import { PageHeader, SkeletonLoader } from '../../component/ui';
import { createAppointment, getAvailableSlots } from '../../service/appointmentService';
import { getAllDoctors } from '../../service/doctorService';
import { getAllDepartments } from '../../service/otherServices';

const STEPS = ['Select Department', 'Choose Doctor', 'Pick Date & Time', 'Confirm'];

export default function BookAppointment() {
  const [step, setStep]           = useState(0);
  const [depts, setDepts]         = useState([]);
  const [doctors, setDoctors]     = useState([]);
  const [slots, setSlots]         = useState([]);
  const [selectedDept, setSelectedDept]   = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate]   = useState('');
  const [selectedTime, setSelectedTime]   = useState('');
  const [reason, setReason]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Load departments on mount */
  useEffect(() => {
    setLoading(true);
    getAllDepartments().then(res => {
      if (res.status === 'success') setDepts(res.data?.departments || []);
    }).finally(() => setLoading(false));
  }, []);

  /* Load doctors when dept changes */
  useEffect(() => {
    if (!selectedDept) return;
    setLoading(true);
    getAllDoctors({ department_id: selectedDept.id, per_page: '50' }).then(res => {
      if (res.status === 'success') setDoctors(res.data?.doctors || []);
    }).finally(() => setLoading(false));
  }, [selectedDept]);

  /* Load slots when doctor+date changes */
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    getAvailableSlots(selectedDoctor.id, selectedDate).then(res => {
      if (res.status === 'success') setSlots(res.data || []);
    });
  }, [selectedDoctor, selectedDate]);

  const confirm = async () => {
    setSubmitting(true);
    const res = await createAppointment({
      doctor_id: selectedDoctor.id,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      reason,
    });
    if (res.status === 'success') {
      toast.success('Appointment booked! Awaiting doctor confirmation.');
      setStep(0); setSelectedDept(null); setSelectedDoctor(null);
      setSelectedDate(''); setSelectedTime(''); setReason('');
    } else {
      toast.error(res.message || 'Booking failed. Please try again.');
    }
    setSubmitting(false);
  };

  /* Min date = today */
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mc-page">
      <PageHeader title="Book Appointment" subtitle="Find a specialist and reserve your slot" />

      {/* Step indicator */}
      <div className="d-flex align-items-center gap-0 mb-4 flex-wrap">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="d-flex align-items-center gap-2" style={{ cursor: i < step ? 'pointer' : 'default' }} onClick={() => { if (i < step) setStep(i); }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= step ? 'var(--mc-accent)' : 'var(--mc-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: i <= step ? '#fff' : 'var(--mc-text-muted)', fontSize: '0.72rem', fontWeight: 700 }}>{i + 1}</span>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: i === step ? 600 : 400, color: i === step ? 'var(--mc-text)' : 'var(--mc-text-muted)', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ flex: 1, minWidth: 12, height: 1, background: 'var(--mc-border)', margin: '0 8px' }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0 — Department */}
      {step === 0 && (
        <div className="mc-section">
          <p className="mc-section-title">Select a Department</p>
          {loading ? <SkeletonLoader count={6} height={64} /> : (
            <div className="row g-3">
              {depts.map(d => (
                <div key={d.id} className="col-12 col-sm-6 col-lg-4">
                  <div className="card p-3 d-flex flex-row align-items-center gap-3" style={{ cursor: 'pointer', border: selectedDept?.id === d.id ? '2px solid var(--mc-accent)' : '1px solid var(--mc-border)' }}
                    onClick={() => { setSelectedDept(d); setStep(1); }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--mc-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 800, color: 'var(--mc-accent)', fontSize: '1rem' }}>{d.name.charAt(0)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</p>
                      {d.description && <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--mc-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.description}</p>}
                    </div>
                    <ChevronRight size={16} color="var(--mc-text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1 — Doctor */}
      {step === 1 && (
        <div className="mc-section">
          <div className="d-flex align-items-center gap-2 mb-3">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setStep(0)}>← Back</button>
            <p className="mc-section-title mb-0">Choose a Doctor — {selectedDept?.name}</p>
          </div>
          {loading ? <SkeletonLoader count={4} height={80} /> : doctors.length === 0
            ? <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.88rem' }}>No doctors available in this department.</p>
            : (
              <div className="row g-3">
                {doctors.map(d => (
                  <div key={d.id} className="col-12 col-md-6">
                    <div className="card p-3 d-flex flex-row align-items-center gap-3" style={{ cursor: 'pointer', border: selectedDoctor?.id === d.id ? '2px solid var(--mc-accent)' : '1px solid var(--mc-border)' }}
                      onClick={() => { setSelectedDoctor(d); setStep(2); }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{d.full_name.charAt(0)}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '0.9rem' }}>Dr. {d.full_name}</p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--mc-text-muted)' }}>{d.specialization || selectedDept?.name}</p>
                      </div>
                      <ChevronRight size={16} color="var(--mc-text-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}

      {/* Step 2 — Date & Time */}
      {step === 2 && (
        <div className="mc-section" style={{ maxWidth: 480 }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setStep(1)}>← Back</button>
            <p className="mc-section-title mb-0">Pick Date &amp; Time — Dr. {selectedDoctor?.full_name}</p>
          </div>
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Date</label>
            <input type="date" className="form-control" min={today} value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }} />
          </div>
          {selectedDate && (
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Available Time Slots</label>
              {slots.length === 0
                ? (
                  <div>
                    <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>No preset slots for this date. Enter your preferred time:</p>
                    <input
                      type="time"
                      className="form-control"
                      style={{ maxWidth: 180 }}
                      value={selectedTime}
                      onChange={e => setSelectedTime(e.target.value)}
                    />
                  </div>
                )
                : (
                  <div className="d-flex flex-wrap gap-2">
                    {slots.map(s => (
                      <button key={s} onClick={() => setSelectedTime(s)}
                        style={{ padding: '6px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', border: selectedTime === s ? '2px solid var(--mc-accent)' : '1px solid var(--mc-border)', background: selectedTime === s ? 'var(--mc-accent-light)' : 'var(--mc-surface)', color: selectedTime === s ? 'var(--mc-accent)' : 'var(--mc-text)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )
              }
            </div>
          )}
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Reason for Visit <span style={{ fontWeight: 400, color: 'var(--mc-text-muted)' }}>(optional)</span></label>
            <textarea className="form-control" rows={3} placeholder="Describe your symptoms or reason…" value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)}>Continue →</button>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div className="mc-section" style={{ maxWidth: 480 }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setStep(2)}>← Back</button>
            <p className="mc-section-title mb-0">Confirm Your Booking</p>
          </div>
          <div style={{ background: 'var(--mc-muted)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
            {[
              ['Department', selectedDept?.name],
              ['Doctor',     `Dr. ${selectedDoctor?.full_name}`],
              ['Date',       selectedDate],
              ['Time',       selectedTime],
              ['Reason',     reason || '—'],
            ].map(([k, v]) => (
              <div key={k} className="d-flex gap-3 mb-2 align-items-start">
                <span style={{ width: 100, flexShrink: 0, fontSize: '0.78rem', color: 'var(--mc-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{k}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: k === 'Doctor' ? 600 : 400 }}>{v}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary w-100 py-2" disabled={submitting} onClick={confirm}>
            {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : <Calendar size={15} style={{ marginRight: 6 }} />}
            {submitting ? 'Booking…' : 'Confirm Appointment'}
          </button>
        </div>
      )}
    </div>
  );
}
