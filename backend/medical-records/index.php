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
$perPage = min(50, (int)($_GET['per_page'] ?? 10));
$offset  = ($page - 1) * $perPage;

$where=[]; $params=[]; $types='';
if (!empty($_GET['patient_id'])) { $where[]='mr.patient_id=?'; $params[]=(int)$_GET['patient_id']; $types.='i'; }
if (!empty($_GET['doctor_id']))  { $where[]='mr.created_by=?'; $params[]=(int)$_GET['doctor_id'];  $types.='i'; }

$ws   = $where ? implode(' AND ', $where) : '1=1';
$base = "FROM medical_records mr JOIN users pat ON pat.id=mr.patient_id LEFT JOIN users doc ON doc.id=mr.created_by WHERE $ws";

$cntStmt = $connection->prepare("SELECT COUNT(*) $base");
if (!empty($params)) { $refs=[]; foreach($params as $k=>$v) $refs[$k]=&$params[$k]; $cntStmt->bind_param($types,...$refs); }
$cntStmt->execute();
$cntResult = $cntStmt->get_result();
$total = (int)$cntResult->fetch_row()[0];
$cntResult->free(); $cntStmt->close();

$listParams = array_merge($params, [$perPage, $offset]);
$listTypes  = $types . 'ii';
$listStmt = $connection->prepare(
    "SELECT mr.id, mr.record_date, mr.record_type, mr.title, mr.description, mr.created_at,
            pat.full_name AS patient_name, doc.full_name AS doctor_name
     $base ORDER BY mr.record_date DESC LIMIT ? OFFSET ?"
);
$refs2=[]; foreach($listParams as $k=>$v) $refs2[$k]=&$listParams[$k];
$listStmt->bind_param($listTypes,...$refs2);
$listStmt->execute();
$listResult = $listStmt->get_result();
$rows = [];
while ($r = $listResult->fetch_assoc()) $rows[] = $r;
$listResult->free(); $listStmt->close();

echo json_encode(['status'=>'success','message'=>'OK','data'=>[
    'records'   => $rows,
    'pagination'=> ['total'=>$total,'page'=>$page,'per_page'=>$perPage,'total_pages'=>(int)ceil($total/max($perPage,1))]
]]);
exit();
