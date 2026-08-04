import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../layout/AppLayout';

/* ── Auth pages (eager — small) ── */
import LandingPage       from '../pages/LandingPage';
import LoginPage         from '../pages/auth/LoginPage';
import RegisterPage      from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from '../pages/auth/ResetPasswordPage';
import NotFoundPage      from '../pages/NotFoundPage';

/* ── Admin pages (lazy) ── */
const AdminDashboard       = lazy(() => import('../pages/admin/AdminDashboard'));
const ManageDoctors        = lazy(() => import('../pages/admin/ManageDoctors'));
const ManagePatients       = lazy(() => import('../pages/admin/ManagePatients'));
const ManageDepartments    = lazy(() => import('../pages/admin/ManageDepartments'));
const ManageAppointments   = lazy(() => import('../pages/admin/ManageAppointments'));
const ManageConsultations  = lazy(() => import('../pages/admin/ManageConsultations'));
const ManageMedicalRecords = lazy(() => import('../pages/admin/ManageMedicalRecords'));
const AdminReports         = lazy(() => import('../pages/admin/AdminReports'));
const ActivityLogs         = lazy(() => import('../pages/admin/ActivityLogs'));
const AdminNotifications   = lazy(() => import('../pages/admin/AdminNotifications'));
const AdminSettings        = lazy(() => import('../pages/admin/AdminSettings'));
const AdminProfile         = lazy(() => import('../pages/admin/AdminProfile'));

/* ── Doctor pages (lazy) ── */
const DoctorDashboard       = lazy(() => import('../pages/doctor/DoctorDashboard'));
const TodayAppointments     = lazy(() => import('../pages/doctor/TodayAppointments'));
const UpcomingAppointments  = lazy(() => import('../pages/doctor/UpcomingAppointments'));
const AppointmentHistory    = lazy(() => import('../pages/doctor/AppointmentHistory'));
const DoctorPatients        = lazy(() => import('../pages/doctor/DoctorPatients'));
const PatientMedicalHistory = lazy(() => import('../pages/doctor/PatientMedicalHistory'));
const ConsultationNotes     = lazy(() => import('../pages/doctor/ConsultationNotes'));
const DoctorSchedule        = lazy(() => import('../pages/doctor/DoctorSchedule'));
const DoctorNotifications   = lazy(() => import('../pages/doctor/DoctorNotifications'));
const DoctorProfile         = lazy(() => import('../pages/doctor/DoctorProfile'));
const DoctorSettings        = lazy(() => import('../pages/doctor/DoctorSettings'));

/* ── Patient pages (lazy) ── */
const PatientDashboard     = lazy(() => import('../pages/patient/PatientDashboard'));
const BookAppointment      = lazy(() => import('../pages/patient/BookAppointment'));
const PatientAppointments  = lazy(() => import('../pages/patient/PatientAppointments'));
const ConsultationHistory  = lazy(() => import('../pages/patient/ConsultationHistory'));
const PatientMedicalRecords= lazy(() => import('../pages/patient/PatientMedicalRecords'));
const PatientNotifications = lazy(() => import('../pages/patient/PatientNotifications'));
const PatientProfile       = lazy(() => import('../pages/patient/PatientProfile'));
const PatientSettings      = lazy(() => import('../pages/patient/PatientSettings'));

/* ── Loading fallback ── */
function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-border" style={{ color: 'var(--mc-accent)', width: 32, height: 32 }} />
    </div>
  );
}

/* ── Role Guard ── */
function Guard({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return <AppLayout>{children}</AppLayout>;
}

/* ── Public guard (redirect if logged in) ── */
function PublicGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login"           element={<PublicGuard><LoginPage /></PublicGuard>} />
        <Route path="/register"        element={<PublicGuard><RegisterPage /></PublicGuard>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* Admin */}
        <Route path="/admin/dashboard"        element={<Guard role="admin"><AdminDashboard /></Guard>} />
        <Route path="/admin/doctors"          element={<Guard role="admin"><ManageDoctors /></Guard>} />
        <Route path="/admin/patients"         element={<Guard role="admin"><ManagePatients /></Guard>} />
        <Route path="/admin/departments"      element={<Guard role="admin"><ManageDepartments /></Guard>} />
        <Route path="/admin/appointments"     element={<Guard role="admin"><ManageAppointments /></Guard>} />
        <Route path="/admin/consultations"    element={<Guard role="admin"><ManageConsultations /></Guard>} />
        <Route path="/admin/medical-records"  element={<Guard role="admin"><ManageMedicalRecords /></Guard>} />
        <Route path="/admin/reports"          element={<Guard role="admin"><AdminReports /></Guard>} />
        <Route path="/admin/activity-logs"    element={<Guard role="admin"><ActivityLogs /></Guard>} />
        <Route path="/admin/notifications"    element={<Guard role="admin"><AdminNotifications /></Guard>} />
        <Route path="/admin/settings"         element={<Guard role="admin"><AdminSettings /></Guard>} />
        <Route path="/admin/profile"          element={<Guard role="admin"><AdminProfile /></Guard>} />

        {/* Doctor */}
        <Route path="/doctor/dashboard"             element={<Guard role="doctor"><DoctorDashboard /></Guard>} />
        <Route path="/doctor/appointments/today"    element={<Guard role="doctor"><TodayAppointments /></Guard>} />
        <Route path="/doctor/appointments/upcoming" element={<Guard role="doctor"><UpcomingAppointments /></Guard>} />
        <Route path="/doctor/appointments/history"  element={<Guard role="doctor"><AppointmentHistory /></Guard>} />
        <Route path="/doctor/patients"              element={<Guard role="doctor"><DoctorPatients /></Guard>} />
        <Route path="/doctor/patient-history"       element={<Guard role="doctor"><PatientMedicalHistory /></Guard>} />
        <Route path="/doctor/consultations"         element={<Guard role="doctor"><ConsultationNotes /></Guard>} />
        <Route path="/doctor/schedule"              element={<Guard role="doctor"><DoctorSchedule /></Guard>} />
        <Route path="/doctor/notifications"         element={<Guard role="doctor"><DoctorNotifications /></Guard>} />
        <Route path="/doctor/profile"               element={<Guard role="doctor"><DoctorProfile /></Guard>} />
        <Route path="/doctor/settings"              element={<Guard role="doctor"><DoctorSettings /></Guard>} />

        {/* Patient */}
        <Route path="/patient/dashboard"        element={<Guard role="patient"><PatientDashboard /></Guard>} />
        <Route path="/patient/book-appointment" element={<Guard role="patient"><BookAppointment /></Guard>} />
        <Route path="/patient/appointments"     element={<Guard role="patient"><PatientAppointments /></Guard>} />
        <Route path="/patient/consultations"    element={<Guard role="patient"><ConsultationHistory /></Guard>} />
        <Route path="/patient/medical-records"  element={<Guard role="patient"><PatientMedicalRecords /></Guard>} />
        <Route path="/patient/notifications"    element={<Guard role="patient"><PatientNotifications /></Guard>} />
        <Route path="/patient/profile"          element={<Guard role="patient"><PatientProfile /></Guard>} />
        <Route path="/patient/settings"         element={<Guard role="patient"><PatientSettings /></Guard>} />

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
