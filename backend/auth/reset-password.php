<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

$data     = json_decode(file_get_contents('php://input'), true) ?? [];
$token    = $data['token'] ?? '';
$password = $data['password'] ?? '';

if (empty($token) || empty($password)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Token and new password are required']);
    exit();
}
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 8 characters']);
    exit();
}

$stmt = $connection->prepare('SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()');
$stmt->bind_param('s', $token);
$stmt->execute();
$r = $stmt->get_result(); $reset = $r->fetch_assoc(); $r->free(); $stmt->close();

if (!$reset) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid or expired reset token']);
    exit();
}

$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

$stmt2 = $connection->prepare('UPDATE users SET password = ? WHERE id = ?');
$stmt2->bind_param('si', $hash, $reset['user_id']);
$stmt2->execute();

$stmt3 = $connection->prepare('UPDATE password_resets SET used = 1 WHERE id = ?');
$stmt3->bind_param('i', $reset['id']);
$stmt3->execute();

echo json_encode(['status' => 'success', 'message' => 'Password reset successfully. You can now log in.', 'data' => null]);
exit();
