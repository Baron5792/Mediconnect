import { get, post } from './api';

// Log in a user — returns { status, data: { user, token }, message }
export async function loginUser(email, password, remember) {
  return post('/auth/login.php', { email, password, remember });
}

// Register a new patient account — returns { status, message }
export async function registerUser(data) {
  return post('/auth/register.php', data);
}

// Log out the current session — returns { status, message }
export async function logoutUser() {
  return post('/auth/logout.php', {});
}

// Get the currently authenticated user — returns { status, data: { user } }
export async function getMe() {
  return get('/auth/me.php');
}

// Send a password-reset email — returns { status, message }
export async function forgotPassword(email) {
  return post('/auth/forgot-password.php', { email });
}

// Set a new password using a reset token — returns { status, message }
export async function resetPassword(token, password, confirm) {
  return post('/auth/reset-password.php', { token, password, confirm_password: confirm });
}

// Change the password for the logged-in user — returns { status, message }
export async function changePassword(current, next, confirm) {
  return post('/auth/change-password.php', { current_password: current, new_password: next, confirm_password: confirm });
}

// Update profile info (full_name, phone) for the logged-in user — returns { status, message, data: { user } }
export async function updateProfile(data) {
  return post('/auth/update-profile.php', data);
}
