import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCampsiteStore } from '@/store/campsiteStore';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { campsiteService } from '@/services/campsiteService';
import { routes } from '@/config';
import { Campsite } from '@/types';

export const EditCampsitePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCampsite, fetchCampsiteById, isLoading } = useCampsiteStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Partial<Campsite>>();

  useEffect(() => {
    if (id) {
      fetchCampsiteById(id);
    }
  }, [id, fetchCampsiteById]);

  useEffect(() => {
    if (currentCampsite) {
      reset(currentCampsite);
    }
  }, [currentCampsite, reset]);

  const onSubmit = async (data: Partial<Campsite>) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'location') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'amenities' || key === 'rules') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      images.forEach((image) => {
        formData.append('images', image);
      });

      await campsiteService.updateCampsite(id, formData);
      navigate(routes.adminCampsites);
    } catch (error) {
      console.error('Failed to update campsite:', error);
      alert('Kamp alanı güncellenemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  if (isLoading || !currentCampsite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Kamp Alanı Düzenle" description="Kamp alanını düzenleyin" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Kamp Alanı Düzenle
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
            <Input
              label="Kamp Alanı Adı"
              {...register('name', { required: 'Ad gereklidir' })}
              error={errors.name?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Açıklama
              </label>
              <textarea
                {...register('description', { required: 'Açıklama gereklidir' })}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.description
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
            </div>

            <Input
              label="Gece Fiyatı (₺)"
              type="number"
              {...register('pricePerNight', {
                required: 'Fiyat gereklidir',
                valueAsNumber: true,
              })}
              error={errors.pricePerNight?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Yeni Resimler Ekle (isteğe bağlı)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Güncelle
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(routes.adminCampsites)}
              >
                İptal
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

