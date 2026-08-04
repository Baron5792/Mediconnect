import { get, post, patch } from './api';

// ── helpers ──────────────────────────────────────────────────────────────────
function toQuery(p) {
  if (!p) return '';
  const s = new URLSearchParams(p).toString();
  return s ? '?' + s : '';
}

// ── Admin: All appointments ───────────────────────────────────────────────────

// List all appointments — supports ?search, status, page, per_page
export async function getAllAppointments(params) {
  return get('/appointments/index.php' + toQuery(params));
}

// ── Doctor: Scoped appointment views ─────────────────────────────────────────

// Get today's appointments for the logged-in doctor
export async function getTodayAppointments() {
  return get('/appointments/today.php');
}

// Get upcoming appointments — supports ?per_page
export async function getUpcomingAppointments(params) {
  return get('/appointments/upcoming.php' + toQuery(params));
}

// Get past (completed/cancelled) appointments — supports ?page, per_page
export async function getAppointmentHistory(params) {
  return get('/appointments/history.php' + toQuery(params));
}

// ── Patient: My appointments ──────────────────────────────────────────────────

// Get the logged-in patient's appointments — supports ?status, page, per_page
export async function getMyAppointments(params) {
  return get('/appointments/index.php' + toQuery(params));
}

// ── Patient: Book an appointment ──────────────────────────────────────────────

// Create a new appointment booking — returns { status, data: { appointment }, message }
export async function createAppointment(data) {
  return post('/appointments/create.php', data);
}

// ── Shared: Status updates ────────────────────────────────────────────────────

// Update an appointment's status (confirm / cancel / complete / reject)
export async function updateAppointmentStatus(id, status, note, reason) {
  return patch(`/appointments/update-status.php?id=${id}`, {
    status,
    notes: note,
    cancelled_reason: reason,
  });
}

// ── Shared: Available time slots ──────────────────────────────────────────────

// Get available booking slots for a doctor on a given date (YYYY-MM-DD)
export async function getAvailableSlots(doctorId, date) {
  return get(`/appointments/slots.php?doctor_id=${doctorId}&date=${date}`);
}

// ── Shared: Dashboard statistics ─────────────────────────────────────────────

// Get appointment statistics — backend scopes the result to the caller's role
export async function getStats() {
  return get('/appointments/stats.php');
}
