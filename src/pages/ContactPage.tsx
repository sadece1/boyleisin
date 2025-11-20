import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { contactService } from '@/services/contactService';
import { ContactForm, AppointmentForm } from '@/types';

export const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isAppointmentSubmitting, setIsAppointmentSubmitting] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>();

  const {
    register: registerAppointment,
    handleSubmit: handleAppointmentSubmit,
    formState: { errors: appointmentErrors },
    reset: resetAppointment,
  } = useForm<AppointmentForm>();

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      await contactService.sendMessage(data);
      setSubmitSuccess(true);
      reset();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAppointmentSubmit = async (data: AppointmentForm) => {
    setIsAppointmentSubmitting(true);
    try {
      await contactService.bookAppointment(data);
      setAppointmentSuccess(true);
      resetAppointment();
      setTimeout(() => setAppointmentSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to book appointment:', error);
      alert('Randevu alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsAppointmentSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <>
      <SEO 
        title="İletişim - WeCamp | Bizimle İletişime Geçin" 
        description="WeCamp ile iletişime geçin. Sorularınız, önerileriniz veya destek için bizimle iletişime geçebilirsiniz. Kamp alanları, kamp malzemeleri ve outdoor ekipmanları hakkında bilgi alın."
        keywords="WeCamp iletişim, kamp iletişim, kamp malzemeleri destek, kamp alanı danışmanlık, outdoor ekipman desteği"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              İletişim
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sorularınız, önerileriniz veya destek için bizimle iletişime geçin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                İletişim Bilgileri
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    📞 Telefon
                  </h3>
                  <a href="tel:+905551234567" className="text-primary-600 dark:text-primary-400 hover:underline">
                    +90 555 123 45 67
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    ✉️ E-posta
                  </h3>
                  <a href="mailto:info@wecamp.com" className="text-primary-600 dark:text-primary-400 hover:underline">
                    info@wecamp.com
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    📍 Adres
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Örnek Mahallesi, Örnek Sokak No: 123<br />
                    İstanbul, Türkiye
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Mesaj Gönder
              </h2>
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg"
                >
                  Mesajınız başarıyla gönderildi!
                </motion.div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  label="Konu"
                  {...register('subject', { required: 'Konu gereklidir' })}
                  error={errors.subject?.message}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mesaj
                  </label>
                  <textarea
                    {...register('message', { required: 'Mesaj gereklidir' })}
                    rows={5}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.message
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.message.message}
                    </p>
                  )}
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSubmitting}>
                  Gönder
                </Button>
              </form>
            </div>
          </div>

          {/* Appointment Booking Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              📅 Randevu Al
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bize uygun bir tarih ve saat seçerek randevu alabilirsiniz. Randevu talebiniz en kısa sürede değerlendirilecektir.
            </p>
            {appointmentSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg"
              >
                Randevu talebiniz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
              </motion.div>
            )}
            <form onSubmit={handleAppointmentSubmit(onAppointmentSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Ad Soyad"
                  {...registerAppointment('name', { required: 'Ad soyad gereklidir' })}
                  error={appointmentErrors.name?.message}
                />
                <Input
                  label="Telefon"
                  type="tel"
                  {...registerAppointment('phone', {
                    required: 'Telefon numarası gereklidir',
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'Geçerli bir telefon numarası giriniz',
                    },
                  })}
                  error={appointmentErrors.phone?.message}
                  placeholder="+90 555 123 45 67"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="E-posta"
                  type="email"
                  {...registerAppointment('email', {
                    required: 'E-posta gereklidir',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Geçerli bir e-posta adresi giriniz',
                    },
                  })}
                  error={appointmentErrors.email?.message}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hizmet Tipi (İsteğe Bağlı)
                  </label>
                  <select
                    {...registerAppointment('serviceType')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Seçiniz</option>
                    <option value="consultation">Danışmanlık</option>
                    <option value="campsite-tour">Kamp Yeri Turu</option>
                    <option value="gear-purchase">Ekipman Satın Alma</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tarih"
                  type="date"
                  {...registerAppointment('date', {
                    required: 'Tarih gereklidir',
                    min: {
                      value: getMinDate(),
                      message: 'Geçmiş bir tarih seçilemez',
                    },
                  })}
                  error={appointmentErrors.date?.message}
                  min={getMinDate()}
                />
                <Input
                  label="Saat"
                  type="time"
                  {...registerAppointment('time', {
                    required: 'Saat gereklidir',
                  })}
                  error={appointmentErrors.time?.message}
                  min="09:00"
                  max="18:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mesaj veya Notlar (İsteğe Bağlı)
                </label>
                <textarea
                  {...registerAppointment('message')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Randevu ile ilgili eklemek istediğiniz notlar..."
                />
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full md:w-auto" isLoading={isAppointmentSubmitting}>
                Randevu Talebi Gönder
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

