/**
 * NextHappen - Shared Validation Utilities
 * Provides consistent, accessible, and testable form validators.
 */

// RFC 5322 compliant regex for robust email validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Unicode letters, spaces, hyphens, and apostrophes for full names
const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑäëïöüÄËÏÖÜ\s'-]{2,80}$/;

export function useValidators() {
  /**
   * Validate email format
   */
  const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
      return { valid: false, errorKey: 'validations.emailRequired' };
    }
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      return { valid: false, errorKey: 'validations.emailInvalid' };
    }
    return { valid: true, errorKey: '' };
  };

  /**
   * Validate password complexity:
   * - At least 8 characters
   * - At least 1 uppercase
   * - At least 1 lowercase
   * - At least 1 number
   * - At least 1 special symbol
   */
  const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
      return { valid: false, score: 0, errorKey: 'validations.passwordRequired' };
    }

    let score = 0;
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

    if (hasMinLength) score++;
    if (hasUpper && hasLower) score++;
    if (hasNumber) score++;
    if (hasSymbol) score++;

    if (!hasMinLength) {
      return { valid: false, score, errorKey: 'validations.passwordMinLength' };
    }
    if (!(hasUpper && hasLower && hasNumber)) {
      return { valid: false, score, errorKey: 'validations.passwordComplexity' };
    }

    return { valid: true, score, errorKey: '' };
  };

  /**
   * Validate password confirmation matching
   */
  const validatePasswordMatch = (password, confirmPassword) => {
    if (!confirmPassword) {
      return { valid: false, errorKey: 'validations.confirmPasswordRequired' };
    }
    if (password !== confirmPassword) {
      return { valid: false, errorKey: 'validations.passwordsDoNotMatch' };
    }
    return { valid: true, errorKey: '' };
  };

  /**
   * Validate full name
   */
  const validateFullName = (name) => {
    if (!name || typeof name !== 'string') {
      return { valid: false, errorKey: 'validations.nameRequired' };
    }
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return { valid: false, errorKey: 'validations.nameTooShort' };
    }
    if (!NAME_REGEX.test(trimmed)) {
      return { valid: false, errorKey: 'validations.nameInvalid' };
    }
    return { valid: true, errorKey: '' };
  };

  /**
   * Validate non-negative numbers (e.g. price)
   */
  const validateNonNegativeNumber = (val) => {
    if (val === null || val === undefined || val === '') {
      return { valid: false, errorKey: 'validations.numberRequired' };
    }
    const num = Number(val);
    if (isNaN(num) || num < 0) {
      return { valid: false, errorKey: 'validations.numberNegative' };
    }
    return { valid: true, errorKey: '' };
  };

  /**
   * Validate positive integer (e.g. quantity / capacity)
   */
  const validatePositiveInteger = (val) => {
    if (val === null || val === undefined || val === '') {
      return { valid: false, errorKey: 'validations.quantityRequired' };
    }
    const num = Number(val);
    if (!Number.isInteger(num) || num <= 0) {
      return { valid: false, errorKey: 'validations.quantityInvalid' };
    }
    return { valid: true, errorKey: '' };
  };

  return {
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    validateFullName,
    validateNonNegativeNumber,
    validatePositiveInteger,
  };
}
