import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../lib/admin';

export function DesktopNav() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user ? [
    { path: '/', label: 'Tablero' },
    { path: '/training', label: 'Entrenamiento' },
    { path: '/magnolias-hikes', label: 'Caminatas Magnolias' },
    { path: '/teams', label: 'Equipos' },
    { path: '/trails', label: 'Senderos' },
    { path: '/gallery', label: 'Galería' },
    { path: '/resources', label: 'Recursos' },
    { path: '/insignias', label: 'Insignias' },
    { path: '/profile', label: 'Perfil' },
    ...(isAdmin(user) ? [{ path: '/admin', label: 'Admin' }] : []),
  ] : [
    { path: '/', label: 'Inicio' },
  ];

  // For logged-in users: show left sidebar
  if (user) {
    return (
      <nav className="hidden md:flex !fixed left-0 top-0 bottom-0 w-64 glass-card-elevated border-r border-white/30 z-50 safe-area-top flex-col h-screen">
        <div className="px-6 py-6 border-b border-white/20">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img 
              src="/magnolias-logo.png" 
              alt="Magnolias Floreciendo Juntas" 
              className="h-12 w-auto"
            />
          </Link>
        </div>
        <div className="flex-1 px-4 py-6 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-200 min-h-[44px] flex items-center ${
                  isActive
                    ? 'text-teal bg-teal/10 shadow-glass-subtle'
                    : 'text-gray-700 hover:text-teal hover:bg-white/60'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // For non-logged-in users: show top header
  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 glass-card-elevated border-b border-white/30 z-50 safe-area-top">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img 
            src="/magnolias-logo.png" 
            alt="Magnolias Floreciendo Juntas" 
            className="h-12 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 hover:text-teal hover:bg-white/60 transition-all duration-200 min-h-[44px] flex items-center"
          >
            Inicio
          </Link>
          <Link
            to="/auth"
            className="px-6 py-2.5 rounded-xl font-semibold bg-teal text-white hover:bg-teal-600 shadow-glass hover:shadow-glass-elevated transition-all duration-200 min-h-[44px] flex items-center"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </nav>
  );
}

