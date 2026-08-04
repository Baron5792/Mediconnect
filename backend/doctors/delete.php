<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

$chk = $connection->prepare('SELECT id FROM users WHERE id = ? AND role = "doctor"');
$chk->bind_param('i', $id);
$chk->execute();
$chkR = $chk->get_result(); $found = $chkR->fetch_assoc(); $chkR->free(); $chk->close();
if (!$found) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Doctor not found']);
    exit();
}

$stmt = $connection->prepare('DELETE FROM users WHERE id = ?');
$stmt->bind_param('i', $id);
$stmt->execute();

echo json_encode(['status' => 'success', 'message' => 'Doctor deleted successfully', 'data' => null]);
exit();
