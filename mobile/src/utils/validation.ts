export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (password.length < 6) return 'weak';
  if (score <= 2) return 'weak';
  if (score === 3) return 'medium';
  return 'strong';
};

export const getPasswordFeedback = (password: string): string => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  
  const missing = [];
  if (!/[a-z]/.test(password)) missing.push('lowercase letters');
  if (!/[A-Z]/.test(password)) missing.push('uppercase letters');
  if (!/\d/.test(password)) missing.push('numbers');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) missing.push('special characters');
  
  if (missing.length > 0) {
    return `Consider adding ${missing.join(', ')} to make your password stronger`;
  }
  
  return 'Strong password';
};

export const validateRegistrationData = (
  name: string,
  email: string,
  password: string
): { isValid: boolean; error?: string } => {
  if (!name || !email || !password) {
    return { isValid: false, error: 'Please fill in all fields' };
  }

  if (!validateName(name)) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (!validateEmail(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (!validatePassword(password)) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }

  return { isValid: true };
};

export const validateLoginData = (
  email: string,
  password: string
): { isValid: boolean; error?: string } => {
  if (!email || !password) {
    return { isValid: false, error: 'Please fill in all fields' };
  }

  if (!validateEmail(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};