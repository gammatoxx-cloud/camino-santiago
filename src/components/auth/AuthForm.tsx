import React, { useState, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface AuthFormProps {
  onSignUp: (email: string, password: string) => Promise<{ error: any }>;
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  defaultMode?: 'signup' | 'signin';
}

interface PasswordRequirements {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
}

const validatePassword = (password: string): PasswordRequirements => {
  return {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };
};

const isPasswordValid = (requirements: PasswordRequirements): boolean => {
  return (
    requirements.minLength &&
    requirements.hasLowercase &&
    requirements.hasUppercase &&
    requirements.hasDigit &&
    requirements.hasSymbol
  );
};

export function AuthForm({ onSignUp, onSignIn, defaultMode = 'signin' }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRequirements = useMemo(
    () => (isSignUp ? validatePassword(password) : null),
    [password, isSignUp]
  );

  const isPasswordValidForSignUp = useMemo(
    () => passwordRequirements && isPasswordValid(passwordRequirements),
    [passwordRequirements]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password requirements for sign-up
    if (isSignUp && !isPasswordValidForSignUp) {
      setError('Por favor asegúrate de que tu contraseña cumpla con todos los requisitos');
      return;
    }

    setLoading(true);

    try {
      const result = isSignUp
        ? await onSignUp(email, password)
        : await onSignIn(email, password);

      if (result.error) {
        setError(result.error.message || 'Ocurrió un error');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-teal mb-6 text-center">
        {isSignUp ? 'Comienza tu Viaje' : 'Bienvenido de Nuevo'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 text-base rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/80"
            placeholder="your@email.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isSignUp ? 8 : undefined}
              className="w-full px-4 py-3 pr-12 text-base rounded-lg border-2 border-gray-200 focus:border-teal focus:outline-none bg-white/80"
              placeholder="••••••••"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-teal transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          {isSignUp && passwordRequirements && (
            <div className="mt-2 space-y-1.5">
              <div className="text-xs text-gray-600 font-medium mb-1.5">
                La contraseña debe contener:
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  {passwordRequirements.minLength ? (
                    <svg
                      className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  <span
                    className={
                      passwordRequirements.minLength
                        ? 'text-green-700'
                        : 'text-gray-600'
                    }
                  >
                    Al menos 8 caracteres
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  {passwordRequirements.hasLowercase ? (
                    <svg
                      className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  <span
                    className={
                      passwordRequirements.hasLowercase
                        ? 'text-green-700'
                        : 'text-gray-600'
                    }
                  >
                    Una letra minúscula
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  {passwordRequirements.hasUppercase ? (
                    <svg
                      className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  <span
                    className={
                      passwordRequirements.hasUppercase
                        ? 'text-green-700'
                        : 'text-gray-600'
                    }
                  >
                    Una letra mayúscula
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  {passwordRequirements.hasDigit ? (
                    <svg
                      className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  <span
                    className={
                      passwordRequirements.hasDigit
                        ? 'text-green-700'
                        : 'text-gray-600'
                    }
                  >
                    Un dígito
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  {passwordRequirements.hasSymbol ? (
                    <svg
                      className="h-4 w-4 text-green-600 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  <span
                    className={
                      passwordRequirements.hasSymbol
                        ? 'text-green-700'
                        : 'text-gray-600'
                    }
                  >
                    Un caracter especial (!@#$%^&amp;*)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading || (isSignUp && !isPasswordValidForSignUp)}
        >
          {loading ? 'Por favor espera...' : isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setPassword('');
          }}
          className="text-teal hover:underline text-sm font-medium"
        >
          {isSignUp
            ? '¿Ya tienes una cuenta? Inicia sesión'
            : '¿No tienes una cuenta? Regístrate'}
        </button>
      </div>
    </Card>
  );
}
