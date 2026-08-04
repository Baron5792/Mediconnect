<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user'])) {
    http_response_code(401); echo json_encode(['status'=>'error','message'=>'Unauthorized']); exit();
}
$user = $_SESSION['user'];

$stmt = $connection->prepare('UPDATE notifications SET is_read=1 WHERE user_id=?');
$stmt->bind_param('i', $user['id']);
$stmt->execute();

echo json_encode(['status'=>'success','message'=>'All notifications marked as read','data'=>null]);
exit();
