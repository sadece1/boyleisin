import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { routes } from '@/config';

export const ContactToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const contactMethods = [
    {
      icon: '📞',
      label: 'Telefon',
      value: '+90 555 123 45 67',
      href: 'tel:+905551234567',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-400',
    },
    {
      icon: '✉️',
      label: 'E-posta',
      value: 'info@wecamp.com',
      href: 'mailto:info@wecamp.com',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-400',
    },
    {
      icon: '💬',
      label: 'WhatsApp',
      value: 'Hemen Yaz',
      href: 'https://wa.me/905551234567',
      color: 'from-green-600 to-teal-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-400',
    },
  ];

  return (
    <div ref={toolbarRef} className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1]
              }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Contact Panel */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ 
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="mb-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-6 w-80 border border-gray-200 dark:border-gray-700 relative z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-lg shadow-lg">
                    💬
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      Hızlı İletişim
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Bize hemen ulaşın
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                  aria-label="Kapat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contact Methods */}
              <div className="space-y-3 mb-4">
                {contactMethods.map((method, index) => (
                  <motion.a
                    key={method.href}
                    href={method.href}
                    target={method.href.startsWith('http') ? '_blank' : undefined}
                    rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`block group relative overflow-hidden ${method.bgColor} rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-600`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                          {method.label}
                        </p>
                        <p className={`font-semibold text-sm ${method.textColor}`}>
                          {method.value}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent my-4" />

              {/* Contact Form Link */}
              <Link
                to={routes.contact}
                onClick={() => setIsOpen(false)}
                className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-xl text-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>📝</span>
                  <span>İletişim Formu</span>
                </span>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        animate={{
          scale: 1,
        }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className={`relative w-16 h-16 rounded-full shadow-2xl ${
          isOpen
            ? 'bg-gradient-to-br from-gray-600 to-gray-700'
            : 'bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'
        } text-white flex items-center justify-center group overflow-hidden`}
        aria-label={isOpen ? 'İletişim menüsünü kapat' : 'İletişim menüsünü aç'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.span
              key="message"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="text-3xl"
            >
              💬
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Pulse Animation */}
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full bg-primary-400"
            animate={{
              scale: [1, 1.4, 1.4, 1],
              opacity: [0.4, 0, 0, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>
    </div>
  );
};

