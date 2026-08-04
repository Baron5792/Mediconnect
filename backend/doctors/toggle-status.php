<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
    exit();
}

$id = (int)($_GET['id'] ?? 0);
if (!$id) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Doctor ID is required']); exit(); }

$stmt = $connection->prepare('SELECT id, is_active FROM users WHERE id = ? AND role = "doctor"');
$stmt->bind_param('i', $id);
$stmt->execute();
$r = $stmt->get_result(); $doctor = $r->fetch_assoc(); $r->free(); $stmt->close();

if (!$doctor) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Doctor not found']);
    exit();
}

$newStatus = $doctor['is_active'] ? 0 : 1;
$stmt2 = $connection->prepare('UPDATE users SET is_active = ? WHERE id = ?');
$stmt2->bind_param('ii', $newStatus, $id);
$stmt2->execute();

$msg = $newStatus ? 'Doctor activated' : 'Doctor deactivated';
echo json_encode(['status' => 'success', 'message' => $msg, 'data' => ['is_active' => $newStatus]]);
exit();
