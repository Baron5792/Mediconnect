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
$perPage = min(50, (int)($_GET['per_page'] ?? 10));
$offset  = ($page - 1) * $perPage;

$where=[]; $params=[]; $types='';

if ($user['role'] === 'doctor')  { $where[]='a.doctor_id = ?';  $params[]=$user['id']; $types.='i'; }
if ($user['role'] === 'patient') { $where[]='a.patient_id = ?'; $params[]=$user['id']; $types.='i'; }
if (!empty($_GET['status']))     { $where[]='a.status = ?';      $params[]=$_GET['status']; $types.='s'; }
if (!empty($_GET['date']))       { $where[]='a.appointment_date = ?'; $params[]=$_GET['date']; $types.='s'; }
if (!empty($_GET['doctor_id'])  && $user['role']==='admin') { $where[]='a.doctor_id = ?';  $params[]=(int)$_GET['doctor_id'];  $types.='i'; }
if (!empty($_GET['patient_id']) && in_array($user['role'],['admin','doctor'])) { $where[]='a.patient_id = ?'; $params[]=(int)$_GET['patient_id']; $types.='i'; }

$ws = $where ? implode(' AND ', $where) : '1=1';
$base = "FROM appointments a
         JOIN users doc ON doc.id = a.doctor_id
         JOIN users pat ON pat.id = a.patient_id
         WHERE $ws";

$cntStmt = $connection->prepare("SELECT COUNT(*) $base");
if (!empty($params)) { $refs=[]; foreach($params as $k=>$v) $refs[$k]=&$params[$k]; $cntStmt->bind_param($types,...$refs); }
$cntStmt->execute();
$cntResult = $cntStmt->get_result();
$total = (int)$cntResult->fetch_row()[0];
$cntResult->free(); $cntStmt->close();

$listParams = array_merge($params, [$perPage, $offset]);
$listTypes  = $types . 'ii';
$listStmt = $connection->prepare(
    "SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason, a.notes,
            a.cancelled_reason, a.created_at,
            doc.id AS doctor_id, doc.full_name AS doctor_name,
            pat.id AS patient_id, pat.full_name AS patient_name
     $base ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT ? OFFSET ?"
);
$refs2=[]; foreach($listParams as $k=>$v) $refs2[$k]=&$listParams[$k];
$listStmt->bind_param($listTypes,...$refs2);
$listStmt->execute();
$listResult = $listStmt->get_result();
$rows = [];
while ($r = $listResult->fetch_assoc()) $rows[] = $r;
$listResult->free(); $listStmt->close();

echo json_encode(['status'=>'success','message'=>'OK','data'=>[
    'appointments'=> $rows,
    'pagination'  => ['total'=>$total,'page'=>$page,'per_page'=>$perPage,'total_pages'=>(int)ceil($total/max($perPage,1))]
]]);
exit();
