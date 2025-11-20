import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { routes } from '@/config';
import { Category } from '@/types';
import { categoryManagementService } from '@/services/categoryManagementService';

export const AddCategoryPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  type CategoryType = 'root' | 'column' | 'leaf';
  const [categoryType, setCategoryType] = useState<CategoryType>('root');
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>();
  const parentIdValue = watch('parentId');

  useEffect(() => {
    const loadCategories = () => {
      setCategories(categoryManagementService.getAllCategories());
    };

    loadCategories();

    // Listen for category updates
    const handleCategoryUpdate = () => {
      loadCategories();
    };

    window.addEventListener('categoriesUpdated', handleCategoryUpdate);
    window.addEventListener('storage', handleCategoryUpdate);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoryUpdate);
      window.removeEventListener('storage', handleCategoryUpdate);
    };
  }, []);

  const onSubmit = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Normalize parentId: empty string should be null
      const normalizedData = {
        ...data,
        parentId: data.parentId && data.parentId.trim() !== '' ? data.parentId : null,
      };
      await categoryManagementService.createCategory(normalizedData);
      navigate(routes.adminCategories);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Kategori eklenemedi');
    }
  };

  useEffect(() => {
    setValue('parentId', '');
    trigger('parentId');
  }, [categoryType, setValue, trigger]);

  const rootCategories = useMemo(() => {
    return categories
      .filter((c) => !c.parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  const columnCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (!cat.parentId) return false;
        const parent = categories.find((parentCat) => parentCat.id === cat.parentId);
        return parent && !parent.parentId;
      })
      .map((cat) => {
        const parent = categories.find((parentCat) => parentCat.id === cat.parentId);
        return {
          ...cat,
          parentName: parent?.name || 'Bilinmeyen',
          parentOrder: parent?.order || 0,
        };
      })
      .sort((a, b) => {
        if (a.parentOrder !== b.parentOrder) {
          return a.parentOrder - b.parentOrder;
        }
        return (a.order || 0) - (b.order || 0);
      });
  }, [categories]);

  const categoryTypeOptions: Array<{
    value: CategoryType;
    title: string;
    description: string;
    icon: string;
    disabled: boolean;
    disabledReason?: string;
  }> = [
    {
      value: 'root',
      title: 'Ana Başlık',
      description: 'Navbar üzerinde görünen üst seviye',
      icon: '🏕️',
      disabled: false,
    },
    {
      value: 'column',
      title: 'Sütun Kategorisi',
      description: 'Ana başlık altında kolon oluşturur',
      icon: '🧱',
      disabled: rootCategories.length === 0,
      disabledReason: rootCategories.length === 0 ? 'Önce en az bir ana kategori oluşturun.' : undefined,
    },
    {
      value: 'leaf',
      title: 'Alt Kategori',
      description: 'Ürün detayına yönlendiren son seviye',
      icon: '🔗',
      disabled: columnCategories.length === 0,
      disabledReason: columnCategories.length === 0 ? 'Önce ilgili sütun kategorilerini oluşturun.' : undefined,
    },
  ];

  return (
    <>
      <SEO title="Yeni Kategori Ekle" description="Yeni kategori ekleyin" />
      <AdminLayout>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Yeni Kategori Ekle
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <input
              type="hidden"
              {...register('parentId', {
                validate: (value) => {
                  if (categoryType === 'root') {
                    return true;
                  }
                  if (!value) {
                    return 'Lütfen bir üst kategori seçin';
                  }
                  return true;
                },
              })}
            />

            <Input
              label="Kategori Adı"
              {...register('name', { required: 'Kategori adı gereklidir' })}
              error={errors.name?.message}
            />

            <Input
              label="Slug"
              {...register('slug', { required: 'Slug gereklidir' })}
              error={errors.slug?.message}
              placeholder="kategori-adi"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hiyerarşi Seviyesi *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categoryTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex flex-col gap-2 rounded-xl border p-4 cursor-pointer transition-all ${
                      categoryType === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-500'
                    } ${option.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="categoryType"
                      value={option.value}
                      className="sr-only"
                      disabled={option.disabled}
                      checked={categoryType === option.value}
                      onChange={() => {
                        if (option.disabled) return;
                        setCategoryType(option.value);
                      }}
                    />
                    <div className="text-2xl">{option.icon}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{option.title}</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                    {option.disabled && option.disabledReason && (
                      <p className="text-xs text-red-500">{option.disabledReason}</p>
                    )}
                    {categoryType === option.value && (
                      <span className="absolute top-3 right-3 text-primary-600 dark:text-primary-400 font-semibold">
                        ✓
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Üst Kategori
              </label>
              {categoryType === 'root' && (
                <div className="w-full px-4 py-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                  Bu kategori ana başlık olarak oluşturulacak ve navbar üzerinde direkt görünecek.
                </div>
              )}

              {categoryType === 'column' && (
                <div className="space-y-2">
                  <select
                    value={parentIdValue || ''}
                    onChange={(e) => setValue('parentId', e.target.value, { shouldValidate: true })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Ana başlık seçin</option>
                    {rootCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon ? `${cat.icon} ` : ''}
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sütun kategorileri yalnızca ana başlıkların altında yer alabilir.
                  </p>
                </div>
              )}

              {categoryType === 'leaf' && (
                <div className="space-y-2">
                  <select
                    value={parentIdValue || ''}
                    onChange={(e) => setValue('parentId', e.target.value, { shouldValidate: true })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Sütun kategorisi seçin</option>
                    {columnCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.parentName} › {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Alt kategoriler yalnızca sütun kategorileri altında oluşturulabilir.
                  </p>
                </div>
              )}

              {errors.parentId && categoryType !== 'root' && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.parentId.message}</p>
              )}
            </div>

            <Input
              label="İkon (emoji)"
              {...register('icon')}
              placeholder="🏕️"
            />

            <Input
              label="Sıra"
              type="number"
              {...register('order', { valueAsNumber: true })}
              placeholder="0"
            />

            <div className="flex space-x-4">
              <Button type="submit" variant="primary">
                Kaydet
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(routes.adminCategories)}
              >
                İptal
              </Button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
};

