import React, { useEffect, useState } from 'react';
import { Calendar, Users, Stethoscope, ClipboardList } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader, StatCard, StatusBadge, SkeletonLoader } from '../../component/ui';
import { getAllAppointments } from '../../service/appointmentService';
import { getAllActivityLogs, generateReport } from '../../service/otherServices';

const MOCK_CHART = [
  { month: 'Jan', appointments: 32, consultations: 18 },
  { month: 'Feb', appointments: 41, consultations: 24 },
  { month: 'Mar', appointments: 38, consultations: 28 },
  { month: 'Apr', appointments: 55, consultations: 35 },
  { month: 'May', appointments: 62, consultations: 40 },
  { month: 'Jun', appointments: 71, consultations: 52 },
  { month: 'Jul', appointments: 68, consultations: 48 },
];

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [recent, setRecent]   = useState([]);
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const yearStart = new Date().getFullYear() + '-01-01';
    const today     = new Date().toISOString().slice(0, 10);

    Promise.all([
      generateReport('overview', yearStart, today),
      getAllAppointments({ per_page: '5' }),
      getAllActivityLogs({ per_page: '8' }),
    ]).then(([rRes, aRes, lRes]) => {
      if (rRes.status === 'success') {
        const d = rRes.data?.data ?? {};
        setStats({
          doctors:       d.doctors?.total       ?? 0,
          patients:      d.patients?.total       ?? 0,
          appointments:  d.appointments?.total   ?? 0,
          consultations: d.consultations?.total  ?? 0,
        });
      }
      if (aRes.status === 'success') setRecent(aRes.data?.appointments || []);
      if (lRes.status === 'success') setLogs(lRes.data?.logs || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mc-page">
      <PageHeader title="Admin Dashboard" subtitle="System overview and key metrics" />

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { title: 'Total Doctors',  value: stats?.doctors,       icon: Stethoscope,   color: 'var(--mc-accent)' },
          { title: 'Total Patients', value: stats?.patients,      icon: Users,         color: '#1d4ed8' },
          { title: 'Appointments',   value: stats?.appointments,  icon: Calendar,      color: '#b45309' },
          { title: 'Consultations',  value: stats?.consultations, icon: ClipboardList, color: '#15803d' },
        ].map(c => (
          <div key={c.title} className="col-6 col-lg-3">
            <StatCard {...c} loading={loading} />
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        {/* Area chart */}
        <div className="col-12 col-lg-8">
          <div className="mc-section">
            <p className="mc-section-title">Appointments vs Consultations — {new Date().getFullYear()}</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_CHART}>
                <defs>
                  <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B1E1E" stopOpacity={0.18}/><stop offset="95%" stopColor="#8B1E1E" stopOpacity={0}/></linearGradient>
                  <linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15}/><stop offset="95%" stopColor="#1d4ed8" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--mc-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--mc-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--mc-surface)', border: '1px solid var(--mc-border)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="appointments"  stroke="#8B1E1E" fill="url(#ca)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="consultations" stroke="#1d4ed8" fill="url(#cb)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="d-flex gap-4 mt-2" style={{ fontSize: '0.75rem', color: 'var(--mc-text-muted)' }}>
              <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#8B1E1E', marginRight:4 }} />Appointments</span>
              <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#1d4ed8', marginRight:4 }} />Consultations</span>
            </div>
          </div>
        </div>

        {/* Activity log */}
        <div className="col-12 col-lg-4">
          <div className="mc-section h-100">
            <p className="mc-section-title">Recent Activity</p>
            {loading ? <SkeletonLoader count={5} height={36} /> : logs.length === 0
              ? <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.83rem' }}>No recent activity.</p>
              : logs.slice(0, 6).map((l, i) => (
                <div key={i} className="d-flex gap-2 align-items-start mb-2">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mc-accent)', marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '0.8rem' }}>{l.description || l.action}</p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--mc-text-muted)' }}>{l.created_at}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Recent appointments */}
      <div className="mc-section">
        <p className="mc-section-title">Recent Appointments</p>
        {loading ? <SkeletonLoader count={4} height={40} /> : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {recent.length === 0
                  ? <tr><td colSpan={5} className="text-center" style={{ color: 'var(--mc-text-muted)', padding: '2rem' }}>No appointments found.</td></tr>
                  : recent.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500, fontSize: '0.88rem' }}>{a.patient_name}</td>
                      <td style={{ fontSize: '0.88rem' }}>{a.doctor_name}</td>
                      <td style={{ fontSize: '0.88rem' }}>{a.appointment_date}</td>
                      <td style={{ fontSize: '0.88rem' }}>{a.appointment_time}</td>
                      <td><StatusBadge status={a.status} /></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


