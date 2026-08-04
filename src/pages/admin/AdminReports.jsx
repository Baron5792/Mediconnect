import React, { useState } from 'react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader, SkeletonLoader, TableSkeleton } from '../../component/ui';
import { generateReport } from '../../service/otherServices';

const TYPES = ['appointments', 'doctors', 'patients', 'consultations', 'departments'];

export default function AdminReports() {
  const [type, setType]       = useState('appointments');
  const [from, setFrom]       = useState('');
  const [to, setTo]           = useState('');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async (e) => {
    e.preventDefault();
    if (!from || !to) { toast.error('Please select a date range.'); return; }
    setLoading(true);
    const res = await generateReport(type, from, to);
    if (res.status === 'success') setData(res.data);
    else toast.error(res.message || 'Failed to generate report.');
    setLoading(false);
  };

  return (
    <div className="mc-page">
      <PageHeader title="Reports" subtitle="Generate system reports by date range" />

      <div className="mc-section mb-4">
        <form onSubmit={generate}>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-sm-4 col-md-3">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Report Type</label>
              <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                {TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
            <div className="col-12 col-sm-3 col-md-2">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>From</label>
              <input type="date" className="form-control" value={from} onChange={e => setFrom(e.target.value)} required />
            </div>
            <div className="col-12 col-sm-3 col-md-2">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>To</label>
              <input type="date" className="form-control" value={to} onChange={e => setTo(e.target.value)} required />
            </div>
            <div className="col-12 col-sm-2">
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                {loading ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading && <SkeletonLoader count={6} height={48} />}

      {data && !loading && (
        <>
          {data.chart && (
            <div className="mc-section mb-4">
              <p className="mc-section-title">Chart Overview</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.chart}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--mc-text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--mc-text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--mc-surface)', border: '1px solid var(--mc-border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="var(--mc-accent)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mc-section">
            <p className="mc-section-title">Data — {data.rows?.length ?? 0} records</p>
            {data.rows?.length > 0 ? (
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead><tr>{Object.keys(data.rows[0]).map(k => <th key={k} style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</th>)}</tr></thead>
                  <tbody>
                    {data.rows.map((r, i) => (
                      <tr key={i}>{Object.values(r).map((v, j) => <td key={j} style={{ fontSize: '0.85rem' }}>{String(v ?? '—')}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.88rem' }}>No data for the selected period.</p>}
          </div>
        </>
      )}
    </div>
  );
}
