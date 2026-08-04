<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

$_SESSION = [];
session_destroy();

echo json_encode(['status' => 'success', 'message' => 'Logged out successfully', 'data' => null]);
exit();
