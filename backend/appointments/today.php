<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

date_default_timezone_set('Africa/Lagos');

header('Content-Type: application/json');

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
    $_SESSION['user']['role'] !== 'doctor'
) {
    http_response_code(403);
    echo json_encode([
        'status' => 'error',
        'message' => 'Forbidden'
    ]);
    exit();
}

$user = $_SESSION['user'];
$today = date('Y-m-d');

$stmt = $connection->prepare("
    SELECT
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.reason,
        a.notes,

        pat.id AS patient_id,
        pat.full_name AS patient_name,
        pat.phone AS patient_phone,
        pat.email AS patient_email

    FROM appointments a

    INNER JOIN users pat
        ON pat.id = a.patient_id

    WHERE
        a.doctor_id = ?
        AND a.appointment_date = ?
        AND a.status IN ('pending','confirmed')

    ORDER BY
        a.appointment_time ASC
");

$stmt->bind_param(
    "is",
    $user['id'],
    $today
);

$stmt->execute();

$result = $stmt->get_result();

$appointments = [];

while ($row = $result->fetch_assoc()) {
    $appointments[] = $row;
}

$result->free();
$stmt->close();

echo json_encode([
    'status' => 'success',
    'message' => 'Today appointments retrieved successfully.',
    'data' => $appointments,
    'count' => count($appointments),
    'today' => $today
]);

exit();