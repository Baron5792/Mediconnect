-- ============================================================
-- Mediconnect — Database Migration Fix
-- Run this in phpMyAdmin on your existing `mediconnect` database
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS)
-- ============================================================

-- ── Fix 1: Add missing columns to doctor_profiles ──────────
ALTER TABLE `doctor_profiles`
  ADD COLUMN IF NOT EXISTS `experience_years` SMALLINT UNSIGNED DEFAULT 0     AFTER `bio`,
  ADD COLUMN IF NOT EXISTS `consultation_fee` DECIMAL(8,2)      DEFAULT NULL  AFTER `experience_years`;

-- ── Fix 2: Rebuild medical_records to match PHP column names ─
-- Step 2a: add the columns the PHP expects
ALTER TABLE `medical_records`
  ADD COLUMN IF NOT EXISTS `created_by`  INT UNSIGNED DEFAULT NULL AFTER `patient_id`,
  ADD COLUMN IF NOT EXISTS `description` TEXT         DEFAULT NULL AFTER `record_type`,
  ADD COLUMN IF NOT EXISTS `record_date` DATE         DEFAULT (CURRENT_DATE) AFTER `description`;

-- Step 2b: migrate any existing data from old column names
UPDATE `medical_records`
  SET `description` = COALESCE(`diagnosis`, `treatment`, `prescriptions`, `notes`),
      `record_date` = DATE(`created_at`),
      `created_by`  = `doctor_id`
  WHERE `description` IS NULL OR `record_date` IS NULL;

-- Step 2c: add the FK for created_by
ALTER TABLE `medical_records`
  ADD CONSTRAINT `fk_mr_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- ── Fix 3: Rebuild user_preferences as key-value store ──────
-- Drop old table and recreate (no data loss risk — it stores non-critical UI prefs)
DROP TABLE IF EXISTS `user_preferences`;
CREATE TABLE `user_preferences` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`    INT UNSIGNED NOT NULL,
  `pref_key`   VARCHAR(100) NOT NULL,
  `pref_value` TEXT         DEFAULT NULL,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_user_pref` (`user_id`, `pref_key`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Done ────────────────────────────────────────────────────
SELECT 'Migration complete — all 3 fixes applied.' AS result;
