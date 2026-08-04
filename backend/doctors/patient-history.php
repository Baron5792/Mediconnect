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

$patientId = (int)($_GET['patient_id'] ?? 0);
if (!$patientId) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'patient_id is required']); exit(); }

$chk = $connection->prepare('SELECT id FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1');
$chk->bind_param('ii', $user['id'], $patientId);
$chk->execute();
$chkResult = $chk->get_result(); $found = $chkResult->fetch_assoc(); $chkResult->free(); $chk->close();
if (!$found) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Patient not found in your records']);
    exit();
}

$stmt1 = $connection->prepare(
    "SELECT mr.*, u.full_name AS created_by_name
     FROM medical_records mr
     LEFT JOIN users u ON u.id = mr.created_by
     WHERE mr.patient_id = ? ORDER BY mr.record_date DESC"
);
$stmt1->bind_param('i', $patientId);
$stmt1->execute();
$r1 = $stmt1->get_result(); $records = [];
while ($r = $r1->fetch_assoc()) $records[] = $r;
$r1->free(); $stmt1->close();

$stmt2 = $connection->prepare(
    "SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason, a.notes
     FROM appointments a WHERE a.doctor_id = ? AND a.patient_id = ? ORDER BY a.appointment_date DESC"
);
$stmt2->bind_param('ii', $user['id'], $patientId);
$stmt2->execute();
$r2 = $stmt2->get_result(); $appointments = [];
while ($r = $r2->fetch_assoc()) $appointments[] = $r;
$r2->free(); $stmt2->close();

$stmt3 = $connection->prepare(
    "SELECT u.id, u.full_name, u.email, u.phone,
            pp.date_of_birth, pp.gender, pp.blood_type, pp.allergies, pp.address
     FROM users u LEFT JOIN patient_profiles pp ON pp.user_id = u.id WHERE u.id = ?"
);
$stmt3->bind_param('i', $patientId);
$stmt3->execute();
$r3 = $stmt3->get_result(); $patient = $r3->fetch_assoc(); $r3->free(); $stmt3->close();

echo json_encode([
    'status' => 'success', 'message' => 'OK',
    'data'   => ['patient' => $patient, 'medical_records' => $records, 'appointments' => $appointments]
]);
exit();
