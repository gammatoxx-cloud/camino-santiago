export interface PasswordRequirements {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
}

export const validatePassword = (password: string): PasswordRequirements => {
  return {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSymbol: /[^a-zA-Z0-9]/.test(password), // Matches any non-alphanumeric character
  };
};

export const isPasswordValid = (requirements: PasswordRequirements): boolean => {
  return (
    requirements.minLength &&
    requirements.hasLowercase &&
    requirements.hasUppercase &&
    requirements.hasDigit &&
    requirements.hasSymbol
  );
};
