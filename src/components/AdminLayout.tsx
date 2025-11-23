import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { routes } from '@/config';
import { useAuthStore } from '@/store/authStore';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const notifications = useAdminNotifications();
  
  // Desktop'ta açık, mobile'da kapalı
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024; // lg breakpoint
    }
    return true; // SSR için default açık
  });

  const handleLogout = () => {
    logout();
    navigate(routes.home);
  };

  const menuItems = [
    { path: routes.admin, label: 'Dashboard', icon: '📊', badge: null },
    { path: routes.adminGear, label: 'Ürünler', icon: '🎒', badge: null },
    { path: routes.adminBlogs, label: 'Bloglar', icon: '📝', badge: null },
    { path: routes.adminCategories, label: 'Kategoriler', icon: '🏷️', badge: null },
    { path: routes.adminBrands, label: 'Markalar', icon: '🏭', badge: null },
    { path: routes.adminReferences, label: 'Referanslar', icon: '📸', badge: null },
    { path: routes.adminColors, label: 'Renkler', icon: '🎨', badge: null },
    { path: routes.adminUsers, label: 'Kullanıcılar', icon: '👥', badge: null },
    { path: routes.adminUserOrders, label: 'Sipariş Yönetimi', icon: '📦', badge: notifications.orders > 0 ? notifications.orders : null },
    { path: routes.adminMessages, label: 'Mesajlar', icon: '💬', badge: notifications.messages > 0 ? notifications.messages : null },
    { path: routes.adminNewsletters, label: 'Bülten Abonelikleri', icon: '📧', badge: notifications.newsletters > 0 ? notifications.newsletters : null },
    { path: routes.adminAppointments, label: 'Randevular', icon: '📅', badge: notifications.appointments > 0 ? notifications.appointments : null },
    { path: routes.adminChangePassword, label: 'Şifre Değiştir', icon: '🔒', badge: null },
  ];

  const isActive = (path: string) => {
    if (path === routes.admin) {
      return location.pathname === routes.admin;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg z-40 w-64 transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <Link to={routes.admin} className="flex items-center space-x-2" onClick={() => setIsSidebarOpen(false)}>
              <span className="text-2xl">🌲</span>
              <span className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">
                Admin Panel
              </span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              aria-label="Close sidebar"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 sm:space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Mobile'da linke tıklayınca sidebar'ı kapat
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`flex items-center justify-between space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                  isActive(item.path)
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <span className="text-lg sm:text-xl flex-shrink-0">{item.icon}</span>
                  <span className="font-medium truncate">{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className="flex-shrink-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    !
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors text-sm sm:text-base"
            >
              <span className="text-lg sm:text-xl">🚪</span>
              <span className="font-medium">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 transition-all duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <span className="text-2xl">☰</span>
            </button>
            <div className="flex items-center space-x-4">
              <Link
                to={routes.home}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Siteye Dön
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

