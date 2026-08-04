import { get, put } from './api';

// ── helpers ──────────────────────────────────────────────────────────────────
function toQuery(p) {
  if (!p) return '';
  const s = new URLSearchParams(p).toString();
  return s ? '?' + s : '';
}

// ── Admin: Patient listing ────────────────────────────────────────────────────

// List all patients — supports ?search, page, per_page
export async function getAllPatients(params) {
  return get('/patients/index.php' + toQuery(params));
}

// ── Patient: Own profile ──────────────────────────────────────────────────────

// Get the logged-in patient's profile — returns { status, data: { patient } }
export async function getPatientProfile() {
  return get('/patients/profile.php');
}

// Update the logged-in patient's profile — returns { status, message }
export async function updatePatientProfile(data) {
  return put('/patients/profile.php', data);
}

// ── Patient: Medical records ──────────────────────────────────────────────────

// Get the logged-in patient's medical records — supports ?page, per_page
export async function getMyMedicalRecords(params) {
  return get('/patients/medical-records.php' + toQuery(params));
}
