import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { routes } from '@/config';

const quickLinks = [
  { path: routes.blog, label: 'Blog', icon: '📝' },
  { path: routes.gear, label: 'Malzemeler', icon: '🎒' },
  { path: routes.contact, label: 'İletişim', icon: '📞' },
  { path: routes.faq, label: 'SSS', icon: '❓' },
];

export const FastNavigation = () => {
  return (
    <div className="hidden lg:flex fixed left-4 top-1/2 transform -translate-y-1/2 z-30 flex-col space-y-2">
      {quickLinks.map((link) => (
        <motion.div
          key={link.path}
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to={link.path}
            className="flex items-center space-x-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-2 hover:shadow-xl transition-shadow"
            title={link.label}
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {link.label}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

