// Simple, dependency-free validation helpers. Kept pure/testable (no React, no I/O)
// so they can be covered directly by unit tests.

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Enter a valid email address.';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export function validateName(name) {
  if (!name || !name.trim()) return 'Name is required.';
  if (name.trim().length < 2) return 'Name must be at least 2 characters.';
  return null;
}

export function validateEventCode(code) {
  if (!code || !code.trim()) return 'Enter an invite code.';
  const trimmed = code.trim();
  if (trimmed.length < 4 || trimmed.length > 10) return 'Invite codes are 4-10 characters.';
  return null;
}
