import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll to the top on every route change.
 * Uses direct DOM property assignment to bypass any CSS scroll-behavior.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Direct property set is not affected by CSS scroll-behavior: smooth
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // Safari fallback
  }, [pathname]);

  return null;
};

export default ScrollToTop;
