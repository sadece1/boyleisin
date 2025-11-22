import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { referenceService, Reference } from '@/services/referenceService';
import { uploadService } from '@/services/uploadService';
import { routes } from '@/config';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const AdminReferencesPage = () => {
  const [references, setReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Add form state
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>('');
  const [newLocation, setNewLocation] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Edit form state
  const [editingTitle, setEditingTitle] = useState('');
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editingImageFile, setEditingImageFile] = useState<File | null>(null);
  const [editingImagePreview, setEditingImagePreview] = useState<string>('');
  const [editingLocation, setEditingLocation] = useState('');
  const [editingYear, setEditingYear] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    setIsLoading(true);
    try {
      const allReferences = await referenceService.getAllReferences();
      setReferences(allReferences);
    } catch (error) {
      console.error('Failed to load references:', error);
      alert('Referanslar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Resim dosyası 10MB\'dan büyük olamaz');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin');
      return;
    }

    if (isEditing) {
      setEditingImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      alert('Lütfen başlık girin');
      return;
    }

    if (!newImage) {
      alert('Lütfen bir resim seçin');
      return;
    }

    try {
      setUploadingImage(true);
      const uploaded = await uploadService.uploadImage(newImage);
      const imageUrl = uploadService.getFileUrl(uploaded.path);
      
      await referenceService.createReference({
        title: newTitle.trim(),
        image: imageUrl,
        location: newLocation.trim() || null,
        year: newYear.trim() || null,
        description: newDescription.trim() || null,
      });

      // Reset form
      setNewTitle('');
      setNewImage(null);
      setNewImagePreview('');
      setNewLocation('');
      setNewYear('');
      setNewDescription('');
      setIsAdding(false);
      await loadReferences();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Referans eklenemedi');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (reference: Reference) => {
    setEditingId(reference.id);
    setEditingTitle(reference.title);
    setEditingImage(reference.image);
    setEditingImageFile(null);
    setEditingImagePreview(reference.image);
    setEditingLocation(reference.location || '');
    setEditingYear(reference.year || '');
    setEditingDescription(reference.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingTitle.trim()) {
      alert('Lütfen başlık girin');
      return;
    }

    try {
      setUploadingImage(true);
      let imageUrl = editingImage;

      if (editingImageFile) {
        const uploaded = await uploadService.uploadImage(editingImageFile);
        imageUrl = uploadService.getFileUrl(uploaded.path);
      }

      await referenceService.updateReference(editingId, {
        title: editingTitle.trim(),
        image: imageUrl || '',
        location: editingLocation.trim() || null,
        year: editingYear.trim() || null,
        description: editingDescription.trim() || null,
      });

      // Reset form
      setEditingId(null);
      setEditingTitle('');
      setEditingImage(null);
      setEditingImageFile(null);
      setEditingImagePreview('');
      setEditingLocation('');
      setEditingYear('');
      setEditingDescription('');
      await loadReferences();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Referans güncellenemedi');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingImage(null);
    setEditingImageFile(null);
    setEditingImagePreview('');
    setEditingLocation('');
    setEditingYear('');
    setEditingDescription('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu referansı silmek istediğinizden emin misiniz?')) {
      try {
        await referenceService.deleteReference(id);
        await loadReferences();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Silme işlemi başarısız oldu');
      }
    }
  };

  return (
    <>
      <SEO title="Referans Yönetimi" description="Referansları yönetin" />
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Referans Yönetimi
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                {references.length} referans yönetiliyor
              </p>
            </div>
            {!isAdding && (
              <Button variant="primary" onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
                + Yeni Referans Ekle
              </Button>
            )}
          </div>

          {/* Add Form */}
          {isAdding && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Yeni Referans Ekle
              </h2>
              <div className="space-y-4">
                <Input
                  label="Başlık *"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Örn: 2024 İstanbul Projesi"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Resim * <span className="text-xs text-gray-500">(Max 10MB)</span>
                  </label>
                  <div className="space-y-2">
                    {newImagePreview && (
                      <img
                        src={newImagePreview}
                        alt="Preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e, false)}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Konum"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Örn: İstanbul, Türkiye"
                  />
                  <Input
                    label="Yıl"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="Örn: 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Proje açıklaması..."
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={handleAdd} disabled={uploadingImage} className="flex-1 sm:flex-initial">
                    {uploadingImage ? 'Yükleniyor...' : 'Kaydet'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewTitle('');
                      setNewImage(null);
                      setNewImagePreview('');
                      setNewLocation('');
                      setNewYear('');
                      setNewDescription('');
                    }}
                    className="flex-1 sm:flex-initial"
                  >
                    İptal
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* References List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : references.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {references.map((reference) => (
                <motion.div
                  key={reference.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md overflow-hidden"
                >
                  {editingId === reference.id ? (
                    <div className="p-4 sm:p-6 space-y-4">
                      <Input
                        label="Başlık *"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Resim <span className="text-xs text-gray-500">(Max 10MB)</span>
                        </label>
                        <div className="space-y-2">
                          {editingImagePreview && (
                            <img
                              src={editingImagePreview}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageSelect(e, true)}
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
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Konum"
                          value={editingLocation}
                          onChange={(e) => setEditingLocation(e.target.value)}
                        />
                        <Input
                          label="Yıl"
                          value={editingYear}
                          onChange={(e) => setEditingYear(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Açıklama
                        </label>
                        <textarea
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={handleSaveEdit} disabled={uploadingImage} className="flex-1">
                          {uploadingImage ? 'Yükleniyor...' : 'Kaydet'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit} className="flex-1">
                          İptal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={reference.image}
                          alt={reference.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-end justify-center p-4 sm:p-6">
                          <div className="text-center">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-lg">
                              {reference.title}
                            </h3>
                            {reference.location && (
                              <p className="text-sm sm:text-base text-gray-200">
                                {reference.location}
                              </p>
                            )}
                            {reference.year && (
                              <p className="text-xs sm:text-sm text-gray-300 mt-1">
                                {reference.year}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        {reference.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {reference.description}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(reference)}
                            className="flex-1"
                          >
                            ✏️ Düzenle
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(reference.id)}
                            className="flex-1"
                          >
                            🗑️ Sil
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md p-8 sm:p-12 text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">📸</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg">
                Henüz referans eklenmemiş
              </p>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

