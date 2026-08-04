<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user'])) {
    http_response_code(401); echo json_encode(['status'=>'error','message'=>'Unauthorized']); exit();
}

$doctorId = (int)($_GET['doctor_id'] ?? 0);
$date     = $_GET['date'] ?? '';
if (!$doctorId || empty($date)) {
    http_response_code(400); echo json_encode(['status'=>'error','message'=>'doctor_id and date are required']); exit();
}

$day = date('l', strtotime($date));
$stmt = $connection->prepare(
    'SELECT start_time, end_time FROM doctor_schedules WHERE doctor_id=? AND day_of_week=? AND is_available=1'
);
$stmt->bind_param('is', $doctorId, $day);
$stmt->execute();
$r1 = $stmt->get_result(); $schedule = [];
while ($row = $r1->fetch_assoc()) $schedule[] = $row;
$r1->free(); $stmt->close();

if (empty($schedule)) {
    echo json_encode(['status'=>'success','message'=>'No available slots for this day','data'=>[]]);
    exit();
}

$allSlots=[];
foreach ($schedule as $s) {
    $start = strtotime($s['start_time']);
    $end   = strtotime($s['end_time']);
    while ($start < $end) { $allSlots[] = date('H:i:s', $start); $start += 1800; }
}

$bkd = $connection->prepare(
    "SELECT appointment_time FROM appointments WHERE doctor_id=? AND appointment_date=? AND status NOT IN ('cancelled','rejected')"
);
$bkd->bind_param('is', $doctorId, $date);
$bkd->execute();
$r2 = $bkd->get_result(); $bookedTimes = [];
while ($row = $r2->fetch_assoc()) $bookedTimes[] = $row['appointment_time'];
$r2->free(); $bkd->close();

$available = array_values(array_filter($allSlots, fn($t) => !in_array($t, $bookedTimes)));
echo json_encode(['status'=>'success','message'=>'OK','data'=>$available]);
exit();
