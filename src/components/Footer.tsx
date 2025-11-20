import { Link } from 'react-router-dom';
import { routes } from '@/config';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to={routes.home} className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🌲</span>
              <span className="text-2xl font-bold text-white">WeCamp</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Doğada unutulmaz kamp deneyimleri için kamp alanları ve kamp malzemeleri
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                Twitter
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link to={routes.home} className="hover:text-white transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to={routes.blog} className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to={routes.gear} className="hover:text-white transition-colors">
                  Malzemeler
                </Link>
              </li>
              <li>
                <Link to={routes.about} className="hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Destek</h3>
            <ul className="space-y-2">
              <li>
                <Link to={routes.contact} className="hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link to={routes.faq} className="hover:text-white transition-colors">
                  Sık Sorulan Sorular
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Gizlilik Politikası
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Kullanım Şartları
                </a>
              </li>
              <li>
                <Link 
                  to={routes.login} 
                  state={{ from: routes.admin }}
                  className="hover:text-white transition-colors text-primary-400 hover:text-primary-300 font-medium"
                >
                  🔐 Admin Girişi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} WeCamp. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

