<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user']) || !in_array($_SESSION['user']['role'],['doctor','patient'])) {
    http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
}
$user  = $_SESSION['user'];
$today = date('Y-m-d');
$col   = $user['role'] === 'doctor' ? 'a.doctor_id' : 'a.patient_id';

$page    = max(1, (int)($_GET['page']     ?? 1));
$perPage = min(50, (int)($_GET['per_page'] ?? 20));
$offset  = ($page - 1) * $perPage;
$from    = $_GET['from'] ?? $today;
$to      = $_GET['to']   ?? '';

$where  = ["$col = ?", "a.appointment_date >= ?", "a.status IN ('pending','confirmed')"];
$params = [$user['id'], $from];
$types  = 'is';

if (!empty($to)) {
    $where[]  = 'a.appointment_date <= ?';
    $params[] = $to;
    $types   .= 's';
}

$ws   = implode(' AND ', $where);
$base = "FROM appointments a
         JOIN users doc ON doc.id = a.doctor_id
         JOIN users pat ON pat.id = a.patient_id
         WHERE $ws";

$cntStmt = $connection->prepare("SELECT COUNT(*) $base");
$cntRefs = []; foreach ($params as $k => $v) $cntRefs[$k] = &$params[$k];
$cntStmt->bind_param($types, ...$cntRefs);
$cntStmt->execute();
$cntResult = $cntStmt->get_result();
$total = (int)$cntResult->fetch_row()[0];
$cntResult->free(); $cntStmt->close();

$listParams = array_merge($params, [$perPage, $offset]);
$listTypes  = $types . 'ii';
$listStmt = $connection->prepare(
    "SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason,
            doc.full_name AS doctor_name, pat.full_name AS patient_name
     $base ORDER BY a.appointment_date ASC, a.appointment_time ASC
     LIMIT ? OFFSET ?"
);
$listRefs = []; foreach ($listParams as $k => $v) $listRefs[$k] = &$listParams[$k];
$listStmt->bind_param($listTypes, ...$listRefs);
$listStmt->execute();
$r = $listStmt->get_result(); $rows = [];
while ($row = $r->fetch_assoc()) $rows[] = $row;
$r->free(); $listStmt->close();

echo json_encode([
    'status'     => 'success',
    'message'    => 'OK',
    'data'       => $rows,
    'pagination' => [
        'total'       => $total,
        'page'        => $page,
        'per_page'    => $perPage,
        'total_pages' => (int)ceil($total / max($perPage, 1))
    ]
]);
exit();
