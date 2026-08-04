/**
 * Mediconnect – Base API helper (Fetch-based, no Axios)
 * Per-file PHP backend: each path is a direct .php file URL.
 *
 * HOW REQUESTS ARE ROUTED
 * ─────────────────────────────────────────────────────────────────────────────
 * Development (npm run dev):
 *   Requests go to /api/... → Vite proxy strips /api and forwards to the PHP
 *   backend (default: http://localhost/mediconnect/backend). Same-origin → no
 *   CORS preflight at all. To override the backend target set VITE_BACKEND_URL
 *   in your .env (e.g. VITE_BACKEND_URL=http://localhost:8000).
 *
 * Production (built bundle):
 *   Set VITE_APP_API_URL to the full backend URL, e.g.:
 *     VITE_APP_API_URL=https://api.yourdomain.com/backend
 *   The PHP backend's .htaccess + cors.php will handle CORS for that domain.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Development: use /api so Vite proxies the request (no CORS).
// Production:  use the full URL from VITE_APP_API_URL env var.
const BASE_URL = (import.meta.env.VITE_APP_API_URL || '/api').replace(/\/$/, '');

async function request(method, path, body, isForm) {
  // path already includes .php extension and any ?query params
  const url = BASE_URL + path;
  const opts = {
    method,
    credentials: 'include', // send PHP session cookie
    headers: isForm ? {} : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  };
  if (body) opts.body = isForm ? body : JSON.stringify(body);

  let res;
  try {
    res = await fetch(url, opts);
  } catch (networkErr) {
    // fetch() throws a TypeError for both "backend down" AND "CORS blocked".
    // In development the Vite proxy eliminates CORS, so this is almost always
    // a genuine "backend not running" situation.
    console.error('[api] Network error —', url, networkErr.message);
    return {
      status: 'error',
      message: 'Cannot reach the server. Make sure XAMPP/Apache is running and the backend path is correct.',
    };
  }

  // Try to parse JSON for both success and error responses
  try {
    const data = await res.json();
    return data;
  } catch {
    // PHP returned HTML (error page, stray warning, etc.)
    return {
      status: 'error',
      message: res.ok
        ? `Server returned non-JSON response (HTTP ${res.status}). Check PHP error logs.`
        : `HTTP ${res.status} — check backend logs.`,
    };
  }
}

export const get       = (path)             => request('GET',    path, null,  false);
export const post      = (path, body)       => request('POST',   path, body,  false);
export const put       = (path, body)       => request('PUT',    path, body,  false);
export const patch     = (path, body)       => request('PATCH',  path, body,  false);
export const del       = (path)             => request('DELETE', path, null,  false);
export const postForm  = (path, formData)   => request('POST',   path, formData, true);
