import { get, post } from './api';

// ── helpers ──────────────────────────────────────────────────────────────────
const BASE_URL = (import.meta.env.VITE_APP_API_URL || '/api').replace(/\/$/, '');

function toQuery(p) {
  if (!p) return '';
  const s = new URLSearchParams(p).toString();
  return s ? '?' + s : '';
}

// ── Admin: All consultations ──────────────────────────────────────────────────

// List all consultations — supports ?search, page, per_page
export async function getAllConsultations(params) {
  return get('/consultations/index.php' + toQuery(params));
}

// ── Patient: My consultations ─────────────────────────────────────────────────

// Get the logged-in patient's consultation history — supports ?page, per_page
export async function getMyConsultations(params) {
  return get('/consultations/patient.php' + toQuery(params));
}

// ── Doctor: My consultations ──────────────────────────────────────────────────

// Get consultations written by the logged-in doctor — supports ?page, per_page
export async function getDoctorConsultations(params) {
  return get('/consultations/doctor.php' + toQuery(params));
}

// Add a consultation note for an appointment — returns { status, message }
export async function createConsultation(data) {
  return post('/consultations/create.php', data);
}

// ── Shared: Download ──────────────────────────────────────────────────────────

// Open the consultation summary as a .txt file download in a new browser tab
export function downloadConsultationSummary(id) {
  window.open(`${BASE_URL}/consultations/download.php?id=${id}`, '_blank');
}
