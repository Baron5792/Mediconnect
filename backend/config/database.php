<?php
// Suppress PHP warnings/notices from polluting JSON responses
// ini_set('display_errors', '0');
// error_reporting(E_ALL);

// Set session cookie params before session_start().
// session_set_cookie_params() works on all PHP 7+ versions.
// SameSite=Lax via path hack works on PHP < 7.3; native array works on PHP 7.3+.
if (PHP_VERSION_ID >= 70300) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => false,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
} else {
    // PHP 7.2 and below: append SameSite to the path string (browser-level workaround)
    session_set_cookie_params(0, '/; SameSite=Lax', '', false, true);
}

// Only start session if one isn't already active (prevents "already started" warnings)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

define('DB_HOST',     'localhost');
define('DB_USER',     'root');
define('DB_PASSWORD', '');
define('DB_NAME',     'mediconnect');

$connection = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
if (!$connection) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit();
}
mysqli_set_charset($connection, 'utf8mb4');
