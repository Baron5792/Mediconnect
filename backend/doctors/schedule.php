<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
if (!in_array($method, ['GET', 'POST', 'DELETE'])) {
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

if ($method === 'GET') {
    $stmt = $connection->prepare(
        'SELECT * FROM doctor_schedules WHERE doctor_id = ?
         ORDER BY FIELD(day_of_week,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), start_time'
    );
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $r = $stmt->get_result(); $rows = [];
    while ($row = $r->fetch_assoc()) $rows[] = $row;
    $r->free(); $stmt->close();
    echo json_encode(['status' => 'success', 'message' => 'OK', 'data' => $rows]);
    exit();
}

if ($method === 'POST') {
    $data      = json_decode(file_get_contents('php://input'), true) ?? [];
    $day       = $data['day_of_week'] ?? '';
    $startTime = $data['start_time']  ?? '';
    $endTime   = $data['end_time']    ?? '';
    $days      = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

    if (!in_array($day, $days))               { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Invalid day_of_week']); exit(); }
    if (empty($startTime) || empty($endTime)) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'start_time and end_time are required']); exit(); }
    if ($startTime >= $endTime)               { http_response_code(400); echo json_encode(['status'=>'error','message'=>'end_time must be after start_time']); exit(); }

    $stmt = $connection->prepare(
        'INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time) VALUES (?,?,?,?)'
    );
    $stmt->bind_param('isss', $user['id'], $day, $startTime, $endTime);
    $stmt->execute();
    $newId = (int) $connection->insert_id;

    http_response_code(201);
    echo json_encode(['status' => 'success', 'message' => 'Schedule slot added', 'data' => ['id' => $newId]]);
    exit();
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Slot ID is required']); exit(); }

    $chk = $connection->prepare('SELECT id FROM doctor_schedules WHERE id = ? AND doctor_id = ?');
    $chk->bind_param('ii', $id, $user['id']);
    $chk->execute();
    $chkR = $chk->get_result(); $found = $chkR->fetch_assoc(); $chkR->free(); $chk->close();
    if (!$found) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Slot not found']);
        exit();
    }

    $stmt = $connection->prepare('DELETE FROM doctor_schedules WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'message' => 'Schedule slot deleted', 'data' => null]);
    exit();
}
