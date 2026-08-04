<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'doctor') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
    exit();
}

$user = $_SESSION['user'];

$page    = max(1, (int)($_GET['page'] ?? 1));
$perPage = min(50, (int)($_GET['per_page'] ?? 20));
$offset  = ($page - 1) * $perPage;

$cntStmt = $connection->prepare(
    'SELECT COUNT(DISTINCT a.patient_id) FROM appointments a WHERE a.doctor_id = ? AND a.status IN ("completed", "confirmed")'
);
$cntStmt->bind_param('i', $user['id']);
$cntStmt->execute();
$cntResult = $cntStmt->get_result();
$total = (int)$cntResult->fetch_row()[0];
$cntResult->free(); $cntStmt->close();

$stmt = $connection->prepare(
    "SELECT u.id, u.full_name, u.email, u.phone,
            pp.date_of_birth, pp.gender, pp.blood_type,
            MAX(a.appointment_date) AS last_visit,
            COUNT(a.id) AS total_visits
     FROM appointments a
     JOIN users u ON u.id = a.patient_id
     LEFT JOIN patient_profiles pp ON pp.user_id = u.id
     WHERE a.doctor_id = ? AND a.status IN ('confirmed', 'completed')
     GROUP BY u.id, u.full_name, u.email, u.phone, pp.date_of_birth, pp.gender, pp.blood_type
     ORDER BY last_visit DESC
     LIMIT ? OFFSET ?"
);
$stmt->bind_param('iii', $user['id'], $perPage, $offset);
$stmt->execute();
$listResult = $stmt->get_result();
$rows = [];
while ($row = $listResult->fetch_assoc()) $rows[] = $row;
$listResult->free(); $stmt->close();

echo json_encode([
    'status' => 'success', 'message' => 'OK',
    'data'   => [
        'patients'   => $rows,
        'pagination' => ['total' => $total, 'page' => $page, 'per_page' => $perPage, 'total_pages' => (int)ceil($total / max($perPage,1))]
    ]
]);
exit();
