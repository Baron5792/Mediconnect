<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit();
}

$data     = json_decode(file_get_contents('php://input'), true) ?? [];
$fullName = trim($data['full_name'] ?? '');
$email    = strtolower(trim($data['email'] ?? ''));
$password = $data['password'] ?? '';
$role     = $data['role'] ?? '';
$phone    = $data['phone'] ?? null;

if (empty($fullName) || empty($email) || empty($password) || empty($role)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'full_name, email, password, and role are required']);
    exit();
}
if (!in_array($role, ['patient', 'doctor'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Role must be patient or doctor']);
    exit();
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid email address']);
    exit();
}
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 8 characters']);
    exit();
}

$stmt = $connection->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$r = $stmt->get_result(); $emailExists = $r->fetch_assoc(); $r->free(); $stmt->close();
if ($emailExists) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'An account with this email already exists']);
    exit();
}

$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

$connection->begin_transaction();
try {
    $stmt = $connection->prepare('INSERT INTO users (full_name, email, password, role, phone) VALUES (?,?,?,?,?)');
    $stmt->bind_param('sssss', $fullName, $email, $hash, $role, $phone);
    $stmt->execute();
    $userId = (int) $connection->insert_id;

    if ($role === 'patient') {
        $dob    = $data['date_of_birth'] ?? null;
        $gender = $data['gender'] ?? null;
        $addr   = $data['address'] ?? null;
        $stmt2  = $connection->prepare('INSERT INTO patient_profiles (user_id, date_of_birth, gender, address) VALUES (?,?,?,?)');
        $stmt2->bind_param('isss', $userId, $dob, $gender, $addr);
        $stmt2->execute();
    } else {
        $spec  = $data['specialization'] ?? null;
        $lic   = $data['license_number'] ?? null;
        $stmt2 = $connection->prepare('INSERT INTO doctor_profiles (user_id, specialization, license_number) VALUES (?,?,?)');
        $stmt2->bind_param('iss', $userId, $spec, $lic);
        $stmt2->execute();
    }

    $connection->commit();
    http_response_code(201);
    echo json_encode(['status' => 'success', 'message' => 'Account created successfully', 'data' => ['id' => $userId]]);
    exit();
} catch (Exception $e) {
    $connection->rollback();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Registration failed. Please try again.']);
    exit();
}
