import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoginForm } from '@/types';
import { routes } from '@/config';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setSubmitError(null);
    clearError();
    try {
      await login(data);
      // Check if user is admin or if coming from admin route
      const { user } = useAuthStore.getState();
      const from = (location.state as { from?: string })?.from;
      
      if (user?.role === 'admin' || from === routes.admin) {
        navigate(routes.admin, { replace: true });
      } else {
        navigate(from || routes.home, { replace: true });
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Giriş başarısız');
    }
  };

  return (
    <>
      <SEO title="Giriş Yap" description="Hesabınıza giriş yapın" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Giriş Yap
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Hesabınıza giriş yaparak devam edin
              </p>
            </div>

            {(error || submitError) && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                {error || submitError}
              </div>
            )}

            {/* Demo Accounts Info */}
            {import.meta.env.DEV && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  🔐 Demo Hesaplar (Development)
                </h3>
                <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <p><strong>Admin:</strong> admin@campscape.com / Admin123!</p>
                  <p><strong>User:</strong> user1@campscape.com / User123!</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="E-posta"
                type="email"
                {...register('email', {
                  required: 'E-posta gereklidir',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Geçerli bir e-posta adresi giriniz',
                  },
                })}
                error={errors.email?.message}
              />

              <Input
                label="Şifre"
                type="password"
                {...register('password', { required: 'Şifre gereklidir' })}
                error={errors.password?.message}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Beni hatırla
                  </span>
                </label>
                <Link to={routes.forgotPassword} className="text-sm text-primary-600 hover:text-primary-500">
                  Şifremi unuttum
                </Link>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                Giriş Yap
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Hesabınız yok mu?{' '}
                <Link to={routes.register} className="text-primary-600 hover:text-primary-500 font-medium">
                  Kayıt Ol
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

