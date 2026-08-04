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
$pass  = $data['password'] ?? '';

if (empty($email) || empty($pass)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email and password are required']);
    exit();
}

$stmt = $connection->prepare('SELECT * FROM users WHERE email = ? AND is_active = 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user || !password_verify($pass, $user['password'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
    exit();
}

$_SESSION['user'] = [
    'id'        => (int) $user['id'],
    'full_name' => $user['full_name'],
    'email'     => $user['email'],
    'role'      => $user['role'],
    'phone'     => $user['phone'],
];

echo json_encode(['status' => 'success', 'message' => 'Login successful', 'data' => $_SESSION['user']]);
exit();
