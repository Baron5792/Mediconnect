<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user'])) {
    http_response_code(401); echo json_encode(['status'=>'error','message'=>'Unauthorized']); exit();
}
$user = $_SESSION['user'];

$page    = max(1, (int)($_GET['page'] ?? 1));
$perPage = min(50, (int)($_GET['per_page'] ?? 20));
$offset  = ($page - 1) * $perPage;

$cntStmt = $connection->prepare('SELECT COUNT(*) FROM notifications WHERE user_id=?');
$cntStmt->bind_param('i', $user['id']);
$cntStmt->execute();
$cntResult = $cntStmt->get_result();
$total = (int)$cntResult->fetch_row()[0];
$cntResult->free(); $cntStmt->close();

$stmt = $connection->prepare(
    'SELECT id, title, message, type, is_read, created_at FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?'
);
$stmt->bind_param('iii', $user['id'], $perPage, $offset);
$stmt->execute();
$listResult = $stmt->get_result();
$rows = [];
while ($r = $listResult->fetch_assoc()) $rows[] = $r;
$listResult->free(); $stmt->close();

$unreadStmt = $connection->prepare('SELECT COUNT(*) FROM notifications WHERE user_id=? AND is_read=0');
$unreadStmt->bind_param('i', $user['id']);
$unreadStmt->execute();
$unreadResult = $unreadStmt->get_result();
$unread = (int)$unreadResult->fetch_row()[0];
$unreadResult->free(); $unreadStmt->close();

echo json_encode(['status'=>'success','message'=>'OK','data'=>[
    'notifications'=> $rows,
    'unread_count' => $unread,
    'pagination'   => ['total'=>$total,'page'=>$page,'per_page'=>$perPage,'total_pages'=>(int)ceil($total/max($perPage,1))]
]]);
exit();
