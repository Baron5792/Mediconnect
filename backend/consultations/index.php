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

$cntStmt = $connection->prepare("SELECT COUNT(*) FROM consultations");
$cntStmt->execute();
$cntResult = $cntStmt->get_result();
$total = (int)$cntResult->fetch_row()[0];
$cntResult->free(); $cntStmt->close();

$stmt = $connection->prepare(
    "SELECT c.id, c.diagnosis, c.prescription, c.notes, c.created_at,
            doc.full_name AS doctor_name, pat.full_name AS patient_name,
            a.appointment_date
     FROM consultations c
     JOIN appointments a ON a.id = c.appointment_id
     JOIN users doc ON doc.id = c.doctor_id
     JOIN users pat ON pat.id = c.patient_id
     ORDER BY c.created_at DESC LIMIT ? OFFSET ?"
);
$stmt->bind_param('ii', $perPage, $offset);
$stmt->execute();
$listResult = $stmt->get_result();
$rows = [];
while ($r = $listResult->fetch_assoc()) $rows[] = $r;
$listResult->free(); $stmt->close();

echo json_encode(['status'=>'success','message'=>'OK','data'=>[
    'consultations'=> $rows,
    'pagination'   => ['total'=>$total,'page'=>$page,'per_page'=>$perPage,'total_pages'=>(int)ceil($total/max($perPage,1))]
]]);
exit();
