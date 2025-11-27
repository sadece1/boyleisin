import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { routes } from '@/config';
import { Category } from '@/types';
import { categoryManagementService } from '@/services/categoryManagementService';
import { syncCategoriesToBackend } from '@/utils/syncCategoriesToBackend';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);


  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories([]);
    }
  }, [searchQuery, categories]);

  const loadCategories = async () => {
    try {
      const allCategories = await categoryManagementService.getAllCategories();
    setCategories(allCategories);
    
    // Trigger navbar update
    window.dispatchEvent(new Event('categoriesUpdated'));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set(categories.map(c => c.id));
    setExpandedCategories(allIds);
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const handleSyncToBackend = async () => {
    if (!confirm('Frontend\'deki tüm kategorileri backend\'e senkronize etmek istediğinizden emin misiniz?\n\nBu işlem mevcut olmayan kategorileri backend\'de oluşturacaktır.')) {
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncCategoriesToBackend();
      
      // Show result message based on what happened
      if (result.created > 0 || result.skipped > 0) {
        // At least some categories were processed
        if (result.errors.length === 0) {
          alert(
            `✅ Senkronizasyon başarıyla tamamlandı!\n\n` +
            `Oluşturulan: ${result.created}\n` +
            `Zaten mevcut: ${result.skipped}`
          );
        } else {
          alert(
            `⚠️ Senkronizasyon kısmen tamamlandı:\n\n` +
            `✅ Oluşturulan: ${result.created}\n` +
            `⏭️  Zaten mevcut: ${result.skipped}\n` +
            `❌ Hatalar: ${result.errors.length}\n\n` +
            `Bazı kategoriler oluşturulamadı, ancak işlem devam etti.\n` +
            `Detaylar için console'u kontrol edin.`
          );
          console.error('Sync errors:', result.errors);
        }
      } else {
        // Nothing was created or skipped
        alert(
          `❌ Senkronizasyon başarısız oldu:\n\n` +
          `Oluşturulan: ${result.created}\n` +
          `Zaten mevcut: ${result.skipped}\n` +
          `Hatalar: ${result.errors.length}\n\n` +
          `Hiçbir kategori oluşturulamadı.\n` +
          `Detaylar için console'u kontrol edin.`
        );
        console.error('Sync errors:', result.errors);
      }
    } catch (error: any) {
      console.error('Sync failed:', error);
      alert(`❌ Senkronizasyon başarısız oldu: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    const children = getChildCategories(id);
    const isRootCategory = !category.parentId || category.parentId === null || category.parentId === '';
    
    // Ana kategoriler alt kategorileri olsa bile silinebilir
    // Diğer kategoriler için alt kategorileri varsa silinemez
    if (!isRootCategory && children.length > 0) {
      alert('Bu kategorinin alt kategorileri var. Önce alt kategorileri silmeniz gerekiyor.');
      return;
    }

    // Ana kategori ise ve alt kategorileri varsa uyarı göster ama silmeye izin ver
    if (isRootCategory && children.length > 0) {
      const confirmMessage = `${category.name} adlı ana kategoriyi ve ${children.length} alt kategorisini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
      
      // Alt kategorileri de sil
      try {
        // Önce alt kategorileri sil (en derinden başlayarak)
        const deleteChildrenRecursively = async (parentId: string) => {
          const directChildren = categories.filter(c => c.parentId === parentId);
          for (const child of directChildren) {
            const grandChildren = categories.filter(c => c.parentId === child.id);
            if (grandChildren.length > 0) {
              await deleteChildrenRecursively(child.id);
            }
            await categoryManagementService.deleteCategory(child.id);
          }
        };
        
        await deleteChildrenRecursively(id);
        await categoryManagementService.deleteCategory(id);
        loadCategories();
        alert('✅ Kategori ve tüm alt kategorileri başarıyla silindi.');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Silme işlemi başarısız oldu');
      }
      return;
    }

    // Normal silme işlemi (alt kategorileri olmayan kategoriler için)
    if (window.confirm(`${category.name} adlı kategoriyi silmek istediğinizden emin misiniz?`)) {
      try {
        await categoryManagementService.deleteCategory(id);
        loadCategories();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Silme işlemi başarısız oldu');
      }
    }
  };

  const handleOrderChange = async (categoryId: string, direction: 'up' | 'down') => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;

      const siblings = categories.filter(c => c.parentId === category.parentId);
      const sortedSiblings = siblings.sort((a, b) => (a.order || 0) - (b.order || 0));
      const currentIndex = sortedSiblings.findIndex(c => c.id === categoryId);

      if (direction === 'up' && currentIndex > 0) {
        const prevCategory = sortedSiblings[currentIndex - 1];
        const tempOrder = category.order || 0;
        category.order = prevCategory.order || 0;
        prevCategory.order = tempOrder;
        
        await categoryManagementService.updateCategory(category.id, { order: category.order });
        await categoryManagementService.updateCategory(prevCategory.id, { order: prevCategory.order });
        loadCategories();
      } else if (direction === 'down' && currentIndex < sortedSiblings.length - 1) {
        const nextCategory = sortedSiblings[currentIndex + 1];
        const tempOrder = category.order || 0;
        category.order = nextCategory.order || 0;
        nextCategory.order = tempOrder;
        
        await categoryManagementService.updateCategory(category.id, { order: category.order });
        await categoryManagementService.updateCategory(nextCategory.id, { order: nextCategory.order });
        loadCategories();
      }
    } catch (error) {
      alert('Sıralama değiştirme başarısız oldu');
    }
  };

  const getCategoryPath = (category: Category): string => {
    const path: string[] = [];
    let current: Category | undefined = category;
    
    while (current) {
      const categoryItem: Category = current;
      path.unshift(categoryItem.name);
      if (categoryItem.parentId) {
        current = categories.find(c => c.id === categoryItem.parentId);
      } else {
        break;
      }
    }
    
    return path.join(' > ');
  };

  const getChildCategories = (parentId: string): Category[] => {
    return categories.filter(cat => cat.parentId === parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const getTotalCategories = (): number => {
    return categories.length;
  };

  const getTotalRootCategories = (): number => {
    return categories.filter(cat => !cat.parentId).length;
  };

  const getTotalWithChildren = (): number => {
    return categories.filter(cat => getChildCategories(cat.id).length > 0).length;
  };

  const rootCategories = categories.filter(cat => !cat.parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
  const displayCategories = searchQuery.trim() ? filteredCategories : rootCategories;

  const renderCategory = (category: Category, level: number = 0): React.ReactNode => {
    const children = getChildCategories(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const siblings = categories.filter(c => c.parentId === category.parentId);
    const sortedSiblings = siblings.sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sortedSiblings.findIndex(c => c.id === category.id);
    const canMoveUp = currentIndex > 0;
    const canMoveDown = currentIndex < sortedSiblings.length - 1;
    // Ana kategoriler (navbar'da görünenler) her zaman silinebilir
    // Alt kategorileri olmayan diğer kategoriler de silinebilir
    const isRootCategory = !category.parentId || category.parentId === null || category.parentId === '';
    const canDelete = isRootCategory || !hasChildren;
    

    // If searching, show all matching categories regardless of hierarchy
    if (searchQuery.trim()) {
      // For search results, also check if it's a root category
      const searchIsRootCategory = !category.parentId || category.parentId === null || category.parentId === '';
      // Ana kategoriler her zaman silinebilir, diğerleri sadece alt kategorileri yoksa
      const searchCanDelete = searchIsRootCategory || !hasChildren;
      
      return (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all shadow-sm hover:shadow-md gap-3 sm:gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
              <span className="text-xl sm:text-2xl flex-shrink-0">{category.icon || '📁'}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg mb-1 truncate">
                  {category.name}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                  {getCategoryPath(category)}
                </div>
                {category.description && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                    {category.description}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 sm:gap-2 text-xs text-gray-400 dark:text-gray-500 mt-2">
                  <span className="bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">Slug: {category.slug}</span>
                  {hasChildren && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">
                      {children.length} alt kategori
                    </span>
                  )}
                  {searchIsRootCategory && (
                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs">
                      🏠 Ana Kategori
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 sm:ml-4">
              <Link to={`/admin/categories/edit/${category.id}`} className="flex-1 sm:flex-initial">
                <Button variant="primary" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  Düzenle
                </Button>
              </Link>
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => handleDelete(category.id)}
                disabled={!searchCanDelete}
                title={hasChildren ? 'Önce alt kategorileri silin' : 'Kategoriyi sil'}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                Sil
              </Button>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.05 }}
        className={level > 0 ? 'ml-8 mt-2' : 'mb-2'}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all shadow-sm hover:shadow-md group gap-3 sm:gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
              >
                <motion.span
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-bold"
                >
                  ▶
                </motion.span>
              </button>
            ) : (
              <span className="w-6 flex-shrink-0" />
            )}
            
            <span className="text-2xl flex-shrink-0">{category.icon || '📁'}</span>
            
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1 truncate">
                {category.name}
              </div>
              {category.description && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mb-1 line-clamp-2">
                  {category.description}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 sm:px-2 py-0.5 rounded">
                  {category.slug}
                </span>
                {hasChildren && (
                  <span className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 sm:px-2 py-0.5 rounded">
                    {children.length} alt kategori
                  </span>
                )}
                {category.order !== undefined && (
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Sıra: {category.order}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0 sm:ml-4">
            <div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-2">
              <button
                onClick={() => handleOrderChange(category.id, 'up')}
                disabled={!canMoveUp}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Yukarı taşı"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => handleOrderChange(category.id, 'down')}
                disabled={!canMoveDown}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Aşağı taşı"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <Link to={`/admin/categories/edit/${category.id}`} className="flex-1 sm:flex-initial">
              <Button variant="primary" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                Düzenle
              </Button>
            </Link>
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => handleDelete(category.id)}
              disabled={!canDelete}
              title={hasChildren ? 'Önce alt kategorileri silin' : 'Kategoriyi sil'}
              className="flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              Sil
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2"
            >
              {children.map((child) => renderCategory(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <>
      <SEO title="Kategori Yönetimi" description="Kategorileri yönetin" />
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                Kategori Yönetimi
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400">
                Kategorilerinizi yönetin, düzenleyin ve organize edin
              </p>
            </div>
            <div className="flex flex-col xs:flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSyncToBackend}
                disabled={isSyncing}
                className="flex items-center justify-center space-x-2 text-xs sm:text-sm"
              >
                <span>{isSyncing ? '⏳' : '🔄'}</span>
                <span className="hidden sm:inline">{isSyncing ? 'Senkronize Ediliyor...' : 'Backend\'e Senkronize Et'}</span>
                <span className="sm:hidden">{isSyncing ? 'Yükleniyor...' : 'Senkronize'}</span>
              </Button>
            <Link to={routes.adminAddCategory} className="w-full xs:w-auto">
              <Button variant="primary" size="sm" className="w-full xs:w-auto">
                <span className="flex items-center justify-center space-x-2 text-xs sm:text-sm">
                  <span>➕</span>
                  <span className="hidden sm:inline">Yeni Kategori Ekle</span>
                  <span className="sm:hidden">Yeni Ekle</span>
                </span>
              </Button>
            </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1 truncate">Toplam Kategori</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{getTotalCategories()}</p>
                </div>
                <div className="text-3xl sm:text-4xl opacity-80 flex-shrink-0 ml-2">📁</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-green-100 text-xs sm:text-sm font-medium mb-1 truncate">Ana Kategori</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{getTotalRootCategories()}</p>
                </div>
                <div className="text-3xl sm:text-4xl opacity-80 flex-shrink-0 ml-2">🏷️</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-purple-100 text-xs sm:text-sm font-medium mb-1 truncate">Alt Kategorili</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{getTotalWithChildren()}</p>
                </div>
                <div className="text-3xl sm:text-4xl opacity-80 flex-shrink-0 ml-2">🔗</div>
              </div>
            </motion.div>
          </div>

          {/* Search and Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Kategori ara... (isim, slug, açıklama)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-8 sm:pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                />
                <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm sm:text-base"
                  >
                    ✕
                  </button>
                )}
              </div>
              {!searchQuery && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={expandAll} className="text-xs sm:text-sm flex-1 sm:flex-initial">
                    <span className="hidden sm:inline">Tümünü Aç</span>
                    <span className="sm:hidden">Aç</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={collapseAll} className="text-xs sm:text-sm flex-1 sm:flex-initial">
                    <span className="hidden sm:inline">Tümünü Kapat</span>
                    <span className="sm:hidden">Kapat</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {displayCategories.length > 0 ? (
              <div className="p-3 sm:p-4 md:p-6">
                <AnimatePresence mode="popLayout">
                  {displayCategories.map((category) => renderCategory(category))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">
                  {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz kategori eklenmemiş'}
                </p>
                {!searchQuery && (
                  <Link to={routes.adminAddCategory}>
                    <Button variant="primary" className="mt-4">
                      İlk Kategoriyi Ekle
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
};
