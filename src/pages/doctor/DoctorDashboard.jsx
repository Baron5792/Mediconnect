import React, { useEffect, useState } from 'react';
import { Calendar, Users, ClipboardList, Clock, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader, StatCard, StatusBadge, SkeletonLoader } from '../../component/ui';
import { useAuth } from '../../context/AuthContext';
import { getStats, getTodayAppointments } from '../../service/appointmentService';

const MOCK = [
  { day: 'Mon', count: 4 }, { day: 'Tue', count: 7 }, { day: 'Wed', count: 5 },
  { day: 'Thu', count: 9 }, { day: 'Fri', count: 6 }, { day: 'Sat', count: 2 }, { day: 'Sun', count: 1 },
];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [today, setToday]     = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    Promise.all([
      getStats(),
      getTodayAppointments(),
    ]).then(([sRes, tRes]) => {
      if (sRes.status === 'success') {
        setStats(sRes.data);
      }

      if (tRes.status === 'success') {
        setToday(tRes.data || []);
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.title = `Dashboard - ${import.meta.env.VITE_APP_NAME}`;
  }, [])

  console.log("Stats: ", stats);

  return (
    <div className="mc-page">
      <PageHeader title={`Good ${hour()}, Dr. ${user?.full_name?.split(' ')[0] ?? 'Doctor'}`} subtitle="Here's your schedule overview" />

      <div className="row g-3 mb-4">
        {[
          { title: "Today's Appointments", value: stats?.today,        icon: Clock,        color: 'var(--mc-accent)' },
          { title: 'Upcoming',             value: stats?.upcoming,     icon: Calendar,     color: '#1d4ed8' },
          { title: 'Total Patients',       value: stats?.total_patients, icon: Users,      color: '#15803d' },
          { title: 'Consultations',        value: stats?.total_consultations, icon: ClipboardList, color: '#b45309' },
        ].map(c => (
          <div key={c.title} className="col-6 col-lg-3">
            <StatCard {...c} loading={loading} />
          </div>
        ))}
      </div>

      <div className="row g-3">
        {/* Weekly chart */}
        <div className="col-12 col-lg-5">
          <div className="mc-section h-100">
            <p className="mc-section-title">Appointments This Week</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={MOCK}>
                <defs>
                  <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--mc-accent)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--mc-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--mc-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--mc-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--mc-surface)', border: '1px solid var(--mc-border)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="var(--mc-accent)" fill="url(#dg)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's list */}
        <div className="col-12 col-lg-7">
          <div className="mc-section">
            <p className="mc-section-title">Today's Schedule</p>
            {loading ? <SkeletonLoader count={4} height={52} /> : today.length === 0
              ? <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.85rem' }}>No appointments scheduled for today.</p>
              : today.map(a => (
                <div key={a.id} className="d-flex align-items-center gap-3 p-2 mb-1" style={{ borderRadius: 8, background: 'var(--mc-muted)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--mc-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--mc-border)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--mc-accent)' }}>{a.appointment_time?.slice(0,5)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>{a.patient_name}</p>
                    <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--mc-text-muted)' }}>{a.reason || 'General consultation'}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function hour() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
