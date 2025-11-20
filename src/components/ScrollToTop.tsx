import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Sayfa değiştiğinde scroll pozisyonunu en üste sıfırla
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Smooth yerine instant kullanarak anında kaydırma
    });
  }, [pathname]);

  return null;
};















