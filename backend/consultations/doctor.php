<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'doctor') {
    http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
}
$user = $_SESSION['user'];

$stmt = $connection->prepare(
    "SELECT c.id, c.diagnosis, c.prescription, c.notes, c.created_at,
            pat.full_name AS patient_name, a.appointment_date
     FROM consultations c
     JOIN appointments a ON a.id = c.appointment_id
     JOIN users pat ON pat.id = c.patient_id
     WHERE c.doctor_id=?
     ORDER BY c.created_at DESC"
);
$stmt->bind_param('i', $user['id']);
$stmt->execute();
$rows=[];
$result = $stmt->get_result();

$rows = [];

while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

$result->free();
$stmt->close();

echo json_encode(['status'=>'success','message'=>'OK','data'=>$rows]);
exit();
