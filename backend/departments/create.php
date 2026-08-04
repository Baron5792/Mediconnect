<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$name = trim($data['name'] ?? '');
$desc = $data['description'] ?? null;

if (empty($name)) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'Department name is required']); exit(); }

$stmt = $connection->prepare('INSERT INTO departments (name, description) VALUES (?,?)');
$stmt->bind_param('ss', $name, $desc);
$stmt->execute();
$newId = (int) $connection->insert_id;

http_response_code(201);
echo json_encode(['status'=>'success','message'=>'Department created','data'=>['id'=>$newId]]);
exit();
