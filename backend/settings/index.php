<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
if (!in_array($method, ['GET','PUT'])) {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403); echo json_encode(['status'=>'error','message'=>'Forbidden']); exit();
}

if ($method === 'GET') {
    $stmt = $connection->prepare('SELECT setting_key, setting_value FROM system_settings ORDER BY setting_key');
    $stmt->execute();
    $r = $stmt->get_result(); $out = [];
    while ($row = $r->fetch_assoc()) $out[$row['setting_key']] = $row['setting_value'];
    $r->free(); $stmt->close();
    echo json_encode(['status'=>'success','message'=>'OK','data'=>$out]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
foreach ($data as $key => $value) {
    $chk = $connection->prepare('SELECT id FROM system_settings WHERE setting_key=?');
    $chk->bind_param('s', $key);
    $chk->execute();
    $chkR = $chk->get_result(); $exists = $chkR->fetch_assoc(); $chkR->free(); $chk->close();
    if ($exists) {
        $upd = $connection->prepare('UPDATE system_settings SET setting_value=? WHERE setting_key=?');
        $upd->bind_param('ss', $value, $key);
        $upd->execute(); $upd->close();
    } else {
        $ins = $connection->prepare('INSERT INTO system_settings (setting_key, setting_value) VALUES (?,?)');
        $ins->bind_param('ss', $key, $value);
        $ins->execute(); $ins->close();
    }
}
echo json_encode(['status'=>'success','message'=>'Settings saved','data'=>null]);
exit();
