import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useGearStore } from '@/store/gearStore';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { categoryManagementService } from '@/services/categoryManagementService';
import { brandService } from '@/services/brandService';
import { colorService } from '@/services/colorService';
import { gearService } from '@/services/gearService';
import { uploadService } from '@/services/uploadService';
import { routes } from '@/config';
import { Gear, Category, GearStatus } from '@/types';

export const EditGearPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentGear, fetchGearById, updateGearInStore, isLoading } = useGearStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [selectedFinalCategory, setSelectedFinalCategory] = useState<string>('');
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [finalCategories, setFinalCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [allGear, setAllGear] = useState<Gear[]>([]);
  const [selectedRecommendedProducts, setSelectedRecommendedProducts] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<Partial<Gear>>();

  const ratingValue = watch('rating');

  useEffect(() => {
    const rootCats = categoryManagementService.getRootCategories();
    setParentCategories(rootCats);
    
    // Load brands and colors
    const allBrands = brandService.getAllBrands();
    setBrands(allBrands.map(b => b.name));
    
    const allColors = colorService.getAllColors();
    setColors(allColors.map(c => c.name));
    
    // Load all gear for recommended products selection
    const loadAllGear = async () => {
      try {
        const response = await gearService.getGear({}, 1, 1000); // Get all gear
        setAllGear(response.data);
      } catch (error) {
        console.error('Failed to load gear for recommendations:', error);
      }
    };
    loadAllGear();
    
    // Listen for updates
    const handleBrandsUpdate = () => {
      const updatedBrands = brandService.getAllBrands();
      setBrands(updatedBrands.map(b => b.name));
    };
    
    const handleColorsUpdate = () => {
      const updatedColors = colorService.getAllColors();
      setColors(updatedColors.map(c => c.name));
    };
    
    window.addEventListener('brandsUpdated', handleBrandsUpdate);
    window.addEventListener('colorsUpdated', handleColorsUpdate);
    
    return () => {
      window.removeEventListener('brandsUpdated', handleBrandsUpdate);
      window.removeEventListener('colorsUpdated', handleColorsUpdate);
    };
  }, []);

  useEffect(() => {
    if (id) {
      fetchGearById(id);
    }
  }, [id, fetchGearById]);

  useEffect(() => {
    if (currentGear) {
      // Status'u belirle (available'dan veya mevcut status'tan)
      const status = currentGear.status || (currentGear.available ? 'for-sale' : 'sold');
      reset({
        ...currentGear,
        status: status as GearStatus,
      });
      setImageUrls(currentGear.images && currentGear.images.length > 0 ? currentGear.images : []);
      setImageFiles([]);
      
      // Load recommended products
      if (currentGear.recommendedProducts && currentGear.recommendedProducts.length > 0) {
        setSelectedRecommendedProducts(currentGear.recommendedProducts);
      } else {
        setSelectedRecommendedProducts([]);
      }
      
      // Load specifications
      if (currentGear.specifications && Object.keys(currentGear.specifications).length > 0) {
        const specsArray = Object.entries(currentGear.specifications).map(([key, value]) => ({
          key,
          value,
        }));
        setSpecifications(specsArray);
      } else {
        setSpecifications([{ key: '', value: '' }]);
      }
      
      // Kategori hiyerarşisini belirle
      const categoryId = currentGear.categoryId;
      if (categoryId) {
        const category = categoryManagementService.getCategoryById(categoryId);
        if (category) {
          // Parent kategoriyi bul
          let current: Category | undefined = category;
          const path: Category[] = [];
          
          while (current) {
            path.unshift(current);
            if (current.parentId) {
              current = categoryManagementService.getCategoryById(current.parentId);
            } else {
              break;
            }
          }
          
          if (path.length > 0) {
            setSelectedParentCategory(path[0].id);
            if (path.length > 1) {
              setSelectedSubCategory(path[1].id);
              const subCats = categoryManagementService.getChildCategories(path[0].id);
              setSubCategories(subCats);
            }
            if (path.length > 2) {
              setSelectedFinalCategory(path[2].id);
              const finalCats = categoryManagementService.getChildCategories(path[1].id);
              setFinalCategories(finalCats);
            }
          }
        }
      }
    }
  }, [currentGear, reset]);

  // Ana kategori değiştiğinde alt kategorileri güncelle
  useEffect(() => {
    if (selectedParentCategory) {
      const subCats = categoryManagementService.getChildCategories(selectedParentCategory);
      setSubCategories(subCats);
      if (!selectedSubCategory) {
        setSelectedFinalCategory('');
        setFinalCategories([]);
      }
    } else {
      setSubCategories([]);
      setFinalCategories([]);
    }
  }, [selectedParentCategory]);

  // Alt kategori değiştiğinde final kategorileri güncelle
  useEffect(() => {
    if (selectedSubCategory) {
      const finalCats = categoryManagementService.getChildCategories(selectedSubCategory);
      setFinalCategories(finalCats);
      if (!selectedFinalCategory) {
        setSelectedFinalCategory('');
      }
    } else {
      setFinalCategories([]);
    }
  }, [selectedSubCategory]);

  // Final kategori seçildiğinde form value'sunu güncelle
  useEffect(() => {
    if (selectedFinalCategory) {
      const category = categoryManagementService.getCategoryById(selectedFinalCategory);
      if (category) {
        setValue('categoryId', category.id);
        setValue('category', category.slug);
      }
    } else if (selectedSubCategory) {
      const category = categoryManagementService.getCategoryById(selectedSubCategory);
      if (category) {
        setValue('categoryId', category.id);
        setValue('category', category.slug);
      }
    } else if (selectedParentCategory) {
      const category = categoryManagementService.getCategoryById(selectedParentCategory);
      if (category) {
        setValue('categoryId', category.id);
        setValue('category', category.slug);
      }
    }
  }, [selectedFinalCategory, selectedSubCategory, selectedParentCategory, setValue]);

  const onSubmit = async (data: Partial<Gear>) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      // Son seçilen kategoriyi belirle
      let finalCategoryId = selectedFinalCategory || selectedSubCategory || selectedParentCategory;
      let finalCategorySlug = '';
      
      if (finalCategoryId) {
        const category = categoryManagementService.getCategoryById(finalCategoryId);
        if (category) {
          finalCategorySlug = category.slug;
        }
      }

      if (!finalCategoryId) {
        alert('Lütfen bir kategori seçin!');
        setIsSubmitting(false);
        return;
      }

      // Upload new images if there are any
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        try {
          const uploadedFiles = await uploadService.uploadImages(imageFiles);
          uploadedImageUrls = uploadedFiles.map(file => uploadService.getFileUrl(file.path));
        } catch (error) {
          console.error('Failed to upload images:', error);
          alert('Resimler yüklenirken hata oluştu. Lütfen tekrar deneyin.');
          setIsSubmitting(false);
          setUploadingImages(false);
          return;
        } finally {
          setUploadingImages(false);
        }
      }

      // Combine existing URLs with newly uploaded images
      const validImages = [...imageUrls, ...uploadedImageUrls].filter(url => url.trim() !== '');
      
      // Convert specifications array to object
      const specificationsObj: Record<string, string> = {};
      specifications.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          specificationsObj[spec.key.trim()] = spec.value.trim();
        }
      });
      
      const updates: Partial<Gear> = {
        ...data,
        category: finalCategorySlug || data.category,
        categoryId: finalCategoryId,
        images: validImages,
        available: data.status === 'for-sale' || data.status === 'orderable' ? true : false, // Backward compatibility
        status: data.status ?? 'for-sale',
        specifications: Object.keys(specificationsObj).length > 0 ? specificationsObj : undefined,
        recommendedProducts: selectedRecommendedProducts.length > 0 ? selectedRecommendedProducts : undefined,
      };

      await updateGearInStore(id, updates);
      navigate(routes.adminGear);
    } catch (error) {
      console.error('Failed to update gear:', error);
      alert('Ürün güncellenemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles([...imageFiles, ...files]);
    }
  };

  const removeImageFile = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const addImageUrlField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrlField = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setSpecifications(newSpecs);
  };

  if (isLoading || !currentGear) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <SEO title="Ürün Düzenle" description="Ürünü düzenleyin" />
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Ürün Düzenle
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
            <Input
              label="Ürün Adı"
              {...register('name', { required: 'Ürün adı gereklidir' })}
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
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Hiyerarşik Kategori Seçimi */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kategori Seçimi *
              </label>
              
              {/* Ana Kategori */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  1. Ana Kategori
                </label>
                <select
                  value={selectedParentCategory}
                  onChange={(e) => {
                    setSelectedParentCategory(e.target.value);
                    setSelectedSubCategory('');
                    setSelectedFinalCategory('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Ana Kategori Seçiniz</option>
                  {parentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Alt Kategori */}
              {subCategories.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    2. Alt Kategori
                  </label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => {
                      setSelectedSubCategory(e.target.value);
                      setSelectedFinalCategory('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Alt Kategori Seçiniz (İsteğe Bağlı)</option>
                    {subCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Final Kategori */}
              {finalCategories.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    3. Alt Alt Kategori
                  </label>
                  <select
                    value={selectedFinalCategory}
                    onChange={(e) => {
                      setSelectedFinalCategory(e.target.value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Alt Alt Kategori Seçiniz (İsteğe Bağlı)</option>
                    {finalCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Seçilen Kategori Bilgisi */}
              {(selectedParentCategory || selectedSubCategory || selectedFinalCategory) && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Seçilen Kategori:</strong>{' '}
                    {(() => {
                      const selectedId = selectedFinalCategory || selectedSubCategory || selectedParentCategory;
                      const category = categoryManagementService.getCategoryById(selectedId);
                      return category ? `${category.icon || ''} ${category.name}` : '';
                    })()}
                  </p>
                </div>
              )}
            </div>

            <Input
              label="Fiyat (₺)"
              type="number"
              step="0.01"
              {...register('pricePerDay', {
                required: 'Fiyat gereklidir',
                min: { value: 0, message: 'Fiyat 0\'dan büyük olmalıdır' },
                valueAsNumber: true,
              })}
              error={errors.pricePerDay?.message}
            />

            {/* Marka */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marka
              </label>
              <input
                type="text"
                {...register('brand')}
                list="brands-list"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.brand
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Marka adı girin (ör: Coleman, MSR...)"
              />
              <datalist id="brands-list">
                {brands.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
              <div className="flex flex-wrap gap-2 mt-2">
                {brands.slice(0, 10).map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setValue('brand', brand)}
                    className="px-3 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Renk */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Renk
              </label>
              <input
                type="text"
                {...register('color')}
                list="colors-list"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.color
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Renk girin (ör: Siyah, Beyaz, Mavi...)"
              />
              <datalist id="colors-list">
                {colors.map((color) => (
                  <option key={color} value={color} />
                ))}
              </datalist>
              <div className="flex flex-wrap gap-2 mt-2">
                {colors.slice(0, 10).map((color) => {
                  const colorObj = colorService.getColorByName(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('color', color)}
                      className="px-3 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                      style={colorObj?.hexCode ? { 
                        backgroundColor: colorObj.hexCode + '20',
                        border: `1px solid ${colorObj.hexCode}`,
                      } : {}}
                    >
                      {colorObj?.hexCode && (
                        <span 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: colorObj.hexCode }}
                        />
                      )}
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Değerlendirme (Yıldız) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Değerlendirme (Yıldız)
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const currentRating = Number(ratingValue) || 0;
                  return (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setValue('rating', rating)}
                      className={`text-3xl transition-all ${
                        currentRating >= rating
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      } hover:scale-110`}
                    >
                      ★
                    </button>
                  );
                })}
                {ratingValue && (
                  <button
                    type="button"
                    onClick={() => setValue('rating', undefined)}
                    className="ml-4 text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Temizle
                  </button>
                )}
              </div>
              <input
                type="hidden"
                {...register('rating', { valueAsNumber: true })}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Seçilen: {ratingValue ? `${ratingValue} yıldız` : 'Yok'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resimler
              </label>

              {/* Mevcut Resimler */}
              {imageUrls.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mevcut Resimler:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Resim ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                          }}
                        />
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeImageUrlField(index)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Yeni Dosya Yükleme */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yeni Resimler Ekle
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                />
                {imageFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeImageFile(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* URL Ekleme (İsteğe Bağlı) */}
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Veya URL ile ekle (İsteğe Bağlı)
                </summary>
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageUrlField}
                    className="mt-2"
                  >
                    + Resim URL Ekle
                  </Button>
                </div>
              </details>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Yeni resimler ekleyin veya mevcut resimleri düzenleyin
              </p>
            </div>

            {/* Teknik Bilgi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teknik Bilgi
              </label>
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={spec.key}
                    onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                    placeholder="Örn: Malzeme"
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                    placeholder="Örn: Alüminyum"
                    className="flex-1"
                  />
                  {specifications.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeSpecification(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpecification}
                className="mt-2"
              >
                + Teknik Bilgi Ekle
              </Button>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Ürün teknik özelliklerini ekleyin (ör: Malzeme, Ağırlık, Kapasite)
              </p>
            </div>

            {/* Ürün Durumu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ürün Durumu *
              </label>
              <select
                {...register('status', { required: 'Ürün durumu seçilmelidir' })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.status
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              >
                <option value="for-sale">🛒 Satılık</option>
                <option value="orderable">📦 Sipariş Edilebilir</option>
                <option value="sold">✅ Satıldı</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Satılık: Hemen satın alınabilir | Sipariş Edilebilir: Sipariş verilebilir | Satıldı: Artık satılmamış
              </p>
            </div>

            {/* Recommended Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tavsiye Edilen Ürünler (En fazla 4 ürün seçebilirsiniz)
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
                {allGear.filter(g => g.id !== id).length > 0 ? (
                  allGear.filter(g => g.id !== id).map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedRecommendedProducts.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (selectedRecommendedProducts.length < 4) {
                              setSelectedRecommendedProducts([...selectedRecommendedProducts, item.id]);
                            } else {
                              alert('En fazla 4 ürün seçebilirsiniz!');
                            }
                          } else {
                            setSelectedRecommendedProducts(selectedRecommendedProducts.filter(id => id !== item.id));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        disabled={!selectedRecommendedProducts.includes(item.id) && selectedRecommendedProducts.length >= 4}
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                        {item.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Henüz başka ürün bulunmuyor</p>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Seçilen: {selectedRecommendedProducts.length} / 4 ürün
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="primary" isLoading={isSubmitting || uploadingImages} size="lg">
                {uploadingImages ? 'Resimler Yükleniyor...' : 'Ürünü Güncelle'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate(routes.adminGear)}
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
