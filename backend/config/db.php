<?php
// ============================================================
// db.php — MySQLi connection (include once per file)
// ============================================================

require_once __DIR__ . '/config.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);

if ($conn->connect_error) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$conn->set_charset(DB_CHARSET);
