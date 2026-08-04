<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit();
}

if (
    empty($_SESSION['user']) ||
    !in_array($_SESSION['user']['role'], ['doctor', 'patient'])
) {
    http_response_code(403);
    echo json_encode([
        'status' => 'error',
        'message' => 'Forbidden'
    ]);
    exit();
}

$user = $_SESSION['user'];

$page = max(1, (int)($_GET['page'] ?? 1));
$perPage = min(50, max(1, (int)($_GET['per_page'] ?? 10)));
$offset = ($page - 1) * $perPage;

$col = $user['role'] === 'doctor'
    ? 'a.doctor_id'
    : 'a.patient_id';

/*
|--------------------------------------------------------------------------
| Status filter
|--------------------------------------------------------------------------
|
| Examples:
| ?status=confirmed
| ?status=completed
| ?status=completed,cancelled,rejected
|
*/

$status = trim($_GET['status'] ?? '');

$where = "$col = ?";
$params = [$user['id']];
$types = "i";

if ($status !== '') {

    $statuses = array_map('trim', explode(',', $status));

    $placeholders = implode(',', array_fill(0, count($statuses), '?'));

    $where .= " AND a.status IN ($placeholders)";

    foreach ($statuses as $s) {
        $params[] = $s;
        $types .= "s";
    }
}

/*
|--------------------------------------------------------------------------
| Count
|--------------------------------------------------------------------------
*/

$countSql = "
SELECT COUNT(*)
FROM appointments a
WHERE $where
";

$countStmt = $connection->prepare($countSql);
$countStmt->bind_param($types, ...$params);
$countStmt->execute();

$countResult = $countStmt->get_result();
$total = (int)$countResult->fetch_row()[0];

$countResult->free();
$countStmt->close();

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

$listSql = "
SELECT
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.reason,
    a.notes,
    a.cancelled_reason,
    a.created_at,

    doc.id AS doctor_id,
    doc.full_name AS doctor_name,

    pat.id AS patient_id,
    pat.full_name AS patient_name

FROM appointments a

JOIN users doc
    ON doc.id = a.doctor_id

JOIN users pat
    ON pat.id = a.patient_id

WHERE $where

ORDER BY
    a.appointment_date DESC,
    a.appointment_time DESC

LIMIT ? OFFSET ?
";

$params[] = $perPage;
$params[] = $offset;
$types .= "ii";

$listStmt = $connection->prepare($listSql);
$listStmt->bind_param($types, ...$params);
$listStmt->execute();

$listResult = $listStmt->get_result();

$appointments = [];

while ($row = $listResult->fetch_assoc()) {
    $appointments[] = $row;
}

$listResult->free();
$listStmt->close();

/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    'status' => 'success',
    'message' => 'Appointments retrieved successfully.',
    'data' => [
        'appointments' => $appointments,
        'pagination' => [
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => max(1, (int)ceil($total / $perPage))
        ]
    ]
]);

exit();