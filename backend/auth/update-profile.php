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

$data      = json_decode(file_get_contents('php://input'), true) ?? [];
$full_name = trim($data['full_name'] ?? '');
$phone     = trim($data['phone'] ?? '');

if (empty($full_name)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Full name is required']);
    exit();
}

$stmt = $connection->prepare('UPDATE users SET full_name = ?, phone = ? WHERE id = ?');
$stmt->bind_param('ssi', $full_name, $phone, $user['id']);
$stmt->execute();

// Refresh session with updated values
$_SESSION['user']['full_name'] = $full_name;
$_SESSION['user']['phone']     = $phone;

echo json_encode([
    'status'  => 'success',
    'message' => 'Profile updated successfully',
    'data'    => [
        'user' => [
            'id'        => $user['id'],
            'full_name' => $full_name,
            'email'     => $user['email'],
            'phone'     => $phone,
            'role'      => $user['role'],
        ],
    ],
]);
exit();
