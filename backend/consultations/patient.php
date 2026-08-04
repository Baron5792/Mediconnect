<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit();
}

if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'patient') {
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

/*
|--------------------------------------------------------------------------
| Total Records
|--------------------------------------------------------------------------
*/

$countStmt = $connection->prepare("
    SELECT COUNT(*)
    FROM consultations
    WHERE patient_id = ?
");

$countStmt->bind_param("i", $user['id']);
$countStmt->execute();

$countResult = $countStmt->get_result();
$total = (int)$countResult->fetch_row()[0];

$countResult->free();
$countStmt->close();

/*
|--------------------------------------------------------------------------
| Consultation List
|--------------------------------------------------------------------------
*/

$stmt = $connection->prepare("
    SELECT
        c.id,
        c.diagnosis,
        c.prescription,
        c.recommendations,
        c.notes,
        c.created_at,

        a.appointment_date,
        a.appointment_time,

        doc.full_name AS doctor_name

    FROM consultations c

    INNER JOIN appointments a
        ON a.id = c.appointment_id

    INNER JOIN users doc
        ON doc.id = c.doctor_id

    WHERE c.patient_id = ?

    ORDER BY c.created_at DESC

    LIMIT ? OFFSET ?
");

$stmt->bind_param(
    "iii",
    $user['id'],
    $perPage,
    $offset
);

$stmt->execute();

$result = $stmt->get_result();

$rows = [];

while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

$result->free();
$stmt->close();

echo json_encode([
    'status' => 'success',
    'message' => 'Consultations retrieved successfully.',
    'data' => $rows,
    'pagination' => [
        'total' => $total,
        'page' => $page,
        'per_page' => $perPage,
        'total_pages' => max(1, ceil($total / $perPage))
    ]
]);

exit();