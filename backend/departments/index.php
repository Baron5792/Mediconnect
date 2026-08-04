<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user'])) {
    http_response_code(401); echo json_encode(['status'=>'error','message'=>'Unauthorized']); exit();
}

$page    = max(1, (int)($_GET['page'] ?? 1));
$perPage = min(100, (int)($_GET['per_page'] ?? 20));
$offset  = ($page - 1) * $perPage;

$cntStmt = $connection->prepare("SELECT COUNT(*) FROM departments");
$cntStmt->execute();
$cntResult = $cntStmt->get_result();
$total = (int)$cntResult->fetch_row()[0];
$cntResult->free(); $cntStmt->close();

$stmt = $connection->prepare(
    "SELECT d.id, d.name, d.description, d.created_at, COUNT(dp.user_id) AS doctor_count
     FROM departments d
     LEFT JOIN doctor_profiles dp ON dp.department_id = d.id
     GROUP BY d.id, d.name, d.description, d.created_at
     ORDER BY d.name ASC LIMIT ? OFFSET ?"
);
$stmt->bind_param('ii', $perPage, $offset);
$stmt->execute();
$listResult = $stmt->get_result();
$rows = [];
while ($r = $listResult->fetch_assoc()) $rows[] = $r;
$listResult->free(); $stmt->close();

echo json_encode(['status'=>'success','message'=>'OK','data'=>[
    'departments'=> $rows,
    'pagination' => ['total'=>$total,'page'=>$page,'per_page'=>$perPage,'total_pages'=>(int)ceil($total/max($perPage,1))]
]]);
exit();
