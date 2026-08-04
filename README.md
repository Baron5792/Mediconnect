# Welcome to Your Miaoda Project
Miaoda Application Link URL
    URL:https://medo.dev/projects/app-cvvckhm21vk1

# Mediconnect

> **Design and Implementation of an Electronic Patient Appointment and Consultation Management System**  
> A Final Year Project built with ReactJS + PHP 8 + MySQL

---

## Overview

Mediconnect is a full-stack healthcare management platform that enables patients to book appointments with doctors, doctors to manage consultations and schedules, and administrators to oversee the entire system — all through a clean, modern interface.

### Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Role Auth** | Admin, Doctor, Patient roles with PHP Session-based authentication |
| **Appointment Management** | Book, approve, reject, reschedule, cancel, complete |
| **Consultation Records** | Diagnosis, prescription, recommendations, file attachments |
| **Medical Records** | Full patient history with file uploads |
| **Doctor Scheduling** | Weekly availability slots with time conflict detection |
| **Notifications** | In-app + email (PHPMailer) for all key events |
| **Reports** | Admin reports across 5 entity types |
| **Activity Logs** | Full audit trail of all user actions |
| **Dark Mode** | Per-user theme preference |
| **Profile Management** | Photo upload, personal info, password change |

---

## Tech Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| ReactJS (Vite) | 18.x | UI framework |
| Bootstrap 5 | 5.3.x | Grid + components |
| CSS Modules | — | Scoped component styles |
| React Router DOM | 7.x | Client-side routing |
| Lucide React | 0.5x | Icon set |
| Sonner | 2.x | Toast notifications |
| Recharts | 2.x | Dashboard charts |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| PHP | 8.0+ | Backend language |
| MySQL | 8.0+ | Database |
| PHP Sessions | — | Authentication |
| PHPMailer | 6.x | Email delivery |

---

## Project Structure

```
mediconnect/
├── backend/                        # PHP REST API
│   ├── component/
│   │   ├── helpers.php             # Utility functions (sanitize, upload, pagination)
│   │   └── response.php            # JSON response helpers
│   ├── config/
│   │   ├── constants.php           # App constants (paths, limits)
│   │   ├── database.php            # PDO connection factory
│   │   ├── email.php               # PHPMailer config + sendEmail()
│   │   └── required.php            # Bootstrap: session, CORS, autoload
│   ├── controller/
│   │   ├── AuthController.php      # register, login, logout, forgot/reset password
│   │   ├── AdminController.php     # dashboard stats, manage doctors/patients/departments
│   │   ├── AppointmentController.php # book, approve, reject, reschedule, cancel, complete
│   │   ├── ConsultationController.php # CRUD, file upload, text summary download
│   │   ├── DoctorController.php    # doctor profile, patient list
│   │   ├── PatientController.php   # patient profile, medical records
│   │   ├── ScheduleController.php  # availability slot management
│   │   ├── MedicalRecordController.php # medical record CRUD + file upload
│   │   ├── NotificationController.php  # list, mark read, delete
│   │   ├── ActivityLogController.php   # admin audit log viewer
│   │   ├── ReportController.php    # 5-type report generator
│   │   ├── SettingsController.php  # system settings + user preferences
│   │   └── UploadController.php    # shared profile picture upload
│   ├── database/
│   │   └── schema.sql              # Full DB schema + seed data
│   ├── logs/                       # PHP error logs (git-ignored)
│   ├── middleware/
│   │   └── auth.php                # requireAuth(), requireRole(), session helpers
│   ├── uploads/                    # File storage (git-ignored)
│   │   ├── avatars/
│   │   ├── consultations/
│   │   └── medical_records/
│   └── index.php                   # Front controller / router
│
└── src/                            # React frontend (Vite)
    ├── assets/                     # Static assets
    ├── component/
    │   └── ui/                     # Shared UI components (StatCard, StatusBadge, etc.)
    ├── context/
    │   ├── AuthContext.tsx          # Session auth state
    │   └── ThemeContext.tsx         # Dark/light mode
    ├── hooks/
    │   └── index.ts                # Custom hooks (useFetch, usePagination, etc.)
    ├── layout/
    │   └── AppLayout.tsx           # Sidebar + topbar shell
    ├── pages/
    │   ├── auth/                   # Login, Register, ForgotPassword, ResetPassword
    │   ├── admin/                  # 13 admin pages
    │   ├── doctor/                 # 11 doctor pages
    │   └── patient/                # 8 patient pages
    ├── routes/
    │   └── AppRoutes.tsx           # Role-based lazy routing
    ├── service/                    # API fetch wrappers per module
    │   ├── api.ts
    │   ├── authService.ts
    │   ├── appointmentService.ts
    │   ├── consultationService.ts
    │   ├── doctorService.ts
    │   ├── otherServices.ts
    │   └── patientService.ts
    └── types/
        └── index.ts                # All TypeScript interfaces
```

---

## Quick Start

See **[INSTALLATION.md](./INSTALLATION.md)** for full setup instructions.

### 1-Minute Summary

```bash
# 1. Import database
mysql -u root -p < backend/database/schema.sql

# 2. Configure backend env (see backend/config/constants.php)

# 3. Install frontend deps
pnpm install

# 4. Start frontend dev server
pnpm dev
```

Point your web server document root at the `backend/` folder (Apache/Nginx).

---

## Default Admin Login

| Field | Value |
|-------|-------|
| Email | `admin@mediconnect.com` |
| Password | `Admin@1234` |

> **Change this immediately after first login via Settings → Change Password**

---

## License

This project is created for academic purposes as a Final Year Project.
