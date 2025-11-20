import { useEffect, useState } from 'react';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colorService, Color } from '@/services/colorService';

export const AdminColorsPage = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingHex, setEditingHex] = useState('');

  useEffect(() => {
    loadColors();
    
    // Listen for updates
    const handleStorageChange = () => {
      loadColors();
    };
    window.addEventListener('colorsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('colorsUpdated', handleStorageChange);
    };
  }, []);

  const loadColors = () => {
    const allColors = colorService.getAllColors();
    setColors(allColors);
  };

  const handleAdd = async () => {
    if (!newColorName.trim()) {
      alert('Lütfen renk adı girin');
      return;
    }

    try {
      colorService.createColor(newColorName, newColorHex || undefined);
      setNewColorName('');
      setNewColorHex('');
      setIsAdding(false);
      loadColors();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Renk eklenemedi');
    }
  };

  const handleEdit = (color: Color) => {
    setEditingId(color.id);
    setEditingName(color.name);
    setEditingHex(color.hexCode || '');
  };

  const handleSaveEdit = () => {
    if (!editingId || !editingName.trim()) {
      alert('Lütfen renk adı girin');
      return;
    }

    try {
      colorService.updateColor(editingId, editingName, editingHex || undefined);
      setEditingId(null);
      setEditingName('');
      setEditingHex('');
      loadColors();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Renk güncellenemedi');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingHex('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu rengi silmek istediğinizden emin misiniz?')) {
      try {
        colorService.deleteColor(id);
        loadColors();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Silme işlemi başarısız oldu');
      }
    }
  };

  return (
    <>
      <SEO title="Renk Yönetimi" description="Renkleri yönetin" />
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Renk Yönetimi
          </h1>
          {!isAdding && (
            <Button variant="primary" onClick={() => setIsAdding(true)}>
              + Yeni Renk Ekle
            </Button>
          )}
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Yeni Renk Ekle
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Renk Adı"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Örn: Siyah, Mavi, Kırmızı..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAdd();
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Renk Kodu (HEX) - İsteğe Bağlı
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newColorHex || '#000000'}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <Input
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="md:col-span-3 flex items-end gap-2">
                <Button variant="primary" onClick={handleAdd}>
                  Kaydet
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsAdding(false);
                  setNewColorName('');
                  setNewColorHex('');
                }}>
                  İptal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Colors List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {colors.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {colors.map((color) => (
                <div
                  key={color.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {editingId === color.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
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
                      <div>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={editingHex || '#000000'}
                            onChange={(e) => setEditingHex(e.target.value)}
                            className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                          />
                          <Input
                            value={editingHex}
                            onChange={(e) => setEditingHex(e.target.value)}
                            placeholder="#000000"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-3 flex gap-2">
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
                      <div className="flex items-center gap-4">
                        {color.hexCode && (
                          <div
                            className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: color.hexCode }}
                            title={color.hexCode}
                          />
                        )}
                        <div>
                          <div className="font-semibold text-lg text-gray-900 dark:text-white">
                            {color.name}
                          </div>
                          {color.hexCode && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {color.hexCode}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Oluşturulma: {new Date(color.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(color)}
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(color.id)}
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
              Henüz renk eklenmemiş
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};














