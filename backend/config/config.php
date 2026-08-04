<?php
// ============================================================
// Mediconnect — Database Configuration
// Copy this file to config.php and update values
// NEVER commit config.php to version control
// ============================================================

define('DB_HOST',     'localhost');
define('DB_NAME',     'mediconnect');
define('DB_USER',     'root');         // Change in production
define('DB_PASS',     '');             // Change in production
define('DB_CHARSET',  'utf8mb4');
define('DB_PORT',     3306);

// App settings
define('APP_ENV',     'development');  // 'production' in prod
define('APP_URL',     'http://localhost:8000');
define('FRONTEND_URL','http://localhost:5173');

// JWT / Session
define('SESSION_NAME',     'mc_session');
define('SESSION_LIFETIME', 86400 * 30);  // 30 days

// Email (PHPMailer)
define('MAIL_HOST',     'smtp.gmail.com');
define('MAIL_PORT',     587);
define('MAIL_USERNAME', 'your@gmail.com');
define('MAIL_PASSWORD', 'your_app_password');
define('MAIL_FROM',     'noreply@mediconnect.com');
define('MAIL_FROM_NAME','Mediconnect');

// File uploads
define('UPLOAD_DIR',      __DIR__ . '/../uploads/');
define('UPLOAD_MAX_SIZE', 5 * 1024 * 1024); // 5 MB
define('UPLOAD_ALLOWED',  ['jpg','jpeg','png','pdf','doc','docx']);
