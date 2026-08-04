<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
}

$id   = (int)($_GET['id'] ?? 0);
$data = json_decode(file_get_contents('php://input'), true) ?? [];
$name = trim($data['name'] ?? '');
$desc = $data['description'] ?? null;

if (!$id)         { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Department ID is required']); exit(); }
if (empty($name)) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Department name is required']); exit(); }

$chk = $connection->prepare('SELECT id FROM departments WHERE id=?');
$chk->bind_param('i', $id);
$chk->execute();
$chkR = $chk->get_result(); $found = $chkR->fetch_assoc(); $chkR->free(); $chk->close();
if (!$found) {
    http_response_code(404); echo json_encode(['status'=>'error','message'=>'Department not found']); exit();
}

$stmt = $connection->prepare('UPDATE departments SET name=?, description=? WHERE id=?');
$stmt->bind_param('ssi', $name, $desc, $id);
$stmt->execute();

echo json_encode(['status'=>'success','message'=>'Department updated','data'=>null]);
exit();
