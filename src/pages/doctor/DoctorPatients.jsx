import React, { useEffect, useState, useCallback } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, SearchBar, TableSkeleton, PaginationBar } from '../../component/ui';
import { getDoctorPatients } from '../../service/doctorService';

export default function DoctorPatients() {
  const [patients, setPatients]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages]= useState(1);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page: String(page), per_page: '10' };
    if (search) params.search = search;
    const res = await getDoctorPatients(params);
    if (res.status === 'success') { setPatients(res.data?.patients || []); setTotalPages(res.data?.pagination?.total_pages ?? 1); }
    setLoading(false);
  }, [page, search]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="mc-page">
      <PageHeader title="My Patients" subtitle="Patients who have had appointments with you" />
      <div className="mc-section">
        <div className="mb-3"><SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search patients…" /></div>
        {loading ? <TableSkeleton rows={6} cols={5} /> : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Last Visit</th><th>Total Visits</th><th>Action</th></tr></thead>
              <tbody>
                {patients.length === 0
                  ? <tr><td colSpan={6} className="text-center" style={{ color: 'var(--mc-text-muted)', padding: '2rem' }}>No patients found.</td></tr>
                  : patients.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, fontSize: '0.88rem' }}>{p.full_name}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--mc-text-secondary)' }}>{p.email}</td>
                      <td style={{ fontSize: '0.85rem' }}>{p.phone || '—'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{p.last_visit || '—'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{p.total_visits ?? 0}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" style={{ fontSize: '0.78rem', padding: '3px 8px' }} onClick={() => navigate(`/doctor/patient-history?patient_id=${p.id}&name=${encodeURIComponent(p.full_name)}`)}>
                          <Eye size={12} />History
                        </button>
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
    </div>
  );
}
