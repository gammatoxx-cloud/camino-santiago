import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function EmailVerificationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-cream">
      <Card className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="text-6xl mb-6">📧</div>
          <h1 className="text-3xl font-bold text-teal mb-4">
            Verifica tu Correo Electrónico
          </h1>
        </div>

        <div className="space-y-6 mb-8">
          <p className="text-lg text-gray-700">
            Te hemos enviado un enlace de verificación a tu correo electrónico.
          </p>
          <p className="text-base text-gray-600">
            Por favor revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
          </p>
          <p className="text-sm text-gray-500">
            Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            onClick={() => navigate('/auth')}
            variant="primary"
            size="lg"
            className="w-full"
          >
            Volver al Inicio de Sesión
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            Volver al Inicio
          </Button>
        </div>
      </Card>
    </div>
  );
}
