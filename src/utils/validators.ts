/**
 * Validate an email address.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  // RFC-5322 simplified pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
}

/**
 * Validate a password.
 * Requirements: minimum 8 characters, at least one letter and one number.
 * Returns an error message string if invalid, or null if valid.
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  return null;
}

/**
 * Validate a display name or full name.
 * Requirements: 2–60 characters, letters, spaces, hyphens, and apostrophes only.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateName(name: string): string | null {
  if (!name || !name.trim()) {
    return 'Name is required.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return 'Name must be at least 2 characters long.';
  }
  if (trimmed.length > 60) {
    return 'Name must not exceed 60 characters.';
  }
  const nameRegex = /^[a-zA-Z\s\-'.]+$/;
  if (!nameRegex.test(trimmed)) {
    return 'Name may only contain letters, spaces, hyphens, and apostrophes.';
  }
  return null;
}

/**
 * Validate that a confirmation password matches the original.
 * Returns an error message string if they do not match, or null if they do.
 */
export function validateConfirmPassword(
  password: string,
  confirm: string,
): string | null {
  if (!confirm) {
    return 'Please confirm your password.';
  }
  if (password !== confirm) {
    return 'Passwords do not match.';
  }
  return null;
}

/**
 * Validate that a required field is not empty.
 * Returns an error message string if blank, or null if valid.
 *
 * @param value     - The field value to check.
 * @param fieldName - The human-readable field name used in the error message.
 */
export function validateRequired(
  value: string,
  fieldName: string,
): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} is required.`;
  }
  return null;
}
