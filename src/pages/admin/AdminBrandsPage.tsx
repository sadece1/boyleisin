import { useEffect, useState } from 'react';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { brandService, Brand } from '@/services/brandService';

export const AdminBrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    loadBrands();
    
    // Listen for updates
    const handleStorageChange = () => {
      loadBrands();
    };
    window.addEventListener('brandsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('brandsUpdated', handleStorageChange);
    };
  }, []);

  const loadBrands = () => {
    const allBrands = brandService.getAllBrands();
    setBrands(allBrands);
  };

  const handleAdd = async () => {
    if (!newBrandName.trim()) {
      alert('Lütfen marka adı girin');
      return;
    }

    try {
      brandService.createBrand(newBrandName);
      setNewBrandName('');
      setIsAdding(false);
      loadBrands();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Marka eklenemedi');
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setEditingName(brand.name);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingName.trim()) {
      alert('Lütfen marka adı girin');
      return;
    }

    try {
      brandService.updateBrand(editingId, editingName);
      setEditingId(null);
      setEditingName('');
      loadBrands();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Marka güncellenemedi');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
      try {
        brandService.deleteBrand(id);
        loadBrands();
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
            <div className="flex gap-4">
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
              <div className="flex items-end gap-2">
                <Button variant="primary" onClick={handleAdd}>
                  Kaydet
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsAdding(false);
                  setNewBrandName('');
                }}>
                  İptal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Brands List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {brands.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {editingId === brand.id ? (
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
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
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                          Kaydet
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          İptal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg text-gray-900 dark:text-white">
                          {brand.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Oluşturulma: {new Date(brand.createdAt).toLocaleDateString('tr-TR')}
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














