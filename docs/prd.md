# Requirements Document

## 1. Application Overview

**Application Name**: Mediconnect

**Application Description**: An Electronic Patient Appointment and Consultation Management System designed as a Final Year Project. The system enables patients to book appointments with doctors, doctors to manage appointments and consultations, and administrators to oversee the entire system operations including user management, department management, and reporting.

**Technology Stack Requirements**:
- Frontend: ReactJS (Vite), Bootstrap 5, plain CSS, React Router DOM, Lucide React icons, Sonner alerts, Fetch API, Skeleton loaders, Recharts
- Backend: PHP 8 (no framework), MySQL, PHP Sessions, PHPMailer, REST API, Prepared Statements
- Backend Folder Structure: backend/ containing component/, config/, controller/, middleware/, routes/, uploads/, logs/, index.php
- Frontend Folder Structure: src/ containing assets/, component/, hooks/, layout/, pages/, routes/, service/, context/
- Use plain .jsx files where possible, minimize TypeScript complexity

**Design Requirements**:
- Modern premium interface inspired by Apple Health, Stripe Dashboard, Linear, Notion
- Responsive design for Desktop, Tablet, Mobile
- Color palette: Deep red accent #8B1E1E, near-black #121212, clean white surfaces
- Typography: Google Fonts (Playfair Display + Inter)
- UI elements: Rounded cards, soft shadows, smooth hover animations, colorful gradient accents, Bootstrap Grid system
- Dark mode toggle functionality
- Stunning landing page with hero section, gradient backgrounds, features showcase, testimonials, statistics, call-to-action, footer

## 2. Users and Usage Scenarios

**Target Users**:
1. **Administrator**: System manager responsible for overall operations, user management, and reporting
2. **Doctor**: Medical professional managing appointments, consultations, and patient medical records
3. **Patient**: End user booking appointments, viewing consultation history, and accessing medical records

**Core Usage Scenarios**:
- Visitor explores landing page and registers as patient or doctor
- Patient books appointment with doctor for medical consultation
- Doctor reviews and approves/rejects appointment requests
- Doctor conducts consultation and records diagnosis, prescription, recommendations
- Administrator monitors system activities and generates reports
- Users receive notifications for appointment status changes and system updates

## 3. Page Structure and Functionality

### 3.1 Page Hierarchy

```
Mediconnect System
├── Public Pages
│   ├── Landing Page (Homepage)
│   ├── Register
│   ├── Login
│   ├── Forgot Password
│   └── Reset Password
├── Administrator Module
│   ├── Dashboard
│   ├── Manage Doctors
│   ├── Manage Patients
│   ├── Manage Departments
│   ├── Manage Appointments
│   ├── Manage Consultation Records
│   ├── Manage Medical Records
│   ├── Reports
│   ├── Notifications
│   ├── Settings
│   └── Profile
├── Doctor Module
│   ├── Dashboard
│   ├── Today's Appointments
│   ├── Upcoming Appointments
│   ├── Appointment History
│   ├── Patient List
│   ├── Patient Medical History
│   ├── Consultation Notes
│   ├── Availability Schedule
│   ├── Notifications
│   ├── Profile
│   └── Settings
└── Patient Module
    ├── Dashboard
    ├── Book Appointment
    ├── Appointment History
    ├── Consultation History
    ├── Medical Records
    ├── Notifications
    ├── Profile
    └── Settings
```

### 3.2 Public Pages

#### 3.2.1 Landing Page (Homepage)
- Hero section with gradient background, headline, subheadline, call-to-action buttons (Register, Login)
- Features section showcasing key system capabilities
- How It Works section explaining appointment booking process
- Testimonials section with user feedback
- Statistics section displaying system metrics
- Footer with links and contact information

#### 3.2.2 Register Page
- User selects role: Doctor or Patient
- User inputs: full name, email, password, confirm password, phone number
- Doctor additional fields: specialization, license number
- Patient additional fields: date of birth, gender, address
- System validates input and creates account
- System sends confirmation email

#### 3.2.3 Login Page
- User inputs email and password
- Remember Me checkbox
- System authenticates credentials using PHP Sessions
- System redirects to role-specific dashboard

#### 3.2.4 Forgot Password Page
- User inputs registered email address
- System sends password reset link to email

#### 3.2.5 Reset Password Page
- User accesses via email link
- User inputs new password and confirms password
- System updates password using password_hash()

#### 3.2.6 Logout
- User clicks logout button
- System destroys PHP session
- System redirects to login page

### 3.3 Administrator Module

#### 3.3.1 Dashboard
- Statistics cards: total doctors, total patients, total appointments, total consultations
- Dashboard charts displaying appointments and consultations trends
- Recent appointments list
- Recent activity logs

#### 3.3.2 Manage Doctors
- Display doctors list in table: name, email, specialization, department, status, actions
- Search by name, email, or specialization
- Filter by department or status
- Pagination
- View doctor details
- Edit doctor information
- Activate/deactivate doctor account
- Delete doctor account

#### 3.3.3 Manage Patients
- Display patients list in table: name, email, phone, date of birth, registration date, actions
- Search by name, email, or phone
- Pagination
- View patient details
- View patient medical history
- Edit patient information
- Delete patient account

#### 3.3.4 Manage Departments
- Display departments list
- Add new department with name and description
- Edit department information
- Delete department

#### 3.3.5 Manage Appointments
- Display all appointments in table: appointment ID, patient name, doctor name, department, date, time, status, actions
- Search by patient name, doctor name, or appointment ID
- Filter by status, date range, or department
- Pagination
- View appointment details
- Cancel appointment

#### 3.3.6 Manage Consultation Records
- Display all consultation records in table: consultation ID, patient name, doctor name, date, diagnosis, actions
- Search by patient name, doctor name, or consultation ID
- Filter by date range or department
- Pagination
- View consultation details including diagnosis, prescription, recommendations

#### 3.3.7 Manage Medical Records
- Display all medical records in table: record ID, patient name, date, diagnosis, treatment, actions
- Search by patient name or record ID
- Filter by date range
- Pagination
- View medical record details
- View uploaded files

#### 3.3.8 Reports
- Select report type: Appointments, Doctors, Patients, Consultations, Departments
- Select date range
- Generate report
- Display report data in table format
- Export report data

#### 3.3.9 Notifications
- Display all system notifications
- Mark notifications as read
- Delete notifications

#### 3.3.10 Settings
- Configure system settings: site name, site logo, email settings, notification settings
- Update settings

#### 3.3.11 Profile
- Display administrator profile information
- Edit profile: name, email, phone
- Upload profile picture
- Change password

### 3.4 Doctor Module

#### 3.4.1 Dashboard
- Statistics cards: today's appointments, upcoming appointments, total patients, total consultations
- Today's appointments list
- Recent notifications

#### 3.4.2 Today's Appointments
- Display appointments scheduled for current date in card format
- Each card shows: patient name, appointment time, status
- View appointment details
- Approve pending appointment
- Reject pending appointment
- Reschedule appointment
- Mark appointment as completed

#### 3.4.3 Upcoming Appointments
- Display future appointments in calendar layout
- Filter by date range
- View appointment details
- Approve pending appointment
- Reject pending appointment
- Reschedule appointment

#### 3.4.4 Appointment History
- Display past appointments in table: patient name, date, time, status, actions
- Search by patient name or date
- Pagination
- View appointment details

#### 3.4.5 Patient List
- Display all patients who have appointments with the doctor
- Search by name
- View patient details
- View patient medical history

#### 3.4.6 Patient Medical History
- Select patient from list
- Display patient's medical history: previous consultations, diagnoses, treatments, prescriptions
- Timeline view format
- View consultation details

#### 3.4.7 Consultation Notes
- Select completed appointment
- Write consultation notes: diagnosis, prescription, recommendations
- Add files to consultation record
- Save consultation record

#### 3.4.8 Availability Schedule
- Display doctor's weekly schedule in calendar format
- Set available time slots for each day
- Mark unavailable dates
- Update availability schedule

#### 3.4.9 Notifications
- Display notifications related to appointments and system updates
- Mark notifications as read
- Delete notifications

#### 3.4.10 Profile
- Display doctor profile information
- Edit profile: name, email, phone, specialization, license number
- Upload profile picture
- Change password

#### 3.4.11 Settings
- Configure notification preferences
- Toggle dark mode
- Update settings

### 3.5 Patient Module

#### 3.5.1 Dashboard
- Statistics cards: upcoming appointments, total consultations, total medical records
- Upcoming appointments list
- Recent consultations
- Recent notifications

#### 3.5.2 Book Appointment
- Select department from dropdown
- Select doctor from available doctors in selected department
- Choose appointment date from calendar
- Choose available time slot from doctor's schedule
- Enter reason for appointment
- Submit appointment request
- Receive appointment confirmation

#### 3.5.3 Appointment History
- Display all appointments in table: doctor name, department, date, time, status, actions
- Search by doctor name or date
- Filter by status
- Pagination
- View appointment details
- Cancel appointment (for Pending or Confirmed status)
- Reschedule appointment (for Pending or Confirmed status)

#### 3.5.4 Consultation History
- Display all consultation records in timeline format
- Each consultation shows: date, doctor name, diagnosis, prescription, recommendations
- View consultation details
- Download consultation summary

#### 3.5.5 Medical Records
- Display patient's medical history: diagnoses, treatments, prescriptions, consultation notes
- View uploaded files
- Download medical records

#### 3.5.6 Notifications
- Display notifications related to appointments, consultations, system updates
- Mark notifications as read
- Delete notifications

#### 3.5.7 Profile
- Display patient profile information
- Edit profile: name, email, phone, date of birth, gender, address
- Upload profile picture
- Change password

#### 3.5.8 Settings
- Configure notification preferences
- Toggle dark mode
- Update settings

## 4. Business Rules and Logic

### 4.1 Authentication and Authorization
- System supports three user roles: Administrator, Doctor, Patient
- User sessions managed using PHP Sessions
- Role-based access control restricts access to role-specific modules
- Password reset links expire after 24 hours
- Users must be logged in to access protected pages

### 4.2 Appointment Workflow
- Patient submits appointment request with selected department, doctor, date, time, reason
- Appointment status set to Pending upon creation
- Doctor can approve, reject, or reschedule pending appointments
- Approved appointments status changes to Confirmed
- Rejected appointments status changes to Rejected
- Doctor marks completed appointments as Completed
- Patient can cancel appointments with status Pending or Confirmed
- Cancelled appointments status changes to Cancelled
- Patients cannot book appointments for past dates
- Patients can only book appointments during doctor's available time slots

### 4.3 Consultation Workflow
- Consultation records can only be created for appointments with status Completed
- Doctor writes consultation notes including diagnosis, prescription, recommendations
- Doctor can upload files to consultation record
- Patient can view consultation records after doctor saves them
- Patient can download consultation summary

### 4.4 Notification Rules
- System sends notifications for: appointment approved, appointment rejected, appointment cancelled, appointment reminder, new consultation available, password changed
- Appointment reminders sent 24 hours before appointment time
- Email notifications sent using PHPMailer
- In-app notifications stored in notifications table

### 4.5 Doctor Availability
- Doctors set availability schedule by defining available time slots for each day
- Patients can only book appointments during doctor's available time slots
- Doctors can mark specific dates as unavailable

### 4.6 Data Storage
- All user passwords hashed using password_hash() before storage
- Profile pictures and consultation files stored in uploads/ folder
- Activity logs record user actions: login, logout, appointment creation, appointment approval, consultation creation
- Backend data stored in MySQL database with tables: users, patients, doctors, departments, appointments, consultations, doctor_schedule, notifications, medical_records, activity_logs, settings, password_resets

### 4.7 Backend API Format
- All API responses follow format: {\"status\":\"success\",\"message\":\"...\",\"data\":[]}
- Use Prepared Statements for database queries

### 4.8 Search and Filtering
- Search functionality available on all list pages
- Filtering options provided based on relevant criteria: status, date range, department
- Pagination implemented for all list pages

### 4.9 Dark Mode
- Users can toggle dark mode from settings
- Dark mode preference stored in user settings

## 5. Exception and Boundary Cases

| Scenario | Handling |
|----------|----------|
| User enters invalid email format during registration | Display validation error message |
| User enters mismatched passwords during registration | Display validation error message |
| User attempts to login with incorrect credentials | Display error message: Invalid email or password |
| User attempts to access protected page without login | Redirect to login page |
| User attempts to access page not authorized for their role | Display error message: Access denied, redirect to dashboard |
| Patient attempts to book appointment for past date | Display error message: Cannot book appointments for past dates |
| Patient attempts to book appointment during unavailable time slot | Display error message: Selected time slot is not available |
| Doctor attempts to approve already approved appointment | Display error message: Appointment is already approved |
| Patient attempts to cancel already completed appointment | Display error message: Cannot cancel completed appointments |
| Database connection fails | Display error message: Database connection error, log error |
| Email sending fails | Log error, display message: Failed to send email notification |
| User session expires | Redirect to login page with message: Session expired, please login again |
| User attempts to delete department with associated doctors | Display error message: Cannot delete department with associated doctors |
| Administrator attempts to delete their own account | Display error message: Cannot delete your own account |

## 6. Acceptance Criteria

1. Visitor accesses landing page, views features, and clicks Register button
2. Patient registers account with email, password, personal information, and logs in
3. Patient books appointment by selecting department, doctor, date, time slot, and reason
4. Doctor logs in, views pending appointment in Today's Appointments, and approves appointment
5. Patient receives notification of appointment approval
6. Doctor marks appointment as completed after consultation
7. Doctor writes consultation notes including diagnosis and prescription, saves record
8. Patient views consultation record in Consultation History and downloads consultation summary

## 7. Features Not Implemented in This Version

- Video consultation functionality
- Payment processing for appointments
- Prescription printing
- SMS notifications
- Multi-language support
- Patient-to-patient messaging
- Doctor-to-doctor consultation
- Appointment rating and review system
- Insurance integration
- Lab test results integration
- Pharmacy integration
- Telemedicine features
- Mobile application (iOS/Android)
- Real-time chat support
- Appointment waitlist
- Automated appointment scheduling based on AI recommendations
- Advanced analytics and predictive insights
- Integration with wearable health devices
- Blockchain-based medical records
- Voice-activated appointment booking