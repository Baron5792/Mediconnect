<?php
/**
 * Mediconnect - Authentication Middleware
 * Provides session-based guard functions for route protection
 */

/**
 * Require any authenticated session. Aborts with 401 if not logged in.
 * @return array Current session user payload
 */
function requireAuth(): array {
    if (empty($_SESSION['user'])) {
        error('Unauthorized. Please log in.', 401);
    }
    return $_SESSION['user'];
}

/**
 * Require a specific role. Aborts with 403 on role mismatch.
 */
function requireRole(string ...$roles): array {
    $user = requireAuth();
    if (!in_array($user['role'], $roles, true)) {
        error('Forbidden. Insufficient permissions.', 403);
    }
    return $user;
}

/**
 * Return current session user or null (non-blocking)
 */
function currentUser(): ?array {
    return $_SESSION['user'] ?? null;
}

/**
 * Store user data in session after login
 */
function setSessionUser(array $user): void {
    $_SESSION['user'] = [
        'id'              => $user['id'],
        'email'           => $user['email'],
        'role'            => $user['role'],
        'full_name'       => $user['full_name'],
        'profile_picture' => $user['profile_picture'] ?? null,
        'is_active'       => $user['is_active'],
    ];
    session_regenerate_id(true);
}

/**
 * Destroy the session (logout)
 */
function destroySession(): void {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    session_destroy();
}
