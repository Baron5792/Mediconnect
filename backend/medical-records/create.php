<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user']) || !in_array($_SESSION['user']['role'],['doctor','admin'])) {
    http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
}
$user = $_SESSION['user'];

$data       = json_decode(file_get_contents('php://input'), true) ?? [];
$patientId  = (int)($data['patient_id'] ?? 0);
$recordType = $data['record_type'] ?? null;
$title      = trim($data['title'] ?? '');
$description= $data['description'] ?? null;
$recordDate = $data['record_date']  ?? date('Y-m-d');

if (!$patientId)   { http_response_code(400); echo json_encode(['status'=>'error','message'=>'patient_id is required']); exit(); }
if (empty($title)) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'title is required']); exit(); }

$chk = $connection->prepare('SELECT id FROM users WHERE id=? AND role="patient"');
$chk->bind_param('i', $patientId);
$chk->execute();
$chkR = $chk->get_result(); $found = $chkR->fetch_assoc(); $chkR->free(); $chk->close();
if (!$found) {
    http_response_code(404); echo json_encode(['status'=>'error','message'=>'Patient not found']); exit();
}

$stmt = $connection->prepare(
    'INSERT INTO medical_records (patient_id, created_by, record_type, title, description, record_date) VALUES (?,?,?,?,?,?)'
);
$stmt->bind_param('iissss', $patientId, $user['id'], $recordType, $title, $description, $recordDate);
$stmt->execute();
$newId = (int) $connection->insert_id;

http_response_code(201);
echo json_encode(['status'=>'success','message'=>'Medical record created','data'=>['id'=>$newId]]);
exit();
