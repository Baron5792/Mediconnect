import { get, post, put, patch, del } from './api';

// ── helpers ──────────────────────────────────────────────────────────────────
function toQuery(p) {
  if (!p) return '';
  const s = new URLSearchParams(p).toString();
  return s ? '?' + s : '';
}

// ── Admin: Doctor management ──────────────────────────────────────────────────

// List all doctors — supports ?search, department_id, is_active, page, per_page
export async function getAllDoctors(params) {
  return get('/doctors/index.php' + toQuery(params));
}

// Create a new doctor account — returns { status, data: { doctor }, message }
export async function createDoctor(data) {
  return post('/doctors/create.php', data);
}

// Update a doctor's details — returns { status, message }
export async function updateDoctor(id, data) {
  return put(`/doctors/update.php?id=${id}`, data);
}

// Toggle a doctor's active/inactive status — returns { status, message }
export async function toggleDoctorStatus(id) {
  return patch(`/doctors/toggle-status.php?id=${id}`, {});
}

// Permanently delete a doctor — returns { status, message }
export async function deleteDoctor(id) {
  return del(`/doctors/delete.php?id=${id}`);
}

// ── Doctor: Own profile ───────────────────────────────────────────────────────

// Get the logged-in doctor's profile — returns { status, data: { doctor } }
export async function getDoctorProfile() {
  return get('/doctors/profile.php');
}

// Update the logged-in doctor's profile — returns { status, message }
export async function updateDoctorProfile(data) {
  return put('/doctors/profile.php', data);
}

// ── Doctor: Patients & history ────────────────────────────────────────────────

// List patients who have had appointments with this doctor
export async function getDoctorPatients(params) {
  return get('/doctors/patients.php' + toQuery(params));
}

// Get medical history for a specific patient (doctor view)
export async function getPatientMedicalHistory(patientId) {
  return get(`/doctors/patient-history.php?patient_id=${patientId}`);
}

// ── Doctor: Weekly schedule ───────────────────────────────────────────────────

// Get all availability slots for the logged-in doctor
export async function getDoctorSchedule() {
  return get('/doctors/schedule.php');
}

// Add a new availability slot
export async function createScheduleSlot(data) {
  return post('/doctors/schedule.php', data);
}

// Remove an availability slot by ID
export async function deleteScheduleSlot(id) {
  return del(`/doctors/schedule.php?id=${id}`);
}
