<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user']) || !in_array($_SESSION['user']['role'],['patient','admin'])) {
    http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
}
$user = $_SESSION['user'];

$data      = json_decode(file_get_contents('php://input'), true) ?? [];
$doctorId  = (int)($data['doctor_id'] ?? 0);
$date      = $data['appointment_date'] ?? '';
$time      = $data['appointment_time'] ?? '';
$reason    = $data['reason'] ?? null;
$patientId = $user['role'] === 'admin' ? (int)($data['patient_id'] ?? 0) : $user['id'];

if (!$doctorId)   { http_response_code(400); echo json_encode(['status'=>'error','message'=>'doctor_id is required']); exit(); }
if (empty($date)) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'appointment_date is required']); exit(); }
if (empty($time)) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'appointment_time is required']); exit(); }
if (!$patientId)  { http_response_code(400); echo json_encode(['status'=>'error','message'=>'patient_id is required']); exit(); }

$chk = $connection->prepare('SELECT id FROM users WHERE id = ? AND role = "doctor" AND is_active = 1');
$chk->bind_param('i', $doctorId);
$chk->execute();
$chkR = $chk->get_result(); $docFound = $chkR->fetch_assoc(); $chkR->free(); $chk->close();
if (!$docFound) {
    http_response_code(400); echo json_encode(['status'=>'error','message'=>'Doctor not found']); exit();
}

$conflict = $connection->prepare(
    'SELECT id FROM appointments WHERE doctor_id=? AND appointment_date=? AND appointment_time=? AND status NOT IN ("cancelled","rejected")'
);
$conflict->bind_param('iss', $doctorId, $date, $time);
$conflict->execute();
$cR = $conflict->get_result(); $hasConflict = $cR->fetch_assoc(); $cR->free(); $conflict->close();
if ($hasConflict) {
    http_response_code(400); echo json_encode(['status'=>'error','message'=>'This time slot is already booked']); exit();
}

$stmt = $connection->prepare(
    'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason) VALUES (?,?,?,?,?)'
);
$stmt->bind_param('iisss', $patientId, $doctorId, $date, $time, $reason);
$stmt->execute();
$newId = (int) $connection->insert_id;

http_response_code(201);
echo json_encode(['status'=>'success','message'=>'Appointment booked successfully','data'=>['id'=>$newId]]);
exit();
