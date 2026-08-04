<?php
// ============================================================
// cors.php — CORS headers + output isolation for all endpoints
//
// ob_start() and display_errors=0 MUST be the first two lines.
// Any PHP notice/warning printed before buffering starts will
// appear in the response body and break JSON parsing.
// ============================================================

// 1. Buffer ALL output immediately — before anything else runs.
//    This captures stray PHP warnings, notices, deprecations, etc.
ob_start();

// 2. Turn off error display to response body right away.
//    (Errors still go to the PHP error log — check that for debugging.)
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);

// 3. CORS — allowed frontend origins.
//    Covers every localhost port (Vite :5173, CRA :3000, etc.)
//    Add your production domain here when deploying.
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$is_localhost = (bool) preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin);

if ($is_localhost || in_array($origin, $allowed_origins, true)) {
    // Must echo the exact requesting origin — wildcard '*' is forbidden with credentials.
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 3600');
}

header('Content-Type: application/json; charset=utf-8');

// 4. Reply to OPTIONS preflight immediately.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit;
}
