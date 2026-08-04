import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, SkeletonLoader } from '../../component/ui';
import { getPatientMedicalHistory } from '../../service/doctorService';

export default function PatientMedicalHistory() {
  const [params]    = useSearchParams();
  const patientId   = params.get('patient_id');
  const patientName = params.get('name') || 'Patient';
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    console.log('id: ', patientId)
    if (!patientId) return;
    setLoading(true);
    getPatientMedicalHistory(patientId).then(res => {
      if (res.status === 'success') {
        setRecords(res.data?.medical_records || [])
      };
    }).finally(() => setLoading(false));
  }, [patientId]);

  if (!patientId) return (
    <div className="mc-page">
      <div className="text-center py-5" style={{ color: 'var(--mc-text-muted)' }}>
        <p>No patient selected. Go to <a href="/doctor/patients" style={{ color: 'var(--mc-accent)' }}>My Patients</a> and click History.</p>
      </div>
    </div>
  );

  return (
    <div className="mc-page">
      <PageHeader title={`Medical History`} subtitle={`Viewing records for ${decodeURIComponent(patientName)}`} />
      {loading ? <SkeletonLoader count={4} height={80} /> : records.length === 0
        ? <div className="text-center py-5" style={{ color: 'var(--mc-text-muted)' }}>No medical records found for this patient.</div>
        : (
          <div className="mc-timeline">
            {records.map(r => (
              <div key={r.id} className="mc-timeline-item">
                <div className="mc-timeline-dot" />
                <div className="mc-section">
                  <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem' }}>{r.title}</p>
                    <span style={{ fontSize: '0.78rem', color: 'var(--mc-text-muted)' }}>{r.created_at?.slice(0,10)}</span>
                  </div>
                  {r.diagnosis     && <p style={{ margin: '0 0 4px', fontSize: '0.85rem' }}><strong>Diagnosis:</strong> {r.diagnosis}</p>}
                  {r.treatment     && <p style={{ margin: '0 0 4px', fontSize: '0.85rem' }}><strong>Treatment:</strong> {r.treatment}</p>}
                  {r.prescriptions && <p style={{ margin: '0 0 4px', fontSize: '0.85rem' }}><strong>Prescriptions:</strong> {r.prescriptions}</p>}
                  {r.notes         && <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--mc-text-secondary)' }}>{r.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
