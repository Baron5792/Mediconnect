import { get, post, put, patch, del } from './api';

// ── helpers ──────────────────────────────────────────────────────────────────
function toQuery(p) {
  if (!p) return '';
  const s = new URLSearchParams(p).toString();
  return s ? '?' + s : '';
}

// ════════════════════════════════════════════════════════════════════════════
//  DEPARTMENTS
// ════════════════════════════════════════════════════════════════════════════

// List all departments — returns { status, data: [{ id, name, description }] }
export async function getAllDepartments(params) {
  return get('/departments/index.php' + toQuery(params));
}

// Create a department — returns { status, data: { department }, message }
export async function createDepartment(data) {
  return post('/departments/create.php', data);
}

// Update a department by ID — returns { status, message }
export async function updateDepartment(id, data) {
  return put(`/departments/update.php?id=${id}`, data);
}

// Delete a department by ID — returns { status, message }
export async function deleteDepartment(id) {
  return del(`/departments/delete.php?id=${id}`);
}

// ════════════════════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ════════════════════════════════════════════════════════════════════════════

// Get all notifications for the logged-in user — supports ?page, per_page
export async function getAllNotifications(params) {
  return get('/notifications/index.php' + toQuery(params));
}

// Mark a single notification as read
export async function markNotificationRead(id) {
  return patch(`/notifications/mark-read.php?id=${id}`, {});
}

// Mark all notifications as read for the logged-in user
export async function markAllNotificationsRead() {
  return patch('/notifications/mark-all-read.php', {});
}

// Delete a notification by ID
export async function deleteNotification(id) {
  return del(`/notifications/delete.php?id=${id}`);
}

// ════════════════════════════════════════════════════════════════════════════
//  ACTIVITY LOGS
// ════════════════════════════════════════════════════════════════════════════

// Get system activity logs (admin only) — supports ?page, per_page, search
export async function getAllActivityLogs(params) {
  return get('/activity-logs/index.php' + toQuery(params));
}

// ════════════════════════════════════════════════════════════════════════════
//  SETTINGS
// ════════════════════════════════════════════════════════════════════════════

// Get global system settings (admin only)
export async function getSettings() {
  return get('/settings/index.php');
}

// Update global system settings (admin only)
export async function updateSettings(data) {
  return put('/settings/index.php', data);
}

// Get user-specific preferences (theme, notifications, etc.)
export async function getUserPrefs() {
  return get('/settings/prefs.php');
}

// Update user-specific preferences
export async function updateUserPrefs(data) {
  return put('/settings/prefs.php', data);
}

// ════════════════════════════════════════════════════════════════════════════
//  REPORTS
// ════════════════════════════════════════════════════════════════════════════

// Generate a report by type and optional date range — returns { status, data }
export async function generateReport(type, dateFrom, dateTo) {
  return post('/reports/generate.php', { type, date_from: dateFrom, date_to: dateTo });
}

// ════════════════════════════════════════════════════════════════════════════
//  MEDICAL RECORDS  (admin / doctor views)
// ════════════════════════════════════════════════════════════════════════════

// List all medical records — supports ?search, page, per_page
export async function getAllMedicalRecords(params) {
  return get('/medical-records/index.php' + toQuery(params));
}

// Create a medical record for a patient (doctor only)
export async function createMedicalRecord(data) {
  return post('/medical-records/create.php', data);
}
