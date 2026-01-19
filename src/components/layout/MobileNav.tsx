import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Tablero', icon: '📊' },
    { path: '/training', label: 'Entrenamiento', icon: '🚶' },
    { path: '/magnolias-hikes', label: 'Caminatas Magnolias', icon: '🥾' },
    { path: '/teams', label: 'Equipos', icon: '👥' },
    { path: '/trails', label: 'Senderos', icon: '🏔️' },
    { path: '/gallery', label: 'Galería', icon: '📸' },
    { path: '/resources', label: 'Recursos', icon: '📚' },
    { path: '/insignias', label: 'Insignias', icon: '🏅' },
    { path: '/profile', label: 'Perfil', icon: '👤' },
  ];

  // Only show mobile nav for logged-in users
  if (!user) {
    return null;
  }

  const handleNavClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleBackdropClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 md:hidden z-50 p-3 rounded-xl glass-card-elevated border border-white/30 safe-area-top transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Open menu"
      >
        <svg
          className="w-6 h-6 text-teal"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40 transition-opacity duration-300"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Sliding Sidebar */}
      <nav
        className={`fixed top-0 left-0 bottom-0 w-72 glass-card-elevated border-r border-white/30 md:hidden z-50 safe-area-top transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo and Close Button */}
          <div className="px-6 py-6 border-b border-white/20 flex items-center justify-between">
            <Link to="/" onClick={() => setIsOpen(false)} className="hover:opacity-80 transition-opacity">
              <img 
                src="/magnolias-logo.png" 
                alt="Magnolias Floreciendo Juntas" 
                className="h-12 w-auto"
              />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl hover:bg-white/40 transition-all duration-200"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`px-5 py-4 rounded-xl font-semibold transition-all duration-200 min-h-[56px] flex items-center gap-3 text-left ${
                    isActive
                      ? 'text-teal bg-teal/10 shadow-glass-subtle'
                      : 'text-gray-700 hover:text-teal hover:bg-white/60'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}

