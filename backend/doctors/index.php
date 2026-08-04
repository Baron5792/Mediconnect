<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}
// if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
//     http_response_code(403);
//     echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
//     exit();
// }

$page    = max(1, (int)($_GET['page'] ?? 1));
$perPage = min(100, (int)($_GET['per_page'] ?? 10));
$offset  = ($page - 1) * $perPage;

$where  = ['u.role = "doctor"'];
$params = [];
$types  = '';

if (!empty($_GET['search'])) {
    $s = '%' . $_GET['search'] . '%';
    $where[]  = '(u.full_name LIKE ? OR dp.specialization LIKE ? OR dept.name LIKE ?)';
    $params[] = $s; $params[] = $s; $params[] = $s;
    $types   .= 'sss';
}
if (!empty($_GET['department_id'])) {
    $where[]  = 'dp.department_id = ?';
    $params[] = (int)$_GET['department_id'];
    $types   .= 'i';
}
if (isset($_GET['is_active']) && $_GET['is_active'] !== '') {
    $where[]  = 'u.is_active = ?';
    $params[] = (int)$_GET['is_active'];
    $types   .= 'i';
}

$ws   = implode(' AND ', $where);
$base = "FROM users u
         LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
         LEFT JOIN departments dept   ON dept.id    = dp.department_id
         WHERE $ws";

$countStmt = $connection->prepare("SELECT COUNT(*) $base");
if (!empty($params)) {
    $refs = []; foreach ($params as $k => $v) $refs[$k] = &$params[$k];
    $countStmt->bind_param($types, ...$refs);
}
$countStmt->execute();
$cntResult = $countStmt->get_result();
$total = (int)$cntResult->fetch_row()[0];
$cntResult->free(); $countStmt->close();

$listParams = array_merge($params, [$perPage, $offset]);
$listTypes  = $types . 'ii';
$listStmt = $connection->prepare(
    "SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at,
            dp.specialization, dp.license_number, dp.bio,
            dp.consultation_fee, dp.experience_years, dp.department_id,
            dept.name AS department_name
     $base ORDER BY u.full_name ASC LIMIT ? OFFSET ?"
);
$refs2 = []; foreach ($listParams as $k => $v) $refs2[$k] = &$listParams[$k];
$listStmt->bind_param($listTypes, ...$refs2);
$listStmt->execute();
$listResult = $listStmt->get_result();
$rows = [];
while ($row = $listResult->fetch_assoc()) $rows[] = $row;
$listResult->free(); $listStmt->close();

echo json_encode([
    'status' => 'success', 'message' => 'OK',
    'data'   => [
        'doctors'    => $rows,
        'pagination' => ['total' => $total, 'page' => $page, 'per_page' => $perPage, 'total_pages' => (int)ceil($total / max($perPage, 1))]
    ]
]);
exit();
