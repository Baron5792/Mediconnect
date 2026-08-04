<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user'])) {
    http_response_code(401); echo json_encode(['status'=>'error','message'=>'Unauthorized']); exit();
}
$user = $_SESSION['user'];

$id = (int)($_GET['id'] ?? 0);
if (!$id) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Notification ID is required']); exit(); }

$chk = $connection->prepare('SELECT id FROM notifications WHERE id=? AND user_id=?');
$chk->bind_param('ii', $id, $user['id']);
$chk->execute();
$chkR = $chk->get_result(); $found = $chkR->fetch_assoc(); $chkR->free(); $chk->close();
if (!$found) {
    http_response_code(404); echo json_encode(['status'=>'error','message'=>'Notification not found']); exit();
}

$stmt = $connection->prepare('DELETE FROM notifications WHERE id=?');
$stmt->bind_param('i', $id);
$stmt->execute();

echo json_encode(['status'=>'success','message'=>'Notification deleted','data'=>null]);
exit();
