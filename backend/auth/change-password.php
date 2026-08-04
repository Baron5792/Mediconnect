<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

if (empty($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Please log in.']);
    exit();
}
$user = $_SESSION['user'];

$data    = json_decode(file_get_contents('php://input'), true) ?? [];
$current = $data['current_password'] ?? '';
$new     = $data['new_password'] ?? '';

if (empty($current) || empty($new)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Current and new passwords are required']);
    exit();
}
if (strlen($new) < 8) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'New password must be at least 8 characters']);
    exit();
}

$stmt = $connection->prepare('SELECT password FROM users WHERE id = ?');
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$r = $stmt->get_result(); $row = $r->fetch_assoc(); $r->free(); $stmt->close();

if (!$row || !password_verify($current, $row['password'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Current password is incorrect']);
    exit();
}

$hash = password_hash($new, PASSWORD_BCRYPT, ['cost' => 12]);
$stmt2 = $connection->prepare('UPDATE users SET password = ? WHERE id = ?');
$stmt2->bind_param('si', $hash, $user['id']);
$stmt2->execute();

echo json_encode(['status' => 'success', 'message' => 'Password changed successfully', 'data' => null]);
exit();
