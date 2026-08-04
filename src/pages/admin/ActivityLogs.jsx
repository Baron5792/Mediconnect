import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader, SkeletonLoader } from '../../component/ui';
import { getAllActivityLogs } from '../../service/otherServices';

export default function ActivityLogs() {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const PER = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const params = { page: String(page), per_page: String(PER) };
    if (search) params.search = search;
    const res = await getAllActivityLogs(params);
    if (res.status === 'success') setLogs(res.data?.logs || []);
    setLoading(false);
  }, [page, search]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="mc-page">
      <PageHeader title="Activity Logs" subtitle="Track all user actions in the system" />
      <div className="mc-section">
        <div className="mb-3">
          <input type="search" className="form-control" style={{ maxWidth: 280 }} placeholder="Search logs…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {loading ? <SkeletonLoader count={10} height={44} /> : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>User</th><th>Action</th><th>Description</th><th>IP</th><th>Time</th></tr></thead>
              <tbody>
                {logs.length === 0
                  ? <tr><td colSpan={5} className="text-center" style={{ color: 'var(--mc-text-muted)', padding: '2rem' }}>No logs found.</td></tr>
                  : logs.map((l, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>{l.user_name || `User #${l.user_id}`}</td>
                      <td><span className="badge" style={{ background: 'var(--mc-accent-light)', color: 'var(--mc-accent)', padding: '4px 8px' }}>{l.action}</span></td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--mc-text-secondary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.description}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--mc-text-muted)' }}>{l.ip_address || '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--mc-text-muted)', whiteSpace: 'nowrap' }}>{l.created_at}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <p style={{ fontSize: '0.8rem', color: 'var(--mc-text-muted)', margin: 0 }}>Page {page}</p>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
            <button className="btn btn-sm btn-outline-secondary" disabled={logs.length < PER} onClick={() => setPage(p => p + 1)}>Next ›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
