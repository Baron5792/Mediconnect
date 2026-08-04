<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
if (!in_array($method, ['GET', 'PUT'])) {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'doctor') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
    exit();
}
$user = $_SESSION['user'];

if ($method === 'GET') {
    $stmt = $connection->prepare(
        "SELECT u.id, u.full_name, u.email, u.phone, u.created_at,
                dp.specialization, dp.license_number, dp.bio,
                dp.consultation_fee, dp.experience_years, dp.department_id,
                dept.name AS department_name
         FROM users u
         LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
         LEFT JOIN departments dept   ON dept.id    = dp.department_id
         WHERE u.id = ?"
    );
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    echo json_encode(['status' => 'success', 'message' => 'OK', 'data' => $row]);
    exit();
}

$data     = json_decode(file_get_contents('php://input'), true) ?? [];
$fullName = trim($data['full_name'] ?? $user['full_name']);
$phone    = $data['phone'] ?? null;

$stmt = $connection->prepare('UPDATE users SET full_name = ?, phone = ? WHERE id = ?');
$stmt->bind_param('ssi', $fullName, $phone, $user['id']);
$stmt->execute();

$spec   = $data['specialization'] ?? null;
$lic    = $data['license_number'] ?? null;
$fee    = isset($data['consultation_fee'])  ? (float)$data['consultation_fee']  : null;
$exp    = isset($data['experience_years'])  ? (int)$data['experience_years']    : null;
$deptId = !empty($data['department_id'])    ? (int)$data['department_id']       : null;
$bio    = $data['bio'] ?? null;

$stmt2 = $connection->prepare(
    'UPDATE doctor_profiles SET specialization=?, license_number=?, consultation_fee=?, experience_years=?, department_id=?, bio=? WHERE user_id=?'
);
$stmt2->bind_param('ssdissi', $spec, $lic, $fee, $exp, $deptId, $bio, $user['id']);
$stmt2->execute();

$_SESSION['user']['full_name'] = $fullName;

echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully', 'data' => null]);
exit();
