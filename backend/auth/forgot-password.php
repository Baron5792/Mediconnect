<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

$data  = json_decode(file_get_contents('php://input'), true) ?? [];
$email = strtolower(trim($data['email'] ?? ''));

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email is required']);
    exit();
}

$stmt = $connection->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$r = $stmt->get_result(); $user = $r->fetch_assoc(); $r->free(); $stmt->close();

if (!$user) {
    echo json_encode(['status' => 'success', 'message' => 'If that email exists, a reset link has been sent', 'data' => null]);
    exit();
}

$token   = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

$stmt2 = $connection->prepare('DELETE FROM password_resets WHERE user_id = ?');
$stmt2->bind_param('i', $user['id']);
$stmt2->execute();

$stmt3 = $connection->prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?,?,?)');
$stmt3->bind_param('iss', $user['id'], $token, $expires);
$stmt3->execute();

echo json_encode(['status' => 'success', 'message' => 'Reset link generated', 'data' => ['token' => $token]]);
exit();
