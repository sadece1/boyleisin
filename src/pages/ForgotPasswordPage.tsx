import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { routes } from '@/config';

interface ForgotPasswordForm {
  email: string;
}

export const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <>
        <SEO title="Şifre Sıfırlama" description="Şifre sıfırlama e-postası gönderildi" />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <div className="text-6xl mb-4">✉️</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                E-posta Gönderildi!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
                Lütfen e-posta kutunuzu kontrol edin.
              </p>
              <Link to={routes.login}>
                <Button variant="primary" size="lg" className="w-full">
                  Giriş Sayfasına Dön
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Şifremi Unuttum" description="Şifrenizi sıfırlayın" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Şifremi Unuttum
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz
              </p>
            </div>

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
                placeholder="ornek@email.com"
              />

              <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                Şifre Sıfırlama Bağlantısı Gönder
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to={routes.login} className="text-primary-600 hover:text-primary-500 text-sm">
                ← Giriş sayfasına dön
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};















