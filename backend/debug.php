<?php
require_once __DIR__ . '/config/required.php';
require_once __DIR__ . '/config/database.php';

// Quick connectivity check — DELETE or password-protect before going live.

$report = [];
$report['php_version']    = PHP_VERSION;
$report['php_version_ok'] = version_compare(PHP_VERSION, '7.4', '>=');
$report['mysqli_loaded']  = extension_loaded('mysqli');
$report['db_connected']   = (bool) $connection;

if ($connection) {
    $tables_needed = ['users','doctors','patients','appointments','consultations',
                      'departments','notifications','activity_logs','settings',
                      'medical_records','doctor_schedules','password_resets'];
    $existing = [];
    $res = $connection->query("SHOW TABLES");
    while ($row = $res->fetch_row()) $existing[] = $row[0];
    $report['db_tables_found']   = $existing;
    $report['db_tables_missing'] = array_values(array_diff($tables_needed, $existing));
}

$report['request_origin'] = $_SERVER['HTTP_ORIGIN'] ?? '(no Origin header)';
$report['request_method'] = $_SERVER['REQUEST_METHOD'];

echo json_encode(['status' => 'ok', 'data' => $report], JSON_PRETTY_PRINT);
