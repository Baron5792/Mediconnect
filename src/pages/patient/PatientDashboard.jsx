import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ClipboardList, FileText, Bell, Plus, Clock, CheckCircle } from 'lucide-react';
import { PageHeader, StatCard, StatusBadge, SkeletonLoader } from '../../component/ui';
import { useAuth } from '../../context/AuthContext';
import { getStats, getUpcomingAppointments } from '../../service/appointmentService';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStats(),
      getUpcomingAppointments({ per_page: '4' }),
    ]).then(([sRes, uRes]) => {
      if (sRes.status === 'success') setStats(sRes.data);
      if (uRes.status === 'success') setUpcoming(uRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mc-page">
      <PageHeader
        title={`Hello, ${user?.full_name?.split(' ')[0] ?? 'there'} 👋`}
        subtitle="Here's a summary of your health activities"
        action={
          <Link to="/patient/book-appointment" className="btn btn-primary btn-sm d-flex align-items-center gap-1">
            <Plus size={14} /> Book Appointment
          </Link>
        }
      />

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { title: 'Total Appointments',  value: stats?.total_appointments,  icon: Calendar,       color: 'var(--mc-accent)' },
          { title: 'Upcoming',            value: stats?.upcoming,            icon: Clock,          color: '#1d4ed8' },
          { title: 'Consultations',       value: stats?.total_consultations, icon: ClipboardList,  color: '#15803d' },
          { title: 'Medical Records',     value: stats?.total_records,       icon: FileText,       color: '#b45309' },
        ].map(c => (
          <div key={c.title} className="col-6 col-lg-3">
            <StatCard {...c} loading={loading} />
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="row g-3 mb-4">
        {[
          { to: '/patient/book-appointment', icon: Calendar,     color: 'var(--mc-accent)',  label: 'Book Appointment',   desc: 'Schedule with a doctor' },
          { to: '/patient/appointments',     icon: Clock,        color: '#1d4ed8',            label: 'My Appointments',    desc: 'View & manage bookings' },
          { to: '/patient/consultations',    icon: ClipboardList,color: '#15803d',            label: 'Consultations',      desc: 'Past consultation notes' },
          { to: '/patient/medical-records',  icon: FileText,     color: '#b45309',            label: 'Medical Records',    desc: 'Your health history' },
        ].map(({ to, icon: Icon, color, label, desc }) => (
          <div key={to} className="col-6 col-lg-3">
            <Link to={to} className="card p-3 d-flex flex-row align-items-center gap-3 text-decoration-none" style={{ transition: 'var(--mc-transition)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={color} strokeWidth={1.8} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: '0 0 1px', fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--mc-text-muted)' }}>{desc}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Upcoming appointments */}
      <div className="mc-section">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mc-section-title mb-0">Upcoming Appointments</p>
          <Link to="/patient/appointments" style={{ fontSize: '0.8rem', color: 'var(--mc-accent)' }}>View all</Link>
        </div>
        {loading ? <SkeletonLoader count={3} height={70} /> : upcoming.length === 0
          ? (
            <div className="text-center py-4">
              <p style={{ color: 'var(--mc-text-muted)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>No upcoming appointments.</p>
              <Link to="/patient/book-appointment" className="btn btn-primary btn-sm">Book Now</Link>
            </div>
          )
          : upcoming.map(a => (
            <div key={a.id} className="d-flex align-items-center gap-3 p-3 mb-2" style={{ borderRadius: 10, background: 'var(--mc-muted)', border: '1px solid var(--mc-border)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--mc-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--mc-border)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--mc-accent)', lineHeight: 1 }}>{a.appointment_date?.slice(8, 10)}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--mc-text-muted)', textTransform: 'uppercase' }}>{monthAbbr(a.appointment_date)}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '0.88rem' }}>Dr. {a.doctor_name}</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--mc-text-muted)' }}>{a.appointment_time} · {a.reason || 'General consultation'}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))
        }
      </div>
    </div>
  );
}

function monthAbbr(dateStr) {
  if (!dateStr) return '';
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return m[parseInt(dateStr.slice(5, 7), 10) - 1] || '';
}
