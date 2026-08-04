<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
}

$page    = max(1, (int)($_GET['page'] ?? 1));
$perPage = min(100, (int)($_GET['per_page'] ?? 20));
$offset  = ($page - 1) * $perPage;

$where=[]; $params=[]; $types='';
if (!empty($_GET['user_id'])) { $where[]='al.user_id=?'; $params[]=(int)$_GET['user_id']; $types.='i'; }
if (!empty($_GET['action']))  { $where[]='al.action=?';  $params[]=$_GET['action'];        $types.='s'; }

$ws   = $where ? implode(' AND ', $where) : '1=1';
$base = "FROM activity_logs al LEFT JOIN users u ON u.id=al.user_id WHERE $ws";

$cntStmt = $connection->prepare("SELECT COUNT(*) $base");
if (!empty($params)) { $refs=[]; foreach($params as $k=>$v) $refs[$k]=&$params[$k]; $cntStmt->bind_param($types,...$refs); }
$cntStmt->execute();
$cntResult = $cntStmt->get_result();
$total = (int)$cntResult->fetch_row()[0];
$cntResult->free(); $cntStmt->close();

$listParams = array_merge($params, [$perPage, $offset]);
$listTypes  = $types . 'ii';
$listStmt = $connection->prepare(
    "SELECT al.id, al.action, al.description, al.ip_address, al.created_at,
            u.full_name AS user_name, u.role AS user_role
     $base ORDER BY al.created_at DESC LIMIT ? OFFSET ?"
);
$refs2=[]; foreach($listParams as $k=>$v) $refs2[$k]=&$listParams[$k];
$listStmt->bind_param($listTypes,...$refs2);
$listStmt->execute();
$listResult = $listStmt->get_result();
$rows = [];
while ($r = $listResult->fetch_assoc()) $rows[] = $r;
$listResult->free(); $listStmt->close();

echo json_encode(['status'=>'success','message'=>'OK','data'=>[
    'logs'      => $rows,
    'pagination'=> ['total'=>$total,'page'=>$page,'per_page'=>$perPage,'total_pages'=>(int)ceil($total/max($perPage,1))]
]]);
exit();
