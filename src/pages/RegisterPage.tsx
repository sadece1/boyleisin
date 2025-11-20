import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { RegisterForm } from '@/types';
import { routes } from '@/config';
import { validatePassword } from '@/utils/validation';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setSubmitError(null);
    clearError();

    if (data.password !== data.confirmPassword) {
      setSubmitError('Şifreler eşleşmiyor');
      return;
    }

    if (!validatePassword(data.password)) {
      setSubmitError('Şifre en az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir');
      return;
    }

    try {
      await registerUser(data);
      navigate(routes.home, { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Kayıt başarısız');
    }
  };

  return (
    <>
      <SEO title="Kayıt Ol" description="Yeni hesap oluşturun" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Kayıt Ol
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Yeni hesap oluşturun ve kamp deneyimlerine başlayın
              </p>
            </div>

            {(error || submitError) && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                {error || submitError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Ad Soyad"
                {...register('name', { required: 'Ad soyad gereklidir' })}
                error={errors.name?.message}
              />

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
                {...register('password', {
                  required: 'Şifre gereklidir',
                  minLength: {
                    value: 8,
                    message: 'Şifre en az 8 karakter olmalıdır',
                  },
                })}
                error={errors.password?.message}
                helperText="En az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam"
              />

              <Input
                label="Şifre Tekrar"
                type="password"
                {...register('confirmPassword', {
                  required: 'Şifre tekrar gereklidir',
                  validate: (value) =>
                    value === password || 'Şifreler eşleşmiyor',
                })}
                error={errors.confirmPassword?.message}
              />

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                Kayıt Ol
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Zaten hesabınız var mı?{' '}
                <Link to={routes.login} className="text-primary-600 hover:text-primary-500 font-medium">
                  Giriş Yap
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

