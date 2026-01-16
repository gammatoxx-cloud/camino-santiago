import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Use requestAnimationFrame to ensure scroll happens after render
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [location.pathname]);

  return null;
}

