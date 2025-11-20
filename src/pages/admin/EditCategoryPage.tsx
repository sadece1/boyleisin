import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { routes } from '@/config';
import { Category } from '@/types';
import { categoryManagementService } from '@/services/categoryManagementService';

const commonIcons = ['🏕️', '⛺', '🔧', '🔸', '🔥', '💡', '🍳', '🪑', '🏔️', '🎒', '🧭', '🔦', '🌲', '⭐', '📦', '🛠️'];

interface ColumnCategoryForm {
  columnName: string;
  columnIcon: string;
}

interface SubCategoryForm {
  selectedColumnId: string;
  subCategoryName: string;
}

export const EditCategoryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [showAddColumnCategory, setShowAddColumnCategory] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [showAddSubCategory, setShowAddSubCategory] = useState(false);
  const [columnCategoryForm, setColumnCategoryForm] = useState<ColumnCategoryForm>({
    columnName: '',
    columnIcon: '🔸'
  });
  const [subCategoryForm, setSubCategoryForm] = useState<SubCategoryForm>({
    selectedColumnId: '',
    subCategoryName: ''
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<Partial<Category>>();

  const watchedName = watch('name');
  const watchedIcon = watch('icon');
  const watchedParentId = watch('parentId');

  useEffect(() => {
    const loadCategories = () => {
      console.log('🔄 Loading categories...');
      const allCategories = categoryManagementService.getAllCategories();
      console.log('📦 Loaded categories:', allCategories.length);
      console.log('🏠 Root categories:', allCategories.filter(c => !c.parentId || c.parentId === null || c.parentId === '').map(c => ({ id: c.id, name: c.name, parentId: c.parentId })));
      
      // Force state update by creating a new array reference
      setCategories([...allCategories]);
      
      if (id) {
        const found = categoryManagementService.getCategoryById(id);
        if (found) {
          setCategory(found);
          reset(found);
          setSelectedParentId(found.parentId || '');
          setAutoGenerateSlug(false);
        }
        setIsLoading(false);
      }
    };

    loadCategories();

    // Listen for category updates
    const handleCategoryUpdate = (e?: Event) => {
      console.log('📢 Category update event received!', e?.type || 'custom');
      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        console.log('🔄 Reloading categories after update...');
        const allCategories = categoryManagementService.getAllCategories();
        console.log('📦 Reloaded categories:', allCategories.length);
        // Force state update by creating a new array reference
        setCategories([...allCategories]);
      }, 100);
    };

    // Listen to both custom event and storage event
    window.addEventListener('categoriesUpdated', handleCategoryUpdate);
    window.addEventListener('storage', handleCategoryUpdate);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoryUpdate);
      window.removeEventListener('storage', handleCategoryUpdate);
    };
  }, [id, reset]);

  // Watch parent ID change
  useEffect(() => {
    if (watchedParentId) {
      setSelectedParentId(watchedParentId);
      setShowAddColumnCategory(true);
      setShowAddSubCategory(false);
      setSelectedColumnId('');
    } else {
      setSelectedParentId('');
      setShowAddColumnCategory(false);
      setShowAddSubCategory(false);
      setSelectedColumnId('');
      setColumnCategoryForm({ columnName: '', columnIcon: '🔸' });
      setSubCategoryForm({ selectedColumnId: '', subCategoryName: '' });
    }
  }, [watchedParentId]);

  // Watch column selection
  useEffect(() => {
    if (selectedColumnId) {
      setShowAddSubCategory(true);
      setSubCategoryForm(prev => ({ ...prev, selectedColumnId }));
    } else {
      setShowAddSubCategory(false);
    }
  }, [selectedColumnId]);

  // Auto-generate slug from name
  useEffect(() => {
    if (autoGenerateSlug && watchedName) {
      const slug = watchedName
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug);
    }
  }, [watchedName, autoGenerateSlug, setValue]);

  // Reload categories when page becomes visible (user switches tabs/windows)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page became visible, reloading categories...');
        const allCategories = categoryManagementService.getAllCategories();
        // Force state update by creating a new array reference
        setCategories([...allCategories]);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const onSubmit = async (data: Partial<Category>) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await categoryManagementService.updateCategory(id, data);
      window.dispatchEvent(new Event('categoriesUpdated'));
      navigate(routes.adminCategories);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Kategori güncellenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddColumnCategory = async () => {
    if (!columnCategoryForm.columnName.trim()) {
      alert('Lütfen sütun adını girin');
      return;
    }

    // Mevcut düzenlenen kategoriyi üst kategori olarak kullan
    if (!id) {
      alert('Kategori ID bulunamadı');
      return;
    }

    // Refresh categories before checking to ensure we have latest data
    const allCategories = categoryManagementService.getAllCategories();
    setCategories([...allCategories]);

    // Mevcut kategori ana kategori olmalı
    const parentCategory = allCategories.find(c => c.id === id);
    if (!parentCategory) {
      alert('Mevcut kategori bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
      return;
    }

    // Ana kategori kontrolü: parentId null, undefined veya boş string olmalı
    const isRootCategory = parentCategory.parentId === null || 
                          parentCategory.parentId === undefined || 
                          parentCategory.parentId === '';
    
    if (!isRootCategory) {
      alert('⚠️ Sütun kategorileri sadece ana kategorilerin altına eklenebilir.\n\nBu kategori bir ana kategori değil, bu yüzden sütun kategorisi ekleyemezsiniz.');
      return;
    }

    try {
      const slug = columnCategoryForm.columnName
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const maxOrder = allCategories
        .filter(c => c.parentId === id)
        .reduce((max, c) => Math.max(max, c.order || 0), 0);

      const newColumnCategory = {
        name: columnCategoryForm.columnName,
        slug: slug,
        description: `Sütun kategorisi: ${columnCategoryForm.columnName}`,
        parentId: id, // Mevcut düzenlenen kategoriyi üst kategori olarak kullan
        icon: columnCategoryForm.columnIcon,
        order: maxOrder + 1,
      };

      const created = await categoryManagementService.createCategory(newColumnCategory);
      
      // Refresh categories
      const refreshedCategories = categoryManagementService.getAllCategories();
      setCategories([...refreshedCategories]);
      window.dispatchEvent(new Event('categoriesUpdated'));
      
      // Auto-select the created column category
      setSelectedColumnId(created.id);
      
      // Reset form
      setColumnCategoryForm({ columnName: '', columnIcon: '🔸' });
      alert('✅ Sütun kategorisi başarıyla eklendi! Şimdi alt kategori ekleyebilirsiniz.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Sütun kategorisi eklenemedi');
    }
  };

  const handleAddSubCategory = async () => {
    if (!subCategoryForm.subCategoryName.trim()) {
      alert('Lütfen alt kategori adını girin');
      return;
    }

    if (!subCategoryForm.selectedColumnId) {
      alert('Önce bir sütun kategorisi seçmelisiniz');
      return;
    }

    try {
      const slug = subCategoryForm.subCategoryName
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const maxOrder = categories
        .filter(c => c.parentId === subCategoryForm.selectedColumnId)
        .reduce((max, c) => Math.max(max, c.order || 0), 0);

      const newSubCategory = {
        name: subCategoryForm.subCategoryName,
        slug: slug,
        description: '',
        parentId: subCategoryForm.selectedColumnId,
        icon: '🔸',
        order: maxOrder + 1,
      };

      await categoryManagementService.createCategory(newSubCategory);
      
      // Refresh categories
      const allCategories = categoryManagementService.getAllCategories();
      setCategories(allCategories);
      window.dispatchEvent(new Event('categoriesUpdated'));
      
      // Reset form
      setSubCategoryForm(prev => ({ ...prev, subCategoryName: '' }));
      alert('Alt kategori başarıyla eklendi!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Alt kategori eklenemedi');
    }
  };

  // Get category path for breadcrumb
  const getCategoryPath = (catId: string): Category[] => {
    const path: Category[] = [];
    let currentId: string | null | undefined = catId;
    
    while (currentId) {
      const current = categories.find(c => c.id === currentId);
      if (!current) break;
      
      path.unshift(current);
      currentId = current.parentId || null;
    }
    
    return path;
  };

  // Get all categories that can be parent (exclude current category to prevent circular references)
  const getDescendantIds = useCallback((categoryId: string, catList: Category[]): string[] => {
    const descendants: string[] = [];
    const findChildren = (parentId: string) => {
      const children = catList.filter(c => c.parentId === parentId);
      children.forEach(child => {
        descendants.push(child.id);
        findChildren(child.id);
      });
    };
    findChildren(categoryId);
    return descendants;
  }, []);

  // Hooks must be called before early returns
  const descendantIds = useMemo(() => {
    if (!id) return [];
    return getDescendantIds(id, categories);
  }, [id, categories, getDescendantIds]);
  
  // Sadece navbar'da görünen ana kategoriler (parentId olmayanlar)
  // categories değiştiğinde otomatik olarak güncellenir
  const rootCategories = useMemo(() => {
    // Ana kategori kontrolü: parentId null, undefined veya boş string olmalı
    const isRootCategory = (c: Category) => {
      const isRoot = c.parentId === null || 
                     c.parentId === undefined || 
                     c.parentId === '' ||
                     !c.parentId;
      return isRoot;
    };
    
    // Tüm ana kategorileri al
    const allRootCategories = categories.filter(isRootCategory);
    
    // Eğer bir kategori düzenleniyorsa, o kategoriyi ve descendant'larını hariç tut
    const filtered = !id 
      ? allRootCategories
      : allRootCategories.filter((c) => {
          // Mevcut düzenlenen kategoriyi hariç tut
          if (c.id === id) return false;
          // Descendant'ları hariç tut
          if (descendantIds.includes(c.id)) return false;
          return true;
        });
    
    const sorted = filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Debug: Log root categories
    console.log('📋 Root Categories calculation:');
    console.log('  - All categories:', categories.length);
    console.log('  - All root categories:', allRootCategories.map(c => c.name));
    console.log('  - Filtered root categories:', sorted.map(c => ({ id: c.id, name: c.name, parentId: c.parentId })));
    console.log('  - Current editing ID:', id);
    console.log('  - Descendant IDs:', descendantIds);
    
    return sorted;
  }, [categories, id, descendantIds]);

  const categoryPath = useMemo(() => {
    if (!id) return [];
    return getCategoryPath(id);
  }, [id, categories]);

  const currentParent = useMemo(() => {
    if (!category?.parentId) return null;
    return categories.find(c => c.id === category.parentId) || null;
  }, [category?.parentId, categories]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!category) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">Kategori bulunamadı</p>
          <Button onClick={() => navigate(routes.adminCategories)} variant="outline">
            Geri Dön
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <SEO title="Kategori Düzenle" description="Kategoriyi düzenleyin" />
      <AdminLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to={routes.admin} className="hover:text-primary-600 dark:hover:text-primary-400">
              Admin
            </Link>
            <span>›</span>
            <Link to={routes.adminCategories} className="hover:text-primary-600 dark:hover:text-primary-400">
              Kategoriler
            </Link>
            <span>›</span>
            <span className="text-gray-900 dark:text-white font-medium">Düzenle</span>
          </nav>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Kategori Düzenle
              </h1>
              {categoryPath.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Konum:</span>
                  {categoryPath.map((cat, index) => (
                    <span key={cat.id}>
                      <span className="text-lg">{cat.icon}</span>
                      <span className="mx-1">{cat.name}</span>
                      {index < categoryPath.length - 1 && <span className="mx-2">›</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(routes.adminCategories)}
            >
              ← Geri
            </Button>
          </div>

          {/* Main Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">📝</span>
                  Temel Bilgiler
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Kategori Adı *"
                      {...register('name', { required: 'Kategori adı gereklidir' })}
                      error={errors.name?.message}
                      placeholder="Örn: Kamp Malzemeleri"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Slug *
                      </label>
                      <button
                        type="button"
                        onClick={() => setAutoGenerateSlug(!autoGenerateSlug)}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {autoGenerateSlug ? 'Manuel Düzenle' : 'Otomatik Oluştur'}
                      </button>
                    </div>
                    <input
                      {...register('slug', { required: 'Slug gereklidir' })}
                      disabled={autoGenerateSlug}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.slug
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                        autoGenerateSlug ? 'bg-gray-100 dark:bg-gray-700 opacity-75 cursor-not-allowed' : ''
                      }`}
                      placeholder="kategori-adi"
                    />
                    {errors.slug && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      URL'de görünecek kısa isim (örn: /category/kamp-malzemeleri)
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      placeholder="Kategori hakkında açıklama..."
                    />
                  </div>
                </div>
              </div>

              {/* Icon Selection */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">🎨</span>
                  İkon
                </h2>
                <div className="space-y-4">
                  <div>
                    <Input
                      label="İkon (Emoji)"
                      {...register('icon')}
                      placeholder="🏕️"
                      maxLength={2}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Kategoriyi temsil eden bir emoji seçin
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Hızlı Seçim
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {commonIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setValue('icon', icon)}
                          className={`p-3 text-2xl rounded-lg border-2 transition-all hover:scale-110 ${
                            watchedIcon === icon
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    {watchedIcon && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Önizleme:</p>
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{watchedIcon}</span>
                          <span className="text-lg font-medium text-gray-900 dark:text-white">
                            {watchedName || 'Kategori Adı'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Info & Order */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">🔗</span>
                  Kategori Bilgileri
                </h2>
                <div className="space-y-4">
                  {/* Mevcut Kategori Bilgileri */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon || '📦'}</span>
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </div>
                        {categoryPath.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span>Konum:</span>
                            {categoryPath.map((cat, index) => (
                              <span key={cat.id} className="flex items-center gap-1">
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                                {index < categoryPath.length - 1 && <span>›</span>}
                              </span>
                            ))}
                          </div>
                        )}
                        {!category.parentId && (
                          <div className="text-xs text-primary-600 dark:text-primary-400 mt-1 font-medium">
                            🏠 Ana Kategori (Navbar'da görünür)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Sıralama (Order)"
                      type="number"
                      {...register('order', { valueAsNumber: true })}
                      helperText="Düşük sayılar önce gösterilir"
                    />
                  </div>
                </div>
              </div>

              {/* Add Column Category Section - Step 1 */}
              {/* Sadece ana kategoriler için sütun ekleme bölümü gösterilir */}
              <AnimatePresence>
                {(!category.parentId || category.parentId === null || category.parentId === '') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-b border-gray-200 dark:border-gray-700 pb-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <span className="mr-2">📋</span>
                      Sütun Kategorisi Ekle (1. Adım)
                    </h2>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4">
                      <div className="flex items-center space-x-2 mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
                        <span className="text-lg">🎯</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Ana Kategori: <span className="font-medium text-blue-600 dark:text-blue-400">
                            {category.icon} {category.name}
                          </span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sütun Adı * (Örn: Kamp Mutfağı)
                          </label>
                          <input
                            type="text"
                            value={columnCategoryForm.columnName}
                            onChange={(e) => setColumnCategoryForm(prev => ({ ...prev, columnName: e.target.value }))}
                            placeholder="Örn: Kamp Mutfağı, Kamp Mobilyaları"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            İkon
                          </label>
                          <input
                            type="text"
                            value={columnCategoryForm.columnIcon}
                            onChange={(e) => setColumnCategoryForm(prev => ({ ...prev, columnIcon: e.target.value }))}
                            placeholder="🔸"
                            maxLength={2}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center text-xl"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleAddColumnCategory}
                        disabled={!columnCategoryForm.columnName.trim()}
                      >
                        ➕ Sütun Kategorisi Ekle
                      </Button>

                      {/* Existing Column Categories */}
                      {(() => {
                        const columnCategories = categories.filter(c => c.parentId === id);
                        return columnCategories.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Mevcut Sütun Kategorileri ({columnCategories.length})
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {columnCategories.map((colCat) => (
                                <button
                                  key={colCat.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedColumnId(colCat.id);
                                    setSubCategoryForm(prev => ({ ...prev, selectedColumnId: colCat.id }));
                                  }}
                                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left ${
                                    selectedColumnId === colCat.id
                                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 bg-white dark:bg-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xl">{colCat.icon}</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{colCat.name}</span>
                                  </div>
                                  {selectedColumnId === colCat.id && (
                                    <span className="text-primary-600 dark:text-primary-400">✓</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Sub Category Section - Step 2 */}
              <AnimatePresence>
                {showAddSubCategory && selectedColumnId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-b border-gray-200 dark:border-gray-700 pb-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <span className="mr-2">➕</span>
                      Alt Kategori Ekle (2. Adım)
                    </h2>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-4">
                      <div className="flex items-center space-x-2 mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
                        <span className="text-lg">📂</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Seçili sütun: <span className="font-medium text-green-600 dark:text-green-400">
                            {categories.find(c => c.id === selectedColumnId)?.icon} {categories.find(c => c.id === selectedColumnId)?.name}
                          </span>
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Alt Kategori Adı * (Örn: Kamp Ocakları)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={subCategoryForm.subCategoryName}
                            onChange={(e) => setSubCategoryForm(prev => ({ ...prev, subCategoryName: e.target.value }))}
                            placeholder="Örn: Kamp Ocakları, Termos ve Mug"
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && subCategoryForm.subCategoryName.trim()) {
                                handleAddSubCategory();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="primary"
                            onClick={handleAddSubCategory}
                            disabled={!subCategoryForm.subCategoryName.trim()}
                          >
                            ➕ Ekle
                          </Button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Alt kategori adını yazıp Enter'a basabilir veya butona tıklayabilirsiniz
                        </p>
                      </div>

                      {/* Existing Sub Categories */}
                      {(() => {
                        const subCategories = categories.filter(c => c.parentId === selectedColumnId);
                        return subCategories.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Mevcut Alt Kategoriler ({subCategories.length})
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                              {subCategories.map((subCat) => (
                                <div
                                  key={subCat.id}
                                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                                >
                                  <div className="flex items-center space-x-2">
                                    <span>{subCat.icon}</span>
                                    <span className="text-sm text-gray-900 dark:text-white">{subCat.name}</span>
                                  </div>
                                  <Link
                                    to={`/admin/categories/edit/${subCat.id}`}
                                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                                  >
                                    Düzenle
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(routes.adminCategories)}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? 'Kaydediliyor...' : '✅ Kategoriyi Güncelle'}
                </Button>
              </div>
            </div>
          </motion.form>
        </div>
      </AdminLayout>
    </>
  );
};
