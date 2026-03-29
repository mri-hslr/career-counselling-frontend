export function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = decodeJWT(token);
  if (!payload) return null;
  return {
    userId: payload.user_id,
    email: payload.sub,
    role: payload.role || 'student',
  };
}

export function getUserDisplayName() {
  const stored = localStorage.getItem('harmony_profile_name');
  if (stored) return stored;
  const user = getCurrentUser();
  if (!user) return 'there';
  // Format email into a name: "alex.johnson@..." → "Alex"
  return user.email.split('@')[0].split('.')[0].replace(/\d+/g, '').replace(/^./, c => c.toUpperCase()) || 'there';
}
