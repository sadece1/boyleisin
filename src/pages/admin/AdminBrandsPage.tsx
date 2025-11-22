import { useEffect, useState } from 'react';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { brandService, Brand } from '@/services/brandService';
import { uploadService } from '@/services/uploadService';

export const AdminBrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState<File | null>(null);
  const [newBrandLogoPreview, setNewBrandLogoPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingLogo, setEditingLogo] = useState<string | null>(null);
  const [editingLogoFile, setEditingLogoFile] = useState<File | null>(null);
  const [editingLogoPreview, setEditingLogoPreview] = useState<string>('');

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const allBrands = await brandService.getAllBrands();
      setBrands(allBrands);
    } catch (error) {
      console.error('Failed to load brands:', error);
      alert('Markalar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Logo dosyası 5MB\'dan büyük olamaz');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin');
      return;
    }

    if (isEditing) {
      setEditingLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setNewBrandLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBrandLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!newBrandName.trim()) {
      alert('Lütfen marka adı girin');
      return;
    }

    try {
      setUploadingLogo(true);
      let logoUrl: string | null = null;

      if (newBrandLogo) {
        const uploaded = await uploadService.uploadImage(newBrandLogo);
        logoUrl = uploadService.getFileUrl(uploaded.path);
      }

      await brandService.createBrand({ name: newBrandName, logo: logoUrl });
      setNewBrandName('');
      setNewBrandLogo(null);
      setNewBrandLogoPreview('');
      setIsAdding(false);
      await loadBrands();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Marka eklenemedi');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setEditingName(brand.name);
    setEditingLogo(brand.logo || null);
    setEditingLogoFile(null);
    setEditingLogoPreview(brand.logo || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) {
      alert('Lütfen marka adı girin');
      return;
    }

    try {
      setUploadingLogo(true);
      let logoUrl: string | null = editingLogo;

      if (editingLogoFile) {
        const uploaded = await uploadService.uploadImage(editingLogoFile);
        logoUrl = uploadService.getFileUrl(uploaded.path);
      }

      await brandService.updateBrand(editingId, { name: editingName, logo: logoUrl });
      setEditingId(null);
      setEditingName('');
      setEditingLogo(null);
      setEditingLogoFile(null);
      setEditingLogoPreview('');
      await loadBrands();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Marka güncellenemedi');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingLogo(null);
    setEditingLogoFile(null);
    setEditingLogoPreview('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
      try {
        await brandService.deleteBrand(id);
        await loadBrands();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Silme işlemi başarısız oldu');
      }
    }
  };

  return (
    <>
      <SEO title="Marka Yönetimi" description="Markaları yönetin" />
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Marka Yönetimi
          </h1>
          {!isAdding && (
            <Button variant="primary" onClick={() => setIsAdding(true)}>
              + Yeni Marka Ekle
            </Button>
          )}
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Yeni Marka Ekle
            </h2>
            <div className="space-y-4">
              <div className="flex-1">
                <Input
                  label="Marka Adı"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Örn: Coleman, MSR..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAdd();
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marka Logosu
                </label>
                <div className="flex items-center gap-4">
                  {newBrandLogoPreview && (
                    <img
                      src={newBrandLogoPreview}
                      alt="Logo preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoSelect(e, false)}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100
                      dark:file:bg-primary-900 dark:file:text-primary-300"
                  />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="primary" onClick={handleAdd} disabled={uploadingLogo}>
                  {uploadingLogo ? 'Yükleniyor...' : 'Kaydet'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsAdding(false);
                  setNewBrandName('');
                  setNewBrandLogo(null);
                  setNewBrandLogoPreview('');
                }}>
                  İptal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Brands List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Yükleniyor...
            </div>
          ) : brands.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {editingId === brand.id ? (
                    <div className="space-y-4">
                      <div className="flex-1">
                        <Input
                          label="Marka Adı"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Marka Logosu
                        </label>
                        <div className="flex items-center gap-4">
                          {editingLogoPreview && (
                            <img
                              src={editingLogoPreview}
                              alt="Logo preview"
                              className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoSelect(e, true)}
                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-lg file:border-0
                              file:text-sm file:font-semibold
                              file:bg-primary-50 file:text-primary-700
                              hover:file:bg-primary-100
                              dark:file:bg-primary-900 dark:file:text-primary-300"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={handleSaveEdit} disabled={uploadingLogo}>
                          {uploadingLogo ? 'Yükleniyor...' : 'Kaydet'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          İptal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {brand.logo && (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                        )}
                        <div>
                          <div className="font-semibold text-lg text-gray-900 dark:text-white">
                            {brand.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Oluşturulma: {new Date(brand.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(brand)}
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(brand.id)}
                        >
                          Sil
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Henüz marka eklenmemiş
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};














