# Database Documentation — Mediconnect

## Overview

- **Database Engine**: MySQL 8.0+
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`
- **Database Name**: `mediconnect`
- **Total Tables**: 14
- **Schema File**: `backend/database/schema.sql`

---

## Entity Relationship Summary

```
users ──< doctors ──< doctor_schedule
      ──< patients
      ──< notifications
      ──< activity_logs
      ──< password_resets
      ──< user_preferences

departments ──< doctors

doctors  ──< appointments ──< consultations ──< consultation_files
patients ──< appointments
patients ──< medical_records
patients ──< consultations
```

---

## Tables

---

### `users`

Base identity table for all roles (admin, doctor, patient).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| `email` | VARCHAR(180) | NO | — | Unique email address |
| `password_hash` | VARCHAR(255) | NO | — | bcrypt hash (cost 12) |
| `role` | ENUM('admin','doctor','patient') | NO | — | User role |
| `full_name` | VARCHAR(150) | NO | — | Display name |
| `phone` | VARCHAR(20) | YES | NULL | Phone number |
| `profile_picture` | VARCHAR(512) | YES | NULL | URL to uploaded avatar |
| `is_active` | TINYINT(1) | NO | 1 | Account status |
| `remember_token` | VARCHAR(100) | YES | NULL | Remember-me token |
| `last_login` | DATETIME | YES | NULL | Last successful login |
| `created_at` | DATETIME | NO | CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | NO | CURRENT_TIMESTAMP | Auto-updated |

**Indexes**: `uq_users_email` (UNIQUE), `idx_users_role`

---

### `departments`

Medical departments available in the system.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| `name` | VARCHAR(100) | NO | — | Unique department name |
| `description` | TEXT | YES | NULL | Description |
| `created_at` | DATETIME | NO | CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

**Seeded**: 10 default departments (General Medicine, Cardiology, Orthopedics, etc.)

---

### `doctors`

Extends `users` with doctor-specific attributes.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| `user_id` | INT UNSIGNED | NO | — | FK → users.id (CASCADE DELETE) |
| `department_id` | INT UNSIGNED | YES | NULL | FK → departments.id (SET NULL) |
| `specialization` | VARCHAR(150) | NO | — | Medical specialization |
| `license_number` | VARCHAR(80) | NO | — | Unique medical license |
| `bio` | TEXT | YES | NULL | Doctor bio/description |
| `years_experience` | TINYINT | NO | 0 | Years of experience |
| `created_at` | DATETIME | NO | CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

---

### `patients`

Extends `users` with patient-specific attributes.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| `user_id` | INT UNSIGNED | NO | — | FK → users.id (CASCADE DELETE) |
| `date_of_birth` | DATE | YES | NULL | |
| `gender` | ENUM('male','female','other') | YES | NULL | |
| `address` | TEXT | YES | NULL | |
| `blood_type` | ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') | YES | NULL | |
| `allergies` | TEXT | YES | NULL | Known allergies |
| `created_at` | DATETIME | NO | CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

---

### `doctor_schedule`

Weekly availability template for doctors.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| `doctor_id` | INT UNSIGNED | NO | — | FK → doctors.id (CASCADE) |
| `day_of_week` | ENUM('Monday'…'Sunday') | NO | — | Day of availability |
| `start_time` | TIME | NO | — | Slot start time |
| `end_time` | TIME | NO | — | Slot end time |
| `slot_duration` | TINYINT UNSIGNED | NO | 30 | Minutes per appointment |
| `is_available` | TINYINT(1) | NO | 1 | Whether this slot is active |
| `date_override` | DATE | YES | NULL | Specific date exception |
| `created_at` | DATETIME | NO | CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

**Note**: `date_override` is used for one-off exceptions (e.g., doctor unavailable on a specific date despite normal schedule).

---

### `appointments`

Core appointment records linking patients and doctors.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| `patient_id` | INT UNSIGNED | NO | — | FK → patients.id (CASCADE) |
| `doctor_id` | INT UNSIGNED | NO | — | FK → doctors.id (CASCADE) |
| `department_id` | INT UNSIGNED | YES | NULL | FK → departments.id (SET NULL) |
| `appointment_date` | DATE | NO | — | Scheduled date |
| `appointment_time` | TIME | NO | — | Scheduled time |
| `reason` | TEXT | NO | — | Reason for visit |
| `status` | ENUM('pending','confirmed','completed','cancelled','rejected') | NO | 'pending' | Current status |
| `notes` | TEXT | YES | NULL | Doctor/admin notes |
| `created_at` | DATETIME | NO | CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

**Status Workflow**:
```
pending → confirmed → completed
        → rejected
        → cancelled (from pending or confirmed)
```

---

### `consultations`

Consultation records written by doctors after completed appointments.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| `appointment_id` | INT UNSIGNED | NO | — | FK → appointments.id (CASCADE) — UNIQUE |
| `patient_id` | INT UNSIGNED | NO | — | FK → patients.id (CASCADE) |
| `doctor_id` | INT UNSIGNED | NO | — | FK → doctors.id (CASCADE) |
| `diagnosis` | TEXT | NO | — | Medical diagnosis |
| `prescription` | TEXT | YES | NULL | Medication prescribed |
| `recommendations` | TEXT | YES | NULL | Doctor recommendations |
| `notes` | TEXT | YES | NULL | Additional notes |
| `follow_up_date` | DATE | YES | NULL | Next appointment suggestion |
| `created_at` | DATETIME | NO | CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

**Constraint**: One consultation per appointment (`uq_consultations_appointment`).

---

### `consultation_files`

Files attached to consultation records.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| `consultation_id` | INT UNSIGNED | NO | — | FK → consultations.id (CASCADE) |
| `file_name` | VARCHAR(255) | NO | — | Original filename |
| `file_path` | VARCHAR(512) | NO | — | URL to stored file |
| `mime_type` | VARCHAR(100) | YES | NULL | File MIME type |
| `file_size` | INT UNSIGNED | YES | NULL | File size in bytes |
| `uploaded_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

---

### `medical_records`

Patient medical history records (can be created by doctor, admin, or patient).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| `patient_id` | INT UNSIGNED | NO | — | FK → patients.id (CASCADE) |
| `doctor_id` | INT UNSIGNED | YES | NULL | FK → doctors.id (SET NULL) |
| `consultation_id` | INT UNSIGNED | YES | NULL | FK → consultations.id (SET NULL) |
| `record_type` | VARCHAR(80) | NO | 'general' | e.g. lab, imaging, prescription |
| `title` | VARCHAR(200) | NO | — | Record title |
| `description` | TEXT | YES | NULL | |
| `diagnosis` | TEXT | YES | NULL | |
| `treatment` | TEXT | YES | NULL | |
| `prescriptions` | TEXT | YES | NULL | |
| `notes` | TEXT | YES | NULL | |
| `file_path` | VARCHAR(512) | YES | NULL | Attached file URL |
| `file_name` | VARCHAR(255) | YES | NULL | Original filename |
| `mime_type` | VARCHAR(100) | YES | NULL | |
| `file_size` | INT UNSIGNED | YES | NULL | |
| `created_at` | DATETIME | NO | CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

---

### `notifications`

In-app notification store.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| `user_id` | INT UNSIGNED | NO | — | FK → users.id (CASCADE) |
| `type` | VARCHAR(60) | NO | — | Notification type key |
| `title` | VARCHAR(200) | NO | — | Short title |
| `message` | TEXT | NO | — | Full message |
| `is_read` | TINYINT(1) | NO | 0 | Read status |
| `related_id` | INT UNSIGNED | YES | NULL | Related entity ID |
| `created_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

**Common `type` values**: `appointment_booked`, `appointment_approved`, `appointment_rejected`, `appointment_cancelled`, `appointment_completed`, `consultation_available`, `password_changed`

---

### `activity_logs`

Full audit trail of all user actions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Primary key |
| `user_id` | INT UNSIGNED | NO | — | FK → users.id (CASCADE) |
| `action` | VARCHAR(80) | NO | — | Action key (e.g. `login`, `appointment_booked`) |
| `description` | TEXT | NO | — | Human-readable description |
| `ip_address` | VARCHAR(45) | YES | NULL | Client IP |
| `created_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

---

### `password_resets`

Time-limited password reset tokens.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | |
| `email` | VARCHAR(180) | NO | — | User's email address |
| `token` | VARCHAR(80) | NO | — | Random hex token |
| `expires_at` | DATETIME | NO | — | Expiry (24 hours after creation) |
| `used` | TINYINT(1) | NO | 0 | Whether token has been used |
| `created_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

---

### `settings`

Single-row system configuration (always `id = 1`).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | Always 1 |
| `site_name` | VARCHAR(100) | NO | 'Mediconnect' | |
| `site_email` | VARCHAR(180) | NO | — | Contact email |
| `site_phone` | VARCHAR(20) | YES | NULL | |
| `site_address` | TEXT | YES | NULL | |
| `appointment_duration` | TINYINT | NO | 30 | Default slot minutes |
| `max_appointments_per_day` | TINYINT | NO | 20 | Per-doctor daily limit |
| `email_notifications` | TINYINT(1) | NO | 1 | Global email toggle |
| `reminder_hours` | TINYINT | NO | 24 | Hours before reminder |
| `updated_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

---

### `user_preferences`

Per-user notification and theme settings.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INT UNSIGNED | NO | AUTO_INCREMENT | |
| `user_id` | INT UNSIGNED | NO | — | FK → users.id (CASCADE) — UNIQUE |
| `email_notifications` | TINYINT(1) | NO | 1 | |
| `appointment_reminders` | TINYINT(1) | NO | 1 | |
| `consultation_alerts` | TINYINT(1) | NO | 1 | |
| `dark_mode` | TINYINT(1) | NO | 0 | |
| `updated_at` | DATETIME | NO | CURRENT_TIMESTAMP | |

---

## Seed Data

The `schema.sql` file includes these seeds:

| Table | Seeded Records |
|-------|---------------|
| `settings` | 1 row (id=1, default config) |
| `departments` | 10 rows (General Medicine, Cardiology, Orthopedics, Pediatrics, Dermatology, Neurology, Gynecology, Ophthalmology, Dentistry, Psychiatry) |
| `users` | 1 admin account (`admin@mediconnect.com` / `Admin@1234`) |

---

## Normalization

The schema follows **3rd Normal Form (3NF)**:

- **1NF**: All columns contain atomic values; no repeating groups
- **2NF**: All non-key attributes are fully dependent on the primary key
- **3NF**: No transitive dependencies — doctor info in `doctors` table not duplicated in `appointments`

Denormalized columns (e.g. `patient_name` in API responses) are computed via JOINs, never stored.
