<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
    exit();
}

$id   = (int)($_GET['id'] ?? 0);
$data = json_decode(file_get_contents('php://input'), true) ?? [];

if (!$id) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Doctor ID is required']); exit(); }

$chk = $connection->prepare('SELECT id FROM users WHERE id = ? AND role = "doctor"');
$chk->bind_param('i', $id);
$chk->execute();
$chkR = $chk->get_result(); $found = $chkR->fetch_assoc(); $chkR->free(); $chk->close();
if (!$found) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Doctor not found']);
    exit();
}

$fullName = trim($data['full_name'] ?? '');
$phone    = $data['phone'] ?? null;

$stmt = $connection->prepare('UPDATE users SET full_name = ?, phone = ? WHERE id = ?');
$stmt->bind_param('ssi', $fullName, $phone, $id);
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
$stmt2->bind_param('ssdissi', $spec, $lic, $fee, $exp, $deptId, $bio, $id);
$stmt2->execute();

echo json_encode(['status' => 'success', 'message' => 'Doctor updated successfully', 'data' => null]);
exit();
