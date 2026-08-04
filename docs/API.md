# Mediconnect API Documentation

## Base URL

```
http://localhost/mediconnect/backend/index.php
```

## Request Format

All API calls follow this pattern:

```
GET/POST/PUT/DELETE {BASE_URL}?module=<module>&action=<action>[&id=<id>]
```

- **Content-Type**: `application/json` for JSON bodies
- **Credentials**: `include` (sessions via cookies)

## Response Format

All responses return JSON:

```json
{
  "status": "success" | "error",
  "message": "Human-readable message",
  "data": { ... } | [ ... ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_records": 73,
    "per_page": 15
  }
}
```

## Authentication

Mediconnect uses **PHP Sessions**. After login, a session cookie (`PHPSESSID`) is set automatically. All protected endpoints require this cookie.

---

## Modules

---

### 1. `auth` — Authentication

#### Register
```
POST ?module=auth&action=register
```
**Body:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@email.com",
  "password": "Password@1",
  "confirm_password": "Password@1",
  "role": "patient",
  "phone": "+1-555-0100",
  "date_of_birth": "1990-05-15",
  "gender": "female",
  "address": "123 Main St"
}
```
For `role: "doctor"`, add:
```json
{
  "specialization": "Cardiology",
  "license_number": "MD-2024-001",
  "department_id": 2
}
```

#### Login
```
POST ?module=auth&action=login
```
```json
{ "email": "admin@mediconnect.com", "password": "Admin@1234" }
```

#### Logout
```
POST ?module=auth&action=logout
```

#### Get Current User
```
GET ?module=auth&action=me
```

#### Forgot Password
```
POST ?module=auth&action=forgot-password
```
```json
{ "email": "jane@email.com" }
```

#### Reset Password
```
POST ?module=auth&action=reset-password
```
```json
{
  "token": "abc123...",
  "email": "jane@email.com",
  "new_password": "NewPass@1",
  "confirm_password": "NewPass@1"
}
```

#### Change Password
```
POST ?module=auth&action=change-password
```
```json
{
  "current_password": "OldPass@1",
  "new_password": "NewPass@1",
  "confirm_password": "NewPass@1"
}
```

---

### 2. `admin` — Admin Management

All endpoints require role: **admin**

#### Dashboard Stats
```
GET ?module=admin&action=stats
```

#### List Doctors
```
GET ?module=admin&action=doctors[&search=&department_id=&is_active=&page=1&per_page=15]
```

#### Create Doctor
```
POST ?module=admin&action=doctors&sub=create
```

#### Update Doctor
```
PUT ?module=admin&action=doctors&id=<id>
```

#### Toggle Doctor Status
```
PUT ?module=admin&action=doctors&id=<id>&sub=toggle_status
```

#### Delete Doctor
```
DELETE ?module=admin&action=doctors&id=<id>
```

#### List Patients
```
GET ?module=admin&action=patients[&search=&page=1]
```

#### Delete Patient
```
DELETE ?module=admin&action=patients&id=<id>
```

#### List Departments
```
GET ?module=admin&action=departments
```

#### Create Department
```
POST ?module=admin&action=departments
```
```json
{ "name": "Cardiology", "description": "Heart care" }
```

#### Update Department
```
PUT ?module=admin&action=departments&id=<id>
```

#### Delete Department
```
DELETE ?module=admin&action=departments&id=<id>
```

---

### 3. `appointment` — Appointments

#### List Appointments
```
GET ?module=appointment[&scope=patient|doctor&filter=today|upcoming|history&status=&date=&search=&page=1]
```

#### Book Appointment (patient)
```
POST ?module=appointment&action=book
```
```json
{
  "doctor_id": 3,
  "department_id": 2,
  "appointment_date": "2026-07-20",
  "appointment_time": "09:00",
  "reason": "Chest pain evaluation"
}
```

#### Approve Appointment (doctor/admin)
```
PUT ?module=appointment&action=approve&id=<id>
```

#### Reject Appointment
```
PUT ?module=appointment&action=reject&id=<id>
```
```json
{ "notes": "Doctor unavailable on this date." }
```

#### Reschedule
```
PUT ?module=appointment&action=reschedule&id=<id>
```
```json
{ "appointment_date": "2026-07-25", "appointment_time": "10:30" }
```

#### Complete Appointment (doctor)
```
PUT ?module=appointment&action=complete&id=<id>
```

#### Cancel Appointment (patient/doctor/admin)
```
PUT ?module=appointment&action=cancel&id=<id>
```
```json
{ "reason": "Personal reasons" }
```

#### Get Available Slots
```
GET ?module=appointment&action=available_slots&doctor_id=<id>&date=2026-07-20
```

#### Doctor Stats
```
GET ?module=appointment&action=doctor_stats
```

#### Patient Stats
```
GET ?module=appointment&action=patient_stats
```

---

### 4. `doctor` — Doctor Profile & Patients

#### Get My Profile (doctor)
```
GET ?module=doctor&action=profile
```

#### Update My Profile
```
PUT ?module=doctor&action=update_profile
```
```json
{ "full_name": "Dr. Smith", "specialization": "Neurology", "bio": "..." }
```

#### Upload Profile Picture
```
POST ?module=doctor&action=upload_picture
```
Form-data: `profile_picture` (image file)

#### My Patients
```
GET ?module=doctor&action=patients[&search=&page=1]
```

#### My Schedule
```
GET ?module=doctor&action=my_schedule
```

#### List All Doctors (any auth)
```
GET ?module=doctor[&search=&department_id=]
```

---

### 5. `patient` — Patient Profile

#### Get My Profile (patient)
```
GET ?module=patient&action=profile
```

#### Update My Profile
```
PUT ?module=patient&action=update_profile
```
```json
{ "full_name": "Jane Smith", "phone": "+1-555-0100", "address": "123 Main St" }
```

#### Upload Profile Picture
```
POST ?module=patient&action=upload_picture
```

#### My Medical Records
```
GET ?module=patient&action=my_records[&page=1]
```

---

### 6. `consultation` — Consultations

#### List Consultations
```
GET ?module=consultation[&scope=doctor|patient&search=&start_date=&end_date=&page=1]
```

#### Get Single Consultation
```
GET ?module=consultation&id=<id>
```

#### Get By Appointment
```
GET ?module=consultation&appointment_id=<id>
```

#### Create Consultation (doctor)
```
POST ?module=consultation&action=create
```
```json
{
  "appointment_id": 12,
  "diagnosis": "Mild hypertension",
  "prescription": "Amlodipine 5mg once daily",
  "recommendations": "Reduce sodium intake",
  "follow_up_date": "2026-08-15"
}
```

#### Update Consultation (doctor)
```
POST ?module=consultation&action=update&id=<id>
```

#### Upload File (doctor)
```
POST ?module=consultation&action=upload&id=<id>
```
Form-data: `file` (PDF/image)

#### Download Summary (patient/doctor)
```
GET ?module=consultation&action=download&id=<id>
```
Returns plain-text download.

---

### 7. `schedule` — Doctor Schedule

#### Get My Schedule (doctor)
```
GET ?module=schedule&action=my_schedule
```

#### Get Doctor Schedule (any auth, for booking)
```
GET ?module=schedule&doctor_id=<id>
```

#### Bulk Update Schedule (doctor)
```
POST ?module=schedule&action=update
```
```json
{
  "slots": [
    { "day_of_week": "Monday", "start_time": "09:00", "end_time": "17:00", "slot_duration": 30 },
    { "day_of_week": "Wednesday", "start_time": "09:00", "end_time": "13:00", "slot_duration": 30 }
  ]
}
```

#### Add Single Slot (doctor)
```
POST ?module=schedule&action=save_slot
```
```json
{ "day_of_week": "Friday", "start_time": "10:00", "end_time": "14:00", "slot_duration": 30 }
```

#### Delete Slot
```
DELETE ?module=schedule&id=<id>
```

---

### 8. `medical_records` — Medical Records

#### List All (admin/doctor)
```
GET ?module=medical_records[&patient_id=&search=&start_date=&end_date=&page=1]
```

#### My Records (patient)
```
GET ?module=medical_records&action=my_records[&page=1]
```

#### Get Single
```
GET ?module=medical_records&id=<id>
```

#### Upload Record
```
POST ?module=medical_records&action=upload
```
Form-data fields: `title`, `record_type`, `description`, `diagnosis`, `treatment`, `prescriptions`, `notes`, `patient_id` (doctor/admin only), `file` (optional)

#### Delete Record
```
DELETE ?module=medical_records&id=<id>
```

---

### 9. `notifications` — Notifications

#### List
```
GET ?module=notifications[&unread=0&page=1]
```

#### Unread Count
```
GET ?module=notifications&action=unread_count
```

#### Mark as Read
```
PUT ?module=notifications&action=mark_read&id=<id>
```

#### Mark All as Read
```
PUT ?module=notifications&action=mark_all_read
```

#### Delete
```
DELETE ?module=notifications&id=<id>
```

---

### 10. `activity_logs` — Activity Logs

#### List (admin only)
```
GET ?module=activity_logs[&search=&action_filter=login&start_date=&end_date=&page=1]
```

---

### 11. `settings` — Settings & Preferences

#### Get Settings (admin: system settings / others: user prefs)
```
GET ?module=settings
```

#### Update System Settings (admin)
```
POST ?module=settings&action=update
```
```json
{ "site_name": "Mediconnect", "appointment_duration": 30, "email_notifications": 1 }
```

#### Get/Update User Preferences
```
GET  ?module=settings&action=preferences
POST ?module=settings&action=preferences
```
```json
{
  "email_notifications": 1,
  "appointment_reminders": 1,
  "consultation_alerts": 1,
  "dark_mode": 0
}
```

---

### 12. `reports` — Reports

#### Generate Report (admin)
```
POST ?module=reports&action=generate
```
```json
{
  "type": "appointments",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "status": "completed",
  "department_id": 2
}
```
Types: `appointments` | `doctors` | `patients` | `consultations` | `departments`

#### Stats
```
GET ?module=reports&action=stats
```

---

### 13. `upload` — Profile Picture (shared)

```
POST ?module=upload
```
Form-data: `profile_picture` (image file — JPEG/PNG/GIF/WEBP, max 5MB)

---

## Pagination

Any list endpoint supports:
```
?page=1&per_page=15
```

Response includes:
```json
{
  "pagination": {
    "current_page": 1,
    "total_pages": 4,
    "total_records": 52,
    "per_page": 15
  }
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (wrong role) |
| 404 | Resource not found |
| 405 | Method not allowed |
| 500 | Server error |
