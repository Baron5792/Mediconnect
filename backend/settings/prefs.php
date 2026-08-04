<?php
require_once __DIR__ . '/../config/required.php';
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
if (!in_array($method, ['GET','PUT'])) {
    http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit();
}
if (empty($_SESSION['user'])) {
    http_response_code(401); echo json_encode(['status'=>'error','message'=>'Unauthorized']); exit();
}
$user = $_SESSION['user'];

if ($method === 'GET') {
    $stmt = $connection->prepare('SELECT pref_key, pref_value FROM user_preferences WHERE user_id=?');
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $r = $stmt->get_result(); $out = [];
    while ($row = $r->fetch_assoc()) $out[$row['pref_key']] = $row['pref_value'];
    $r->free(); $stmt->close();
    echo json_encode(['status'=>'success','message'=>'OK','data'=>$out]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
foreach ($data as $key => $value) {
    $chk = $connection->prepare('SELECT id FROM user_preferences WHERE user_id=? AND pref_key=?');
    $chk->bind_param('is', $user['id'], $key);
    $chk->execute();
    $chkR = $chk->get_result(); $exists = $chkR->fetch_assoc(); $chkR->free(); $chk->close();
    if ($exists) {
        $upd = $connection->prepare('UPDATE user_preferences SET pref_value=? WHERE user_id=? AND pref_key=?');
        $upd->bind_param('sis', $value, $user['id'], $key);
        $upd->execute(); $upd->close();
    } else {
        $ins = $connection->prepare('INSERT INTO user_preferences (user_id, pref_key, pref_value) VALUES (?,?,?)');
        $ins->bind_param('iss', $user['id'], $key, $value);
        $ins->execute(); $ins->close();
    }
}
echo json_encode(['status'=>'success','message'=>'Preferences saved','data'=>null]);
exit();
