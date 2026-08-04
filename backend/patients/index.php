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
$perPage = min(100, (int)($_GET['per_page'] ?? 10));
$offset  = ($page - 1) * $perPage;

$where  = ['u.role = "patient"'];
$params = [];
$types  = '';

if (!empty($_GET['search'])) {
    $s = '%' . $_GET['search'] . '%';
    $where[] = '(u.full_name LIKE ? OR u.email LIKE ?)';
    $params[] = $s; $params[] = $s; $types .= 'ss';
}
if (isset($_GET['is_active']) && $_GET['is_active'] !== '') {
    $where[] = 'u.is_active = ?'; $params[] = (int)$_GET['is_active']; $types .= 'i';
}

$ws   = implode(' AND ', $where);
$base = "FROM users u LEFT JOIN patient_profiles pp ON pp.user_id = u.id WHERE $ws";

$cntStmt = $connection->prepare("SELECT COUNT(*) $base");
if (!empty($params)) { $refs=[]; foreach($params as $k=>$v) $refs[$k]=&$params[$k]; $cntStmt->bind_param($types, ...$refs); }
$cntStmt->execute();
$cntResult = $cntStmt->get_result();
$total = (int)$cntResult->fetch_row()[0];
$cntResult->free(); $cntStmt->close();

$listParams = array_merge($params, [$perPage, $offset]);
$listTypes  = $types . 'ii';
$listStmt = $connection->prepare(
    "SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at,
            pp.date_of_birth, pp.gender, pp.blood_type, pp.address
     $base ORDER BY u.full_name ASC LIMIT ? OFFSET ?"
);
$refs2=[]; foreach($listParams as $k=>$v) $refs2[$k]=&$listParams[$k];
$listStmt->bind_param($listTypes, ...$refs2);
$listStmt->execute();
$listResult = $listStmt->get_result();
$rows = [];
while ($r = $listResult->fetch_assoc()) $rows[] = $r;
$listResult->free(); $listStmt->close();

echo json_encode(['status'=>'success','message'=>'OK','data'=>[
    'patients'  => $rows,
    'pagination'=> ['total'=>$total,'page'=>$page,'per_page'=>$perPage,'total_pages'=>(int)ceil($total/max($perPage,1))]
]]);
exit();
