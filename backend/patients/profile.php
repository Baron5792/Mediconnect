<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
if (!in_array($method, ['GET','PUT'])) {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'patient') {
    http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
}
$user = $_SESSION['user'];

if ($method === 'GET') {
    $stmt = $connection->prepare(
        "SELECT u.id, u.full_name, u.email, u.phone, u.created_at,
                pp.date_of_birth, pp.gender, pp.address, pp.blood_type,
                pp.allergies, pp.emergency_contact_name, pp.emergency_contact_phone
         FROM users u LEFT JOIN patient_profiles pp ON pp.user_id = u.id WHERE u.id = ?"
    );
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    echo json_encode(['status'=>'success','message'=>'OK','data'=>$row]);
    exit();
}

$data     = json_decode(file_get_contents('php://input'), true) ?? [];
$fullName = trim($data['full_name'] ?? $user['full_name']);
$phone    = $data['phone'] ?? null;

$stmt = $connection->prepare('UPDATE users SET full_name=?, phone=? WHERE id=?');
$stmt->bind_param('ssi', $fullName, $phone, $user['id']);
$stmt->execute();

$dob    = $data['date_of_birth'] ?? null;
$gender = $data['gender'] ?? null;
$addr   = $data['address'] ?? null;
$blood  = $data['blood_type'] ?? null;
$allergy= $data['allergies'] ?? null;
$ecName = $data['emergency_contact_name'] ?? null;
$ecPhone= $data['emergency_contact_phone'] ?? null;

$stmt2 = $connection->prepare(
    'UPDATE patient_profiles SET date_of_birth=?,gender=?,address=?,blood_type=?,allergies=?,emergency_contact_name=?,emergency_contact_phone=? WHERE user_id=?'
);
$stmt2->bind_param('sssssssi', $dob,$gender,$addr,$blood,$allergy,$ecName,$ecPhone,$user['id']);
$stmt2->execute();

$_SESSION['user']['full_name'] = $fullName;
echo json_encode(['status'=>'success','message'=>'Profile updated successfully','data'=>null]);
exit();
