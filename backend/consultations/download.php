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

$id = (int)($_GET['id'] ?? 0);
if (!$id) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Consultation ID is required']); exit(); }

$stmt = $connection->prepare(
    "SELECT c.*, doc.full_name AS doctor_name, pat.full_name AS patient_name, a.appointment_date
     FROM consultations c
     JOIN appointments a ON a.id = c.appointment_id
     JOIN users doc ON doc.id = c.doctor_id
     JOIN users pat ON pat.id = c.patient_id
     WHERE c.id=?"
);
$stmt->bind_param('i', $id);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();

if (!$row) { http_response_code(404); echo json_encode(['status'=>'error','message'=>'Consultation not found']); exit(); }

// Access check
if ($user['role'] === 'patient' && $row['patient_id'] !== $user['id']) {
    http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
}
if ($user['role'] === 'doctor' && $row['doctor_id'] !== $user['id']) {
    http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
}

// Return summary as JSON (frontend renders/prints it)
echo json_encode(['status'=>'success','message'=>'OK','data'=>$row]);
exit();
