-- ============================================================
-- Mediconnect — Full Database Schema
-- MySQL 8.0+ | UTF-8mb4 | InnoDB
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`    VARCHAR(150)  NOT NULL,
  `email`        VARCHAR(191)  NOT NULL UNIQUE,
  `password`     VARCHAR(255)  NOT NULL,
  `role`         ENUM('admin','doctor','patient') NOT NULL DEFAULT 'patient',
  `phone`        VARCHAR(20)   DEFAULT NULL,
  `is_active`    TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Password reset tokens ──────────────────────────────────
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`    INT UNSIGNED NOT NULL,
  `token`      VARCHAR(100) NOT NULL UNIQUE,
  `expires_at` DATETIME     NOT NULL,
  `used`       TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Departments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `departments` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`        VARCHAR(120) NOT NULL UNIQUE,
  `description` TEXT         DEFAULT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Doctor profiles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `doctor_profiles` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`          INT UNSIGNED NOT NULL UNIQUE,
  `department_id`    INT UNSIGNED DEFAULT NULL,
  `specialization`   VARCHAR(120)   DEFAULT NULL,
  `license_number`   VARCHAR(60)    DEFAULT NULL,
  `bio`              TEXT           DEFAULT NULL,
  `experience_years` SMALLINT UNSIGNED DEFAULT 0,
  `consultation_fee` DECIMAL(8,2)   DEFAULT NULL,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`)       REFERENCES `users`(`id`)       ON DELETE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Patient profiles ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `patient_profiles` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`        INT UNSIGNED NOT NULL UNIQUE,
  `date_of_birth`  DATE         DEFAULT NULL,
  `gender`         ENUM('male','female','other') DEFAULT NULL,
  `address`        TEXT         DEFAULT NULL,
  `blood_type`     VARCHAR(5)   DEFAULT NULL,
  `allergies`      TEXT         DEFAULT NULL,
  `emergency_contact_name`  VARCHAR(120) DEFAULT NULL,
  `emergency_contact_phone` VARCHAR(20)  DEFAULT NULL,
  `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Doctor schedules ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `doctor_schedules` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `doctor_id`    INT UNSIGNED NOT NULL,
  `day_of_week`  ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time`   TIME         NOT NULL,
  `end_time`     TIME         NOT NULL,
  `is_available` TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Appointments ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `appointments` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `patient_id`       INT UNSIGNED NOT NULL,
  `doctor_id`        INT UNSIGNED NOT NULL,
  `appointment_date` DATE         NOT NULL,
  `appointment_time` TIME         NOT NULL,
  `reason`           TEXT         DEFAULT NULL,
  `status`           ENUM('pending','confirmed','completed','cancelled','rejected') NOT NULL DEFAULT 'pending',
  `notes`            TEXT         DEFAULT NULL,
  `cancelled_reason` TEXT         DEFAULT NULL,
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_doctor_id`  (`doctor_id`),
  INDEX `idx_date`       (`appointment_date`),
  INDEX `idx_status`     (`status`),
  FOREIGN KEY (`patient_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`)  REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Consultations ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `consultations` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `appointment_id`   INT UNSIGNED NOT NULL,
  `patient_id`       INT UNSIGNED NOT NULL,
  `doctor_id`        INT UNSIGNED NOT NULL,
  `diagnosis`        TEXT         DEFAULT NULL,
  `prescription`     TEXT         DEFAULT NULL,
  `recommendations`  TEXT         DEFAULT NULL,
  `notes`            TEXT         DEFAULT NULL,
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_patient_id` (`patient_id`),
  INDEX `idx_doctor_id`  (`doctor_id`),
  FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`)     REFERENCES `users`(`id`)        ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`)      REFERENCES `users`(`id`)        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Medical records ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `medical_records` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `patient_id`   INT UNSIGNED NOT NULL,
  `doctor_id`    INT UNSIGNED DEFAULT NULL,
  `title`        VARCHAR(200) NOT NULL,
  `record_type`  ENUM('diagnosis','prescription','lab','imaging','other') NOT NULL DEFAULT 'other',
  `diagnosis`    TEXT         DEFAULT NULL,
  `treatment`    TEXT         DEFAULT NULL,
  `prescriptions` TEXT        DEFAULT NULL,
  `notes`        TEXT         DEFAULT NULL,
  `file_path`    VARCHAR(300) DEFAULT NULL,
  `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_patient_id` (`patient_id`),
  FOREIGN KEY (`patient_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`)  REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Notifications ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`    INT UNSIGNED NOT NULL,
  `title`      VARCHAR(200) NOT NULL,
  `message`    TEXT         DEFAULT NULL,
  `type`       VARCHAR(60)  DEFAULT 'info',
  `is_read`    TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_read` (`user_id`, `is_read`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Activity logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`     INT UNSIGNED DEFAULT NULL,
  `action`      VARCHAR(100) NOT NULL,
  `description` TEXT         DEFAULT NULL,
  `ip_address`  VARCHAR(45)  DEFAULT NULL,
  `user_agent`  TEXT         DEFAULT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id`  (`user_id`),
  INDEX `idx_created`  (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── System settings ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT       DEFAULT NULL,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── User preferences ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id`                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`               INT UNSIGNED NOT NULL UNIQUE,
  `email_notifications`   TINYINT(1) NOT NULL DEFAULT 1,
  `appointment_reminders` TINYINT(1) NOT NULL DEFAULT 1,
  `sms_notifications`     TINYINT(1) NOT NULL DEFAULT 0,
  `updated_at`            DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed: default admin account ─────────────────────────────
-- Password: Admin@1234  (bcrypt hash)
INSERT IGNORE INTO `users` (`full_name`, `email`, `password`, `role`) VALUES
  ('System Administrator', 'admin@mediconnect.com', '$2y$12$eImiTXuWVxfM37uY4JANjQe5ds5f/kizJsRJe8yNjkJ2cS8vMzWky', 'admin');

-- ── Seed: departments ──────────────────────────────────────
INSERT IGNORE INTO `departments` (`name`, `description`) VALUES
  ('General Practice',    'Primary care and general health consultations'),
  ('Cardiology',          'Heart and cardiovascular system'),
  ('Paediatrics',         'Medical care for children'),
  ('Gynaecology',         'Women\'s health and reproductive care'),
  ('Orthopaedics',        'Bones, joints, and musculoskeletal system'),
  ('Dermatology',         'Skin, hair, and nail conditions'),
  ('Ophthalmology',       'Eye care and vision'),
  ('Neurology',           'Brain and nervous system'),
  ('Psychiatry',          'Mental health and well-being'),
  ('Oncology',            'Cancer diagnosis and treatment');

-- ── Seed: default system settings ─────────────────────────
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES
  ('site_name',                    'Mediconnect'),
  ('site_email',                   'admin@mediconnect.com'),
  ('support_phone',                '+233 000 000 000'),
  ('notifications_enabled',        '1'),
  ('appointment_reminder_hours',   '24');

SET FOREIGN_KEY_CHECKS = 1;
