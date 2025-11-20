import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { routes } from '@/config';
import { useAuthStore } from '@/store/authStore';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate(routes.home);
  };

  const menuItems = [
    { path: routes.admin, label: 'Dashboard', icon: '📊' },
    { path: routes.adminGear, label: 'Ürünler', icon: '🎒' },
    { path: routes.adminBlogs, label: 'Bloglar', icon: '📝' },
    { path: routes.adminCategories, label: 'Kategoriler', icon: '🏷️' },
    { path: routes.adminBrands, label: 'Markalar', icon: '🏭' },
    { path: routes.adminColors, label: 'Renkler', icon: '🎨' },
    { path: routes.adminUserOrders, label: 'Sipariş Yönetimi', icon: '📦' },
    { path: routes.adminMessages, label: 'Mesajlar', icon: '💬' },
    { path: routes.adminNewsletters, label: 'Bülten Abonelikleri', icon: '📧' },
    { path: routes.adminAppointments, label: 'Randevular', icon: '📅' },
    { path: routes.adminChangePassword, label: 'Şifre Değiştir', icon: '🔒' },
  ];

  const isActive = (path: string) => {
    if (path === routes.admin) {
      return location.pathname === routes.admin;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: isSidebarOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg z-40 ${
          isSidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <Link to={routes.admin} className="flex items-center space-x-2">
              <span className="text-2xl">🌲</span>
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                Admin Panel
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
            >
              <span>🚪</span>
              <span className="font-medium">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {isSidebarOpen ? '☰' : '☰'}
            </button>
            <div className="flex items-center space-x-4">
              <Link
                to={routes.home}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Siteye Dön
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

