<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];

if (empty($data['full_name'])) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'full_name is required']); exit(); }
if (empty($data['email']))     { http_response_code(400); echo json_encode(['status'=>'error','message'=>'email is required']); exit(); }
if (empty($data['password']))  { http_response_code(400); echo json_encode(['status'=>'error','message'=>'password is required']); exit(); }
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Invalid email address']); exit(); }
if (strlen($data['password']) < 8) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Password must be at least 8 characters']); exit(); }

$email = strtolower(trim($data['email']));
$chk   = $connection->prepare('SELECT id FROM users WHERE email = ?');
$chk->bind_param('s', $email);
$chk->execute();
$chkR = $chk->get_result(); $emailExists = $chkR->fetch_assoc(); $chkR->free(); $chk->close();
if ($emailExists) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email already in use']);
    exit();
}

$fullName = trim($data['full_name']);
$hash     = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
$phone    = $data['phone'] ?? null;
$role     = 'doctor';

$connection->begin_transaction();
try {
    $stmt = $connection->prepare('INSERT INTO users (full_name, email, password, role, phone) VALUES (?,?,?,?,?)');
    $stmt->bind_param('sssss', $fullName, $email, $hash, $role, $phone);
    $stmt->execute();
    $uid = (int) $connection->insert_id;

    $spec   = $data['specialization'] ?? null;
    $lic    = $data['license_number'] ?? null;
    $fee    = isset($data['consultation_fee'])  ? (float)$data['consultation_fee']  : null;
    $exp    = isset($data['experience_years'])  ? (int)$data['experience_years']    : null;
    $deptId = !empty($data['department_id'])    ? (int)$data['department_id']       : null;
    $bio    = $data['bio'] ?? null;

    $stmt2 = $connection->prepare(
        'INSERT INTO doctor_profiles (user_id, specialization, license_number, consultation_fee, experience_years, department_id, bio)
         VALUES (?,?,?,?,?,?,?)'
    );
    $stmt2->bind_param('issdisi', $uid, $spec, $lic, $fee, $exp, $deptId, $bio);
    $stmt2->execute();

    $connection->commit();
    http_response_code(201);
    echo json_encode(['status' => 'success', 'message' => 'Doctor created successfully', 'data' => ['id' => $uid]]);
    exit();
} catch (Exception $e) {
    $connection->rollback();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to create doctor. Please try again.']);
    exit();
}
