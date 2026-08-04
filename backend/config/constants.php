<?php
/**
 * Mediconnect - Application Constants
 */

// Application base info
define('APP_NAME',    'Mediconnect');
define('APP_VERSION', '1.0.0');
define('APP_URL',     getenv('APP_URL') ?: 'http://localhost/mediconnect/backend');

// Frontend URL (for CORS and email links)
define('FRONTEND_URL', getenv('FRONTEND_URL') ?: 'http://localhost:5173');

// Upload settings
define('UPLOAD_DIR',      __DIR__ . '/../uploads/');
define('UPLOAD_URL',      APP_URL . '/uploads/');
define('MAX_FILE_SIZE',   5 * 1024 * 1024); // 5 MB
define('ALLOWED_IMAGES',  ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_DOCS',    ['application/pdf', 'image/jpeg', 'image/png', 'application/msword',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

// Session / security
define('SESSION_LIFETIME', 60 * 60 * 8); // 8 hours

// Password reset token expiry (seconds)
define('RESET_TOKEN_EXPIRY', 60 * 60 * 24); // 24 hours

// Pagination
define('DEFAULT_PER_PAGE', 15);

// Appointment settings
define('DEFAULT_SLOT_DURATION', 30); // minutes
define('MAX_APPOINTMENTS_PER_DAY', 20);
