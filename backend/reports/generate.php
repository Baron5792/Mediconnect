<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
}

$data       = json_decode(file_get_contents('php://input'), true) ?? [];
$reportType = $data['type']      ?? 'overview';
$dateFrom   = $data['date_from'] ?? date('Y-m-01');
$dateTo     = $data['date_to']   ?? date('Y-m-d');
$result     = [];

if (in_array($reportType, ['overview','appointments'])) {
    $stmt = $connection->prepare(
        "SELECT COUNT(*) AS total, SUM(status='completed') AS completed,
                SUM(status='cancelled') AS cancelled, SUM(status='pending') AS pending
         FROM appointments WHERE appointment_date BETWEEN ? AND ?"
    );
    $stmt->bind_param('ss', $dateFrom, $dateTo);
    $stmt->execute();
    $r = $stmt->get_result(); $result['appointments'] = $r->fetch_assoc(); $r->free(); $stmt->close();
}

if (in_array($reportType, ['overview','doctors'])) {
    $stmt = $connection->prepare(
        "SELECT COUNT(*) AS total, SUM(is_active=1) AS active, SUM(is_active=0) AS inactive FROM users WHERE role='doctor'"
    );
    $stmt->execute();
    $r = $stmt->get_result(); $result['doctors'] = $r->fetch_assoc(); $r->free(); $stmt->close();
}

if (in_array($reportType, ['overview','patients'])) {
    $stmt = $connection->prepare(
        "SELECT COUNT(*) AS total, SUM(is_active=1) AS active FROM users WHERE role='patient'"
    );
    $stmt->execute();
    $r = $stmt->get_result(); $result['patients'] = $r->fetch_assoc(); $r->free(); $stmt->close();
}

if (in_array($reportType, ['overview','consultations'])) {
    $from = $dateFrom . ' 00:00:00';
    $to   = $dateTo   . ' 23:59:59';
    $stmt = $connection->prepare("SELECT COUNT(*) AS total FROM consultations WHERE created_at BETWEEN ? AND ?");
    $stmt->bind_param('ss', $from, $to);
    $stmt->execute();
    $r = $stmt->get_result(); $result['consultations'] = $r->fetch_assoc(); $r->free(); $stmt->close();
}

if ($reportType === 'monthly') {
    $stmt = $connection->prepare(
        "SELECT DATE_FORMAT(appointment_date,'%Y-%m') AS month, COUNT(*) AS total, SUM(status='completed') AS completed
         FROM appointments WHERE appointment_date BETWEEN ? AND ?
         GROUP BY month ORDER BY month ASC"
    );
    $stmt->bind_param('ss', $dateFrom, $dateTo);
    $stmt->execute();
    $r = $stmt->get_result(); $rows = [];
    while ($row = $r->fetch_assoc()) $rows[] = $row;
    $r->free(); $stmt->close();
    $result['monthly_appointments'] = $rows;
}

if ($reportType === 'department') {
    $stmt = $connection->prepare(
        "SELECT dept.name AS department, COUNT(a.id) AS total_appointments, SUM(a.status='completed') AS completed
         FROM appointments a
         JOIN doctor_profiles dp ON dp.user_id = a.doctor_id
         JOIN departments dept   ON dept.id    = dp.department_id
         WHERE a.appointment_date BETWEEN ? AND ?
         GROUP BY dept.id, dept.name ORDER BY total_appointments DESC"
    );
    $stmt->bind_param('ss', $dateFrom, $dateTo);
    $stmt->execute();
    $r = $stmt->get_result(); $rows = [];
    while ($row = $r->fetch_assoc()) $rows[] = $row;
    $r->free(); $stmt->close();
    $result['by_department'] = $rows;
}

echo json_encode(['status'=>'success','message'=>'OK','data'=>[
    'report_type'=> $reportType,
    'date_from'  => $dateFrom,
    'date_to'    => $dateTo,
    'data'       => $result
]]);
exit();
