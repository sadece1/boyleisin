import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { authService } from '@/services/authService';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const AdminChangePasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordForm>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      reset();
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Şifre değiştirme başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO title="Şifre Değiştir" description="Admin şifresini değiştirin" />
      <AdminLayout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Şifre Değiştir
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {success && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg">
                Şifreniz başarıyla değiştirildi!
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  {...register('currentPassword', {
                    required: 'Mevcut şifre gereklidir',
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Mevcut şifrenizi girin"
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="newPassword"
                  {...register('newPassword', {
                    required: 'Yeni şifre gereklidir',
                    minLength: {
                      value: 8,
                      message: 'Şifre en az 8 karakter olmalıdır',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                      message:
                        'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir (@$!%*?&)',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Yeni şifrenizi girin"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.newPassword.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Şifre en az 8 karakter olmalı ve bir büyük harf, bir küçük harf, bir rakam ve bir
                  özel karakter (@$!%*?&) içermelidir.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword', {
                    required: 'Şifre tekrarı gereklidir',
                    validate: (value) =>
                      value === newPassword || 'Şifreler eşleşmiyor',
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              📝 Not:
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Şifrenizi değiştirdikten sonra tekrar giriş yapmanız gerekebilir. Güvenliğiniz için
              şifrenizi düzenli olarak değiştirmenizi öneririz.
            </p>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};







