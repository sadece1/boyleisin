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
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm<Partial<Gear>>();

  const ratingValue = watch('rating');

  useEffect(() => {
    const loadRootCategories = async () => {
      const rootCats = await categoryManagementService.getRootCategories();
      setParentCategories(rootCats);
    };
    loadRootCategories();
    
    // Load brands and colors
    try {
      const allBrands = brandService.getAllBrands();
      setBrands(Array.isArray(allBrands) ? allBrands.map(b => b.name) : []);
    } catch (error) {
      console.error('Failed to load brands:', error);
      setBrands([]);
    }
    
    try {
      const allColors = colorService.getAllColors();
      setColors(Array.isArray(allColors) ? allColors.map(c => c.name) : []);
    } catch (error) {
      console.error('Failed to load colors:', error);
      setColors([]);
    }
    
    // Load all gear for recommended products selection
    const loadAllGear = async () => {
      try {
        const response = await gearService.getGear({}, 1, 200); // Get gear for recommendations
        setAllGear(response.data);
      } catch (error) {
        console.error('Failed to load gear for recommendations:', error);
      }
    };
    loadAllGear();
    
    // Listen for updates
    const handleBrandsUpdate = () => {
      try {
        const updatedBrands = brandService.getAllBrands();
        setBrands(Array.isArray(updatedBrands) ? updatedBrands.map(b => b.name) : []);
      } catch (error) {
        console.error('Failed to update brands:', error);
        setBrands([]);
      }
    };
    
    const handleColorsUpdate = () => {
      try {
        const updatedColors = colorService.getAllColors();
        setColors(Array.isArray(updatedColors) ? updatedColors.map(c => c.name) : []);
      } catch (error) {
        console.error('Failed to update colors:', error);
        setColors([]);
      }
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
      console.log('Loading gear data:', currentGear); // Debug log
      
      // Status'u belirle (available'dan veya mevcut status'tan)
      const status = currentGear.status || (currentGear.available ? 'for-sale' : 'sold');
      
      // Get actual values - check all possible field names from backend
      const gearData = currentGear as any;
      
      // Ensure pricePerDay is a valid number, not NaN
      // Backend returns price_per_day (snake_case) as string, so we need to convert it
      let actualPricePerDay = gearData.pricePerDay ?? gearData.price_per_day ?? gearData.price ?? 0;
      if (typeof actualPricePerDay === 'string') {
        actualPricePerDay = parseFloat(actualPricePerDay) || 0;
      }
      if (typeof actualPricePerDay !== 'number' || isNaN(actualPricePerDay)) {
        actualPricePerDay = 0;
      }
      
      // Ensure deposit is a valid number or null
      // Backend may return deposit as string
      let actualDeposit = gearData.deposit ?? gearData.deposit_amount ?? null;
      if (actualDeposit !== null && actualDeposit !== undefined) {
        if (typeof actualDeposit === 'string') {
          actualDeposit = parseFloat(actualDeposit) || null;
        }
        if (typeof actualDeposit !== 'number' || isNaN(actualDeposit)) {
          actualDeposit = null;
        }
      }
      
      // Ensure rating is a valid number or undefined
      // Backend may return rating as string or null
      let actualRating = gearData.rating ?? gearData.rating_value ?? undefined;
      if (actualRating !== undefined && actualRating !== null) {
        if (typeof actualRating === 'string') {
          actualRating = parseFloat(actualRating) || undefined;
        }
        if (typeof actualRating !== 'number' || isNaN(actualRating)) {
          actualRating = undefined;
        }
      }
      
      console.log('Loading gear data:', currentGear); // Debug log
      console.log('Extracted values:', { actualPricePerDay, actualDeposit, actualRating, pricePerDay: gearData.pricePerDay, price_per_day: gearData.price_per_day }); // Debug log
      
      // Reset form with all gear data - use actual values, not defaults
      const formData = {
        name: currentGear.name || '',
        description: currentGear.description || '',
        pricePerDay: actualPricePerDay,
        deposit: actualDeposit,
        brand: currentGear.brand || '',
        color: currentGear.color || '',
        rating: actualRating,
        status: status as GearStatus,
      };
      
      console.log('Form data to set:', formData); // Debug log
      
      // Reset form immediately with defaultValues
      reset(formData, { keepDefaultValues: false });
      
      // Force set values multiple times to ensure they stick
      const setValues = () => {
        setValue('name', formData.name, { shouldValidate: false, shouldDirty: false });
        setValue('description', formData.description, { shouldValidate: false, shouldDirty: false });
        setValue('pricePerDay', formData.pricePerDay, { shouldValidate: false, shouldDirty: false });
        setValue('deposit', formData.deposit, { shouldValidate: false, shouldDirty: false });
        setValue('brand', formData.brand, { shouldValidate: false, shouldDirty: false });
        setValue('color', formData.color, { shouldValidate: false, shouldDirty: false });
        setValue('rating', formData.rating, { shouldValidate: false, shouldDirty: false });
        setValue('status', formData.status, { shouldValidate: false, shouldDirty: false });
      };
      
      // Set immediately
      setValues();
      
      // Then set again after delays to ensure they stick
      const timer1 = setTimeout(setValues, 50);
      const timer2 = setTimeout(() => {
        setValues();
        console.log('Values set after 200ms, current form values:', watch()); // Debug log
      }, 200);
      const timer3 = setTimeout(() => {
        setValues();
        console.log('Values set after 500ms, current form values:', watch()); // Debug log
      }, 500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
      
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
          value: String(value),
        }));
        setSpecifications(specsArray);
      } else {
        setSpecifications([{ key: '', value: '' }]);
      }
      
      // Kategori hiyerarşisini belirle
      const categoryId = currentGear.categoryId;
      if (categoryId) {
        const loadCategoryHierarchy = async () => {
          try {
            const category = await categoryManagementService.getCategoryById(categoryId);
            if (category) {
              // Parent kategoriyi bul
              let current: Category | null = category;
              const path: Category[] = [];
              
              while (current) {
                path.unshift(current);
                if (current.parentId) {
                  current = await categoryManagementService.getCategoryById(current.parentId);
                } else {
                  break;
                }
              }
              
              console.log('Category hierarchy path:', path.map(c => ({ id: c.id, name: c.name, parentId: c.parentId })));
              
              if (path.length > 0) {
                // Önce tüm alt kategorileri yükle, sonra state'leri set et
                const rootCategory = path[0];
                
                // Ana kategoriyi set et
                setSelectedParentCategory(rootCategory.id);
                
                // Alt kategorileri yükle
                if (path.length > 1) {
                  const subCats = await categoryManagementService.getChildCategories(rootCategory.id);
                  setSubCategories(subCats);
                  
                  // Alt kategoriyi set et
                  const subCategory = path[1];
                  setSelectedSubCategory(subCategory.id);
                  
                  // Final kategorileri yükle
                  if (path.length > 2) {
                    const finalCats = await categoryManagementService.getChildCategories(subCategory.id);
                    setFinalCategories(finalCats);
                    
                    // Final kategoriyi set et
                    const finalCategory = path[2];
                    setSelectedFinalCategory(finalCategory.id);
                  } else {
                    // Eğer final kategori yoksa, alt kategoriyi final olarak kullan
                    setSelectedFinalCategory('');
                    setFinalCategories([]);
                  }
                } else {
                  // Eğer alt kategori yoksa, ana kategoriyi kullan
                  setSelectedSubCategory('');
                  setSubCategories([]);
                  setSelectedFinalCategory('');
                  setFinalCategories([]);
                }
                
                // Form value'larını set et
                const finalCategory = path[path.length - 1];
                setValue('categoryId', finalCategory.id, { shouldValidate: false, shouldDirty: false });
                setValue('category', finalCategory.slug, { shouldValidate: false, shouldDirty: false });
                setSelectedCategoryName(`${finalCategory.icon || ''} ${finalCategory.name}`);
                
                console.log('Category hierarchy loaded:', {
                  parent: path[0]?.name,
                  sub: path[1]?.name,
                  final: path[2]?.name || path[path.length - 1]?.name,
                });
              }
            }
          } catch (error) {
            console.error('Failed to load category hierarchy:', error);
          }
        };
        loadCategoryHierarchy();
      }
    }
  }, [currentGear, reset, setValue]);

  // Ana kategori değiştiğinde alt kategorileri güncelle
  useEffect(() => {
    if (selectedParentCategory) {
      const loadSubCategories = async () => {
        const subCats = await categoryManagementService.getChildCategories(selectedParentCategory);
        setSubCategories(subCats);
        // Eğer mevcut alt kategori yeni ana kategorinin altında değilse, sıfırla
        if (selectedSubCategory && !subCats.find(c => c.id === selectedSubCategory)) {
          setSelectedSubCategory('');
          setSelectedFinalCategory('');
          setFinalCategories([]);
        }
      };
      loadSubCategories();
    } else {
      setSubCategories([]);
      // Sadece kullanıcı manuel olarak değiştirdiyse sıfırla
      if (!currentGear?.categoryId) {
        setSelectedSubCategory('');
        setSelectedFinalCategory('');
        setFinalCategories([]);
      }
    }
  }, [selectedParentCategory]);

  // Alt kategori değiştiğinde final kategorileri güncelle
  useEffect(() => {
    if (selectedSubCategory) {
      const loadFinalCategories = async () => {
        const finalCats = await categoryManagementService.getChildCategories(selectedSubCategory);
        setFinalCategories(finalCats);
        // Eğer mevcut final kategori yeni alt kategorinin altında değilse, sıfırla
        if (selectedFinalCategory && !finalCats.find(c => c.id === selectedFinalCategory)) {
          setSelectedFinalCategory('');
        }
      };
      loadFinalCategories();
    } else {
      setFinalCategories([]);
      // Sadece kullanıcı manuel olarak değiştirdiyse sıfırla
      if (!currentGear?.categoryId) {
        setSelectedFinalCategory('');
      }
    }
  }, [selectedSubCategory]);

  // Final kategori seçildiğinde form value'sunu güncelle
  useEffect(() => {
    const updateCategoryValue = async () => {
      if (selectedFinalCategory) {
        const category = await categoryManagementService.getCategoryById(selectedFinalCategory);
        if (category) {
          setValue('categoryId', category.id);
          setValue('category', category.slug);
          setSelectedCategoryName(`${category.icon || ''} ${category.name}`);
        }
      } else if (selectedSubCategory) {
        const category = await categoryManagementService.getCategoryById(selectedSubCategory);
        if (category) {
          setValue('categoryId', category.id);
          setValue('category', category.slug);
          setSelectedCategoryName(`${category.icon || ''} ${category.name}`);
        }
      } else if (selectedParentCategory) {
        const category = await categoryManagementService.getCategoryById(selectedParentCategory);
        if (category) {
          setValue('categoryId', category.id);
          setValue('category', category.slug);
          setSelectedCategoryName(`${category.icon || ''} ${category.name}`);
        }
      } else {
        setSelectedCategoryName('');
      }
    };
    updateCategoryValue();
  }, [selectedFinalCategory, selectedSubCategory, selectedParentCategory, setValue]);

  const onSubmit = async (data: Partial<Gear>) => {
    if (!id) return;

    setIsSubmitting(true);
    try {
      // Get all form values using getValues() as fallback
      const allFormValues = getValues();
      console.log('=== FORM SUBMIT DEBUG ===');
      console.log('handleSubmit data:', data);
      console.log('getValues() all values:', allFormValues);
      console.log('watch() rating:', watch('rating'));
      console.log('watch() all:', watch());
      
      // Use getValues if data is empty
      const formData = Object.keys(data).length > 0 ? data : allFormValues;
      console.log('Using formData:', formData);
      // Son seçilen kategoriyi belirle
      let finalCategoryId = selectedFinalCategory || selectedSubCategory || selectedParentCategory;
      let finalCategorySlug = '';
      
      if (finalCategoryId) {
        const category = await categoryManagementService.getCategoryById(finalCategoryId);
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
      
      // Extract and validate form values - use formData instead of data
      const pricePerDay = typeof formData.pricePerDay === 'number' && !isNaN(formData.pricePerDay) ? formData.pricePerDay : (formData.pricePerDay ? Number(formData.pricePerDay) : 0);
      const deposit = formData.deposit !== undefined && formData.deposit !== null && !isNaN(Number(formData.deposit)) ? Number(formData.deposit) : null;
      // Rating can be 0-5, or null/undefined
      // Get rating from form data, watch value, or getValues
      const formRating = formData.rating !== undefined ? formData.rating : (ratingValue !== undefined ? ratingValue : allFormValues.rating);
      console.log('Rating sources:', { 
        handleSubmitData: data.rating, 
        formDataRating: formData.rating,
        watchValue: ratingValue, 
        getValuesRating: allFormValues.rating,
        finalRating: formRating 
      });
      
      const rating = formRating !== undefined && formRating !== null && formRating !== '' 
        ? (typeof formRating === 'number' ? formRating : Number(formRating))
        : (formRating === null || formRating === '' ? null : undefined);
      // If rating is NaN, set to null
      const finalRating = (rating !== undefined && rating !== null && !isNaN(rating)) ? rating : null;
      
      console.log('Form data received (handleSubmit):', data);
      console.log('Form data received (getValues):', allFormValues);
      console.log('Using formData:', formData);
      console.log('Form data.rating:', formData.rating, typeof formData.rating);
      console.log('Extracted values:', { pricePerDay, deposit, rating: formRating });
      console.log('Final rating value:', finalRating);
      
      // Ensure all values are explicitly set, not undefined - use formData
      const updates: Partial<Gear> = {
        name: formData.name || data.name || '',
        description: formData.description || data.description || '',
        category: finalCategorySlug || formData.category || data.category || 'other',
        categoryId: finalCategoryId || currentGear.categoryId, // Keep existing if not provided
        images: validImages,
        pricePerDay: pricePerDay,
        deposit: deposit !== null ? deposit : null, // Explicitly set null
        available: (formData.status || data.status) === 'for-sale' || (formData.status || data.status) === 'orderable' ? true : false,
        status: (formData.status || data.status) ?? 'for-sale',
        specifications: Object.keys(specificationsObj).length > 0 ? specificationsObj : (currentGear.specifications || {}), // Keep existing or empty object
        brand: formData.brand || data.brand || '',
        color: formData.color || data.color || '',
        rating: finalRating !== undefined ? finalRating : (currentGear.rating !== undefined ? currentGear.rating : null), // Explicitly set, keep existing or null
        recommendedProducts: selectedRecommendedProducts.length > 0 ? selectedRecommendedProducts : (currentGear.recommendedProducts || []),
      };
      
      console.log('Final updates object:', updates);
      console.log('Updates.rating:', updates.rating, typeof updates.rating);
      console.log('Updates.specifications:', updates.specifications);
      console.log('Updates.categoryId:', updates.categoryId);
      
      console.log('Gear updates to send:', updates);

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
        <div className="max-w-4xl mx-auto px-4" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 lg:mb-8">
            Ürün Düzenle
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 space-y-4 sm:space-y-6" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
              <Input
                label="Ürün Adı"
                {...register('name', { required: 'Ürün adı gereklidir' })}
                error={errors.name?.message}
                style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Açıklama
              </label>
              <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                <textarea
                  {...register('description', { required: 'Açıklama gereklidir' })}
                  rows={5}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.description
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y`}
                  style={{ 
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    wordBreak: 'break-word', 
                    overflowWrap: 'break-word',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    display: 'block',
                    position: 'relative'
                  }}
                />
              </div>
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
                  {Array.isArray(parentCategories) && parentCategories.map((cat) => (
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
                    {Array.isArray(subCategories) && subCategories.map((cat) => (
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
                    {Array.isArray(finalCategories) && finalCategories.map((cat) => (
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

            <Input
              label="Teminat (₺) - İsteğe Bağlı"
              type="number"
              step="0.01"
              {...register('deposit', {
                min: { value: 0, message: 'Teminat 0\'dan büyük olmalıdır' },
                valueAsNumber: true,
              })}
              error={errors.deposit?.message}
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
                {Array.isArray(brands) && brands.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(brands) && brands.slice(0, 10).map((brand) => (
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
                {Array.isArray(colors) && colors.map((color) => (
                  <option key={color} value={color} />
                ))}
              </datalist>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(colors) && colors.slice(0, 10).map((color) => {
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
                      onClick={() => {
                        console.log('Setting rating to:', rating);
                        setValue('rating', rating, { shouldValidate: true, shouldDirty: true });
                        console.log('Rating set, current form value:', watch('rating'));
                      }}
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
                value={ratingValue || ''}
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
                    {Array.isArray(imageUrls) && imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Resim ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Use SVG placeholder as fallback
                            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="18"%3EResim Yüklenemedi%3C/text%3E%3C/svg%3E';
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
                    {Array.isArray(imageFiles) && imageFiles.map((file, index) => (
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
              {Array.isArray(specifications) && specifications.map((spec, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
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
                  Array.isArray(allGear) && allGear.filter(g => g.id !== id).map((item) => (
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

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button type="submit" variant="primary" isLoading={isSubmitting || uploadingImages} size="lg" className="w-full sm:w-auto">
                {uploadingImages ? 'Resimler Yükleniyor...' : 'Ürünü Güncelle'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate(routes.adminGear)}
                className="w-full sm:w-auto"
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
