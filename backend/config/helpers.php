<?php
// ============================================================
// helpers.php — Shared utilities for all API files
// ============================================================

// ── JSON helpers ───────────────────────────────────────────
function json_ok($data = null, string $message = 'OK', int $code = 200): void {
    // Discard ALL levels of output buffering (handles nested ob_start calls)
    while (ob_get_level() > 0) ob_end_clean();
    http_response_code($code);
    echo json_encode(['status' => 'success', 'message' => $message, 'data' => $data]);
    exit;
}

function json_err(string $message = 'An error occurred', int $code = 400): void {
    while (ob_get_level() > 0) ob_end_clean();
    http_response_code($code);
    echo json_encode(['status' => 'error', 'message' => $message]);
    exit;
}

// ── Session auth ───────────────────────────────────────────
function start_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_name(SESSION_NAME);
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path'     => '/',
            'domain'   => '',
            'secure'   => false,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

function current_user(): ?array {
    start_session();
    return $_SESSION['user'] ?? null;
}

function require_auth(array $roles = []): array {
    $user = current_user();
    if (!$user) json_err('Unauthenticated. Please log in.', 401);
    if ($roles && !in_array($user['role'], $roles)) json_err('You do not have permission.', 403);
    return $user;
}

// ── Input ──────────────────────────────────────────────────
function get_input(): array {
    $raw  = file_get_contents('php://input');
    $json = json_decode($raw, true) ?? [];
    return array_merge($_GET, $_POST, $json);
}

function sanitize(string $value): string {
    return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
}

// Coerce empty string → null for optional fields
function s(?string $v): ?string { return ($v === '' || $v === null) ? null : $v; }

// ── Pagination ─────────────────────────────────────────────
function paginate(int $total, int $page, int $perPage): array {
    return [
        'total'       => $total,
        'page'        => $page,
        'per_page'    => $perPage,
        'total_pages' => (int) ceil($total / max($perPage, 1)),
    ];
}

// ── MySQLi query helpers ───────────────────────────────────
// Tries get_result() (mysqlnd); falls back to bind_result (libmysqlclient/XAMPP).

function _stmt_fetch_rows(mysqli_stmt $stmt): array {
    // mysqlnd path
    if (function_exists('mysqli_stmt_get_result')) {
        $res = $stmt->get_result();
        return $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
    }
    // libmysqlclient path
    $stmt->store_result();
    $meta = $stmt->result_metadata();
    if (!$meta) return [];
    $row = [];
    while ($f = $meta->fetch_field()) $row[$f->name] = null;
    $refs = [];
    foreach ($row as $k => &$v) $refs[] = &$v;
    unset($v);
    call_user_func_array([$stmt, 'bind_result'], $refs);
    $out = [];
    while ($stmt->fetch()) {
        $copy = [];
        foreach ($row as $k => $v) $copy[$k] = $v;
        $out[] = $copy;
    }
    $stmt->free_result();
    return $out;
}

function _stmt_prepare(mysqli $conn, string $sql, string $types, array $params): mysqli_stmt {
    $stmt = $conn->prepare($sql);
    if (!$stmt) json_err('Query error: ' . $conn->error, 500);
    if ($params) {
        if ($types === '') {
            $types = '';
            foreach ($params as $p) {
                if (is_int($p))    $types .= 'i';
                elseif (is_float($p)) $types .= 'd';
                else                  $types .= 's';
            }
        }
        $stmt->bind_param($types, ...$params);
    }
    return $stmt;
}

function db_rows(mysqli $conn, string $sql, string $types = '', array $params = []): array {
    $stmt = _stmt_prepare($conn, $sql, $types, $params);
    $stmt->execute();
    return _stmt_fetch_rows($stmt);
}

function db_row(mysqli $conn, string $sql, string $types = '', array $params = []): ?array {
    $rows = db_rows($conn, $sql, $types, $params);
    return $rows[0] ?? null;
}

function db_scalar(mysqli $conn, string $sql, string $types = '', array $params = []) {
    $stmt = _stmt_prepare($conn, $sql, $types, $params);
    $stmt->execute();
    // mysqlnd path
    if (function_exists('mysqli_stmt_get_result')) {
        $res = $stmt->get_result();
        if (!$res) return null;
        $row = $res->fetch_row();
        return $row[0] ?? null;
    }
    // libmysqlclient path
    $stmt->store_result();
    $val = null;
    $stmt->bind_result($val);
    $stmt->fetch();
    $stmt->free_result();
    return $val;
}

function db_exec(mysqli $conn, string $sql, string $types = '', array $params = []): mysqli_stmt {
    $stmt = _stmt_prepare($conn, $sql, $types, $params);
    $stmt->execute();
    return $stmt;
}

// ── Activity log ───────────────────────────────────────────
function log_activity(mysqli $conn, ?int $userId, string $action, string $description = ''): void {
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
    db_exec($conn,
        'INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) VALUES (?,?,?,?,?)',
        'issss', [$userId, $action, $description, $ip, $ua]
    );
}

// ── Notification ───────────────────────────────────────────
function notify(mysqli $conn, int $userId, string $title, string $message, string $type = 'info'): void {
    db_exec($conn,
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)',
        'isss', [$userId, $title, $message, $type]
    );
}
