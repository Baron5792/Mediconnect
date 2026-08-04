import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Calendar, Clock, History, Users, FileText,
  ClipboardList, BarChart2, Bell, Settings, User, LogOut,
  ChevronDown, Menu, X, Sun, Moon, Stethoscope, Activity,
  Building2, BookOpen, Clipboard, Heart
} from 'lucide-react';

// ── Navigation config per role ──────────────────────────────
const NAV = {
  admin: [
    { to: '/admin/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/doctors',         icon: Stethoscope,     label: 'Doctors' },
    { to: '/admin/patients',        icon: Users,           label: 'Patients' },
    { to: '/admin/departments',     icon: Building2,       label: 'Departments' },
    { to: '/admin/appointments',    icon: Calendar,        label: 'Appointments' },
    { to: '/admin/consultations',   icon: ClipboardList,   label: 'Consultations' },
    { to: '/admin/medical-records', icon: FileText,        label: 'Medical Records' },
    { to: '/admin/reports',         icon: BarChart2,       label: 'Reports' },
    { to: '/admin/activity-logs',   icon: Activity,        label: 'Activity Logs' },
    { to: '/admin/notifications',   icon: Bell,            label: 'Notifications' },
    { to: '/admin/settings',        icon: Settings,        label: 'Settings' },
    { to: '/admin/profile',         icon: User,            label: 'Profile' },
  ],
  doctor: [
    { to: '/doctor/dashboard',           icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor/appointments/today',  icon: Clock,           label: "Today's Appts" },
    { to: '/doctor/appointments/upcoming',icon: Calendar,       label: 'Upcoming' },
    { to: '/doctor/appointments/history',icon: History,         label: 'History' },
    { to: '/doctor/patients',            icon: Users,           label: 'My Patients' },
    { to: '/doctor/patient-history',     icon: BookOpen,        label: 'Patient History' },
    { to: '/doctor/consultations',       icon: ClipboardList,   label: 'Consultation Notes' },
    { to: '/doctor/schedule',            icon: Calendar,        label: 'My Schedule' },
    { to: '/doctor/notifications',       icon: Bell,            label: 'Notifications' },
    { to: '/doctor/profile',             icon: User,            label: 'Profile' },
    { to: '/doctor/settings',            icon: Settings,        label: 'Settings' },
  ],
  patient: [
    { to: '/patient/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patient/book-appointment', icon: Calendar,        label: 'Book Appointment' },
    { to: '/patient/appointments',     icon: ClipboardList,   label: 'My Appointments' },
    { to: '/patient/consultations',    icon: Clipboard,       label: 'Consultations' },
    { to: '/patient/medical-records',  icon: Heart,           label: 'Medical Records' },
    { to: '/patient/notifications',    icon: Bell,            label: 'Notifications' },
    { to: '/patient/profile',          icon: User,            label: 'Profile' },
    { to: '/patient/settings',         icon: Settings,        label: 'Settings' },
  ],
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role || 'patient';
  const navItems = NAV[role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  const SidebarContent = () => (
    <div className="d-flex flex-column h-100" style={{ background: 'var(--mc-surface)', borderRight: '1px solid var(--mc-border)' }}>
      {/* Logo */}
      <div className="p-3 pb-2" style={{ borderBottom: '1px solid var(--mc-border)' }}>
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--mc-font-heading)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--mc-text)' }}>Mediconnect</span>
        </Link>
      </div>

      {/* User badge */}
      <div className="p-3" style={{ borderBottom: '1px solid var(--mc-border)' }}>
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--mc-accent-light)', border: '2px solid var(--mc-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {user?.profile_picture
              ? <img src={user.profile_picture} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--mc-accent)' }}>{(user?.full_name || 'U').charAt(0)}</span>
            }
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.82rem', color: 'var(--mc-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name || 'User'}</p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--mc-text-muted)', textTransform: 'capitalize' }}>{role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-grow-1 py-2" style={{ overflowY: 'auto' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 1rem',
              margin: '1px 8px', borderRadius: 8,
              background: isActive(to) ? 'var(--mc-accent-light)' : 'transparent',
              color: isActive(to) ? 'var(--mc-accent)' : 'var(--mc-text-secondary)',
              fontWeight: isActive(to) ? 600 : 400,
              fontSize: '0.85rem',
              textDecoration: 'none',
              transition: 'var(--mc-transition)',
            }}
          >
            <Icon size={16} strokeWidth={isActive(to) ? 2.2 : 1.8} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-2" style={{ borderTop: '1px solid var(--mc-border)' }}>
        <button
          onClick={toggle}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '0.55rem 1rem', background: 'transparent', border: 'none', borderRadius: 8, color: 'var(--mc-text-secondary)', fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--mc-transition)' }}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '0.55rem 1rem', background: 'transparent', border: 'none', borderRadius: 8, color: 'var(--mc-danger)', fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--mc-transition)' }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--mc-bg)' }}>
      {/* Desktop Sidebar */}
      <aside style={{ width: 230, flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }} className="d-none d-lg-block">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1050, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position: 'relative', width: 240, height: '100%', zIndex: 1 }}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--mc-surface)', borderBottom: '1px solid var(--mc-border)', padding: '0.7rem 1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="d-lg-none btn btn-sm btn-outline-secondary" style={{ border: 'none', background: 'transparent', padding: 6 }} onClick={() => setSidebarOpen(true)}>
            <Menu size={20} color="var(--mc-text)" />
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={toggle} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'var(--mc-text-muted)' }}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to={`/${role}/notifications`} style={{ position: 'relative', color: 'var(--mc-text-muted)', padding: 6 }}>
            <Bell size={18} />
          </Link>
          <Link to={`/${role}/profile`} style={{ textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--mc-accent-light)', border: '2px solid var(--mc-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mc-accent)' }}>{(user?.full_name || 'U').charAt(0)}</span>
            </div>
          </Link>
        </header>

        {/* Page content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
