import api from './api';
import { ApiResponse, Category } from '@/types';

const STORAGE_KEY = 'camp_categories_storage';

// Initial mock categories - initialized from existing structure
const initialMockCategories: Category[] = [
  // Ana Kategoriler
  {
    id: 'cat-kamp-malzemeleri',
    name: 'Kamp Malzemeleri',
    slug: 'kamp-malzemeleri',
    description: 'Kamp için gerekli tüm malzemeler',
    parentId: null,
    icon: '🏕️',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-outdoor-ekipmanlari',
    name: 'Outdoor Ekipmanları',
    slug: 'outdoor-ekipmanlari',
    description: 'Outdoor aktiviteler için ekipmanlar',
    parentId: null,
    icon: '⛺',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-orgaz-urunleri',
    name: 'Orgaz Ürünleri',
    slug: 'orgaz-urunleri',
    description: 'LPG ve gaz ürünleri',
    parentId: null,
    icon: '🔧',
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  
  // Alt Kategoriler - Kamp Mutfağı
  {
    id: 'cat-kamp-mutfak',
    name: 'Kamp Mutfağı',
    slug: 'kamp-mutfak',
    description: 'Kamp mutfağı için tüm ihtiyaçlarınız',
    parentId: 'cat-kamp-malzemeleri',
    icon: '🔸',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-kamp-ocaklari',
    name: 'Kamp Ocakları',
    slug: 'kamp-ocaklari',
    description: 'Doğada yemek pişirmek için kamp ocakları',
    parentId: 'cat-kamp-mutfak',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-termos',
    name: 'Termos ve Mug',
    slug: 'termos',
    description: 'Sıcak içecekler için termoslar',
    parentId: 'cat-kamp-mutfak',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-mutfak-setleri',
    name: 'Kamp Çatal Kaşık Bıçak Setleri',
    slug: 'mutfak-setleri',
    description: 'Kamp yemekleri için çatal kaşık bıçak setleri',
    parentId: 'cat-kamp-mutfak',
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-barbeku',
    name: 'Barbekü, Mangal ve Izgaralar',
    slug: 'barbeku',
    description: 'Açık havada barbekü için ekipmanlar',
    parentId: 'cat-kamp-mutfak',
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-tencere-tava',
    name: 'Kamp Tenceresi ve Tava',
    slug: 'tencere-tava',
    description: 'Kamp yemekleri için tencere ve tavalar',
    parentId: 'cat-kamp-mutfak',
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-caydanlik',
    name: 'Kamp Çaydanlıkları',
    slug: 'caydanlik',
    description: 'Doğada çay demlemek için çaydanlıklar',
    parentId: 'cat-kamp-mutfak',
    order: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-kupa-bardak',
    name: 'Kupa Bardaklar',
    slug: 'kupa-bardak',
    description: 'Kamp için kupa ve bardaklar',
    parentId: 'cat-kamp-mutfak',
    order: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-mutfak-diger',
    name: 'Diğer Kamp Mutfak Ürünleri',
    slug: 'mutfak-diger',
    description: 'Diğer mutfak ürünleri',
    parentId: 'cat-kamp-mutfak',
    order: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  
  // Alt Kategoriler - Kamp Mobilyaları
  {
    id: 'cat-kamp-mobilyalari',
    name: 'Kamp Mobilyaları',
    slug: 'kamp-mobilyalari',
    description: 'Kamp alanında konfor için mobilyalar',
    parentId: 'cat-kamp-malzemeleri',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-kamp-masasi',
    name: 'Kamp Masası',
    slug: 'kamp-masasi',
    description: 'Kamp masaları',
    parentId: 'cat-kamp-mobilyalari',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-kamp-sandalyesi',
    name: 'Kamp Sandalyesi',
    slug: 'kamp-sandalyesi',
    description: 'Kamp sandalyeleri',
    parentId: 'cat-kamp-mobilyalari',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-kamp-taburesi',
    name: 'Kamp Taburesi',
    slug: 'kamp-taburesi',
    description: 'Kamp tabureleri',
    parentId: 'cat-kamp-mobilyalari',
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-kampet',
    name: 'Kampet',
    slug: 'kampet',
    description: 'Kamp yatakları ve kampetler',
    parentId: 'cat-kamp-mobilyalari',
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  
  // Alt Kategoriler - Aydınlatma
  {
    id: 'cat-aydinlatma-ve-fenerler',
    name: 'Aydınlatma ve Fenerler',
    slug: 'aydinlatma-ve-fenerler',
    description: 'Kamp aydınlatma çözümleri',
    parentId: 'cat-kamp-malzemeleri',
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-kamp-fenerleri',
    name: 'Kamp Fenerleri',
    slug: 'kamp-fenerleri',
    description: 'Kamp fenerleri',
    parentId: 'cat-aydinlatma-ve-fenerler',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-kamp-lambalari',
    name: 'Kamp Lambaları',
    slug: 'kamp-lambalari',
    description: 'Kamp lambaları',
    parentId: 'cat-aydinlatma-ve-fenerler',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  
  // Alt Kategoriler - Isıtıcı
  {
    id: 'cat-isitici-ve-sobalar',
    name: 'Isıtıcı ve Sobalar',
    slug: 'isitici-ve-sobalar',
    description: 'Soğuk geceler için ısıtma çözümleri',
    parentId: 'cat-kamp-malzemeleri',
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-cadir-sobalari',
    name: 'Çadır Sobaları',
    slug: 'cadir-sobalari',
    description: 'Çadır sobaları',
    parentId: 'cat-isitici-ve-sobalar',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-lpg-tup-sobalari',
    name: 'LPG Tüp Sobaları',
    slug: 'lpg-tup-sobalari',
    description: 'LPG tüp sobaları',
    parentId: 'cat-isitici-ve-sobalar',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-portatif-sobalar',
    name: 'Portatif Sobalar',
    slug: 'portatif-sobalar',
    description: 'Portatif sobalar',
    parentId: 'cat-isitici-ve-sobalar',
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  
  // Alt Kategoriler - Outdoor Ekipmanları
  // Sütun Kategorisi 1: Kamp Temel Ekipmanları
  {
    id: 'cat-kamp-temel-ekipmanlari',
    name: 'Kamp Temel Ekipmanları',
    slug: 'kamp-temel-ekipmanlari',
    description: 'Sütun kategorisi: Kamp temel ekipmanları',
    parentId: 'cat-outdoor-ekipmanlari',
    icon: '🔸',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-cadir',
    name: 'Kamp Çadırları',
    slug: 'cadir',
    description: 'Kamp çadırları',
    parentId: 'cat-kamp-temel-ekipmanlari',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-uyku-tulumu',
    name: 'Uyku Tulumları',
    slug: 'uyku-tulumu',
    description: 'Uyku tulumları',
    parentId: 'cat-kamp-temel-ekipmanlari',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-kamp-mati',
    name: 'Kamp Matı',
    slug: 'kamp-mati',
    description: 'Kamp matları',
    parentId: 'cat-kamp-temel-ekipmanlari',
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-hamak',
    name: 'Hamaklar',
    slug: 'hamak',
    description: 'Hamaklar',
    parentId: 'cat-kamp-temel-ekipmanlari',
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-ruzgarlik',
    name: 'Rüzgarlıklar',
    slug: 'ruzgarlik',
    description: 'Rüzgarlıklar',
    parentId: 'cat-kamp-temel-ekipmanlari',
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-outdoor',
    name: 'Outdoor Ekipman',
    slug: 'outdoor',
    description: 'Outdoor ekipman',
    parentId: 'cat-kamp-temel-ekipmanlari',
    order: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  
  // Sütun Kategorisi 2: Kamp Araç ve Aksesuarları
  {
    id: 'cat-kamp-arac-aksesuarlari',
    name: 'Kamp Araç ve Aksesuarları',
    slug: 'kamp-arac-aksesuarlari',
    description: 'Sütun kategorisi: Kamp araç ve aksesuarları',
    parentId: 'cat-outdoor-ekipmanlari',
    icon: '🔸',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-kartus-tup',
    name: 'Kartuş Tüpler',
    slug: 'kartus-tup',
    description: 'Kamp ocakları için kartuş tüpler',
    parentId: 'cat-kamp-arac-aksesuarlari',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-purmuz',
    name: 'Pürmüzler',
    slug: 'purmuz',
    description: 'Kamp için pürmüzler',
    parentId: 'cat-kamp-arac-aksesuarlari',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-bicak',
    name: 'Kamp Bıçakları',
    slug: 'bicak',
    description: 'Kamp bıçakları',
    parentId: 'cat-kamp-arac-aksesuarlari',
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-balta',
    name: 'Kamp Baltaları',
    slug: 'balta',
    description: 'Kamp baltaları',
    parentId: 'cat-kamp-arac-aksesuarlari',
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-kazma-kurek',
    name: 'Kazma Kürek Seti',
    slug: 'kazma-kurek',
    description: 'Kazma kürek setleri',
    parentId: 'cat-kamp-arac-aksesuarlari',
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-somine',
    name: 'Doğa Şömineleri',
    slug: 'somine',
    description: 'Doğa şömineleri',
    parentId: 'cat-kamp-arac-aksesuarlari',
    order: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-ates-kutusu',
    name: 'Ateş Kutuları',
    slug: 'ates-kutusu',
    description: 'Ateş kutuları',
    parentId: 'cat-kamp-arac-aksesuarlari',
    order: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-nargile-ocak',
    name: 'Nargile Ocakları',
    slug: 'nargile-ocak',
    description: 'Nargile ocakları',
    parentId: 'cat-kamp-arac-aksesuarlari',
    order: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-aksesuar',
    name: 'Diğer Kamp Aksesuarları',
    slug: 'aksesuar',
    description: 'Diğer kamp aksesuarları',
    parentId: 'cat-kamp-arac-aksesuarlari',
    order: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  
  // Alt Kategoriler - Orgaz Ürünleri
  // Sütun Kategorisi: Orgaz Ürünleri
  {
    id: 'cat-orgaz-urunleri-column',
    name: 'Orgaz Ürünleri',
    slug: 'orgaz-urunleri-column',
    description: 'Sütun kategorisi: Orgaz ürünleri',
    parentId: 'cat-orgaz-urunleri',
    icon: '🔸',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-dedantor',
    name: 'Dedantörler',
    slug: 'dedantor',
    description: 'Dedantörler',
    parentId: 'cat-orgaz-urunleri-column',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-kaynak',
    name: 'Kaynak Takımları',
    slug: 'kaynak',
    description: 'Kaynak takımları',
    parentId: 'cat-orgaz-urunleri-column',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-lpg-hortum',
    name: 'LPG Hortumları',
    slug: 'lpg-hortum',
    description: 'LPG hortumları',
    parentId: 'cat-orgaz-urunleri-column',
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-orgaz-ocak',
    name: 'Ocaklar',
    slug: 'orgaz-ocak',
    description: 'Orgaz ocakları',
    parentId: 'cat-orgaz-urunleri-column',
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-orgaz-soba',
    name: 'Sobalar',
    slug: 'orgaz-soba',
    description: 'Orgaz sobaları',
    parentId: 'cat-orgaz-urunleri-column',
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-tup-musluk',
    name: 'Tüp Muslukları',
    slug: 'tup-musluk',
    description: 'Tüp muslukları',
    parentId: 'cat-orgaz-urunleri-column',
    order: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

type CategoryHierarchyLevel = 'root' | 'column' | 'leaf';

const normalizeParentIdValue = (value?: string | null): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const findCategoryById = (allCategories: Category[], id?: string | null) => {
  if (!id) return undefined;
  return allCategories.find(cat => cat.id === id);
};

const getCategoryLevel = (category: Category, allCategories: Category[]): CategoryHierarchyLevel => {
  if (!category.parentId) {
    return 'root';
  }
  const parent = findCategoryById(allCategories, category.parentId);
  if (!parent || !parent.parentId) {
    return 'column';
  }
  return 'leaf';
};

const ensureHierarchyRules = (parentId: string | null, allCategories: Category[]): CategoryHierarchyLevel => {
  if (!parentId) {
    return 'root';
  }

  const parentCategory = findCategoryById(allCategories, parentId);
  if (!parentCategory) {
    throw new Error('Üst kategori bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
  }

  const parentLevel = getCategoryLevel(parentCategory, allCategories);
  if (parentLevel === 'leaf') {
    throw new Error(`${parentCategory.name} zaten bir alt kategori. Alt kategorilerin altına yeni bir seviye eklenemez.`);
  }

  return parentLevel === 'root' ? 'column' : 'leaf';
};

const isDescendant = (categoryId: string, potentialParentId: string, allCategories: Category[]): boolean => {
  let currentParentId: string | null | undefined = potentialParentId;
  while (currentParentId) {
    if (currentParentId === categoryId) {
      return true;
    }
    const parent = findCategoryById(allCategories, currentParentId);
    currentParentId = parent?.parentId;
  }
  return false;
};

const ensureUniqueSlug = (slug: string, allCategories: Category[], idToIgnore?: string) => {
  if (!slug) return;
  const duplicate = allCategories.find(cat => cat.slug === slug && cat.id !== idToIgnore);
  if (duplicate) {
    throw new Error(`"${slug}" slug değeri "${duplicate.name}" kategorisi tarafından kullanılıyor.`);
  }
};

const mapCategoryToApiPayload = (categoryData: Partial<Category>) => {
  const payload: Record<string, any> = {};

  if (categoryData.name !== undefined) payload.name = categoryData.name;
  if (categoryData.slug !== undefined) payload.slug = categoryData.slug;
  if (categoryData.description !== undefined) payload.description = categoryData.description;
  if (categoryData.parentId !== undefined) payload.parent_id = categoryData.parentId ?? null;
  if (categoryData.icon !== undefined) payload.icon = categoryData.icon;
  if (categoryData.order !== undefined) payload.order = categoryData.order;

  return payload;
};

const mapApiCategoryToLocal = (apiCategory: any): Category => {
  const fallbackTimestamp = new Date().toISOString();

  return {
    id: apiCategory.id,
    name: apiCategory.name,
    slug: apiCategory.slug,
    description: apiCategory.description ?? undefined,
    parentId: apiCategory.parent_id ?? null,
    icon: apiCategory.icon ?? undefined,
    order: apiCategory.order ?? 0,
    createdAt: apiCategory.created_at ?? fallbackTimestamp,
    updatedAt: apiCategory.updated_at ?? fallbackTimestamp,
  };
};

// Migration helper: Kategorileri sütun kategorisi altına taşı
const migrateCategoriesToColumn = (
  categories: Category[],
  columnId: string,
  columnName: string,
  parentId: string,
  childIds: string[]
): Category[] => {
  const hasColumn = categories.some(c => c.id === columnId);
  const directChildren = categories.filter(c => 
    c.parentId === parentId && 
    c.id !== columnId &&
    childIds.includes(c.id)
  );
  
  if (!hasColumn || directChildren.length > 0) {
    let updated = false;
    const updatedCategories = [...categories];
    
    // Sütun kategorisini ekle (yoksa)
    if (!hasColumn) {
      updatedCategories.push({
        id: columnId,
        name: columnName,
        slug: columnId.replace('cat-', ''),
        description: `Sütun kategorisi: ${columnName}`,
        parentId: parentId,
        icon: '🔸',
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      updated = true;
    }
    
    // Direkt alt kategorilerin parentId'sini sütun kategorisine taşı
    directChildren.forEach(cat => {
      const index = updatedCategories.findIndex(c => c.id === cat.id);
      if (index !== -1) {
        updatedCategories[index] = {
          ...updatedCategories[index],
          parentId: columnId,
          updatedAt: new Date().toISOString(),
        };
        updated = true;
      }
    });
    
    if (updated) {
      return updatedCategories;
    }
  }
  
  return categories;
};

// Migration: Outdoor Ekipmanları altındaki kategorileri 2 sütun kategorisi altına taşı
const migrateOutdoorCategories = (categories: Category[]): Category[] => {
  const outdoorParentId = 'cat-outdoor-ekipmanlari';
  const column1Id = 'cat-kamp-temel-ekipmanlari';
  const column2Id = 'cat-kamp-arac-aksesuarlari';
  
  const hasColumn1 = categories.some(c => c.id === column1Id);
  const hasColumn2 = categories.some(c => c.id === column2Id);
  
  // Eski yapı: cat-outdoor-urunleri altında hepsi
  const oldColumnId = 'cat-outdoor-urunleri';
  const hasOldColumn = categories.some(c => c.id === oldColumnId);
  
  // Eski yapıdaki direkt alt kategorileri bul
  const oldDirectChildren = categories.filter(c => 
    (c.parentId === outdoorParentId || c.parentId === oldColumnId) && 
    c.id !== column1Id && c.id !== column2Id && c.id !== oldColumnId
  );
  
  if (!hasColumn1 || !hasColumn2 || hasOldColumn || oldDirectChildren.length > 0) {
    let updated = false;
    const updatedCategories = [...categories];
    
    // Eski sütun kategorisini kaldır
    if (hasOldColumn) {
      const oldColumnIndex = updatedCategories.findIndex(c => c.id === oldColumnId);
      if (oldColumnIndex !== -1) {
        updatedCategories.splice(oldColumnIndex, 1);
        updated = true;
      }
    }
    
    // Yeni sütun kategorilerini ekle
    if (!hasColumn1) {
      updatedCategories.push({
        id: column1Id,
        name: 'Kamp Temel Ekipmanları',
        slug: 'kamp-temel-ekipmanlari',
        description: 'Sütun kategorisi: Kamp temel ekipmanları',
        parentId: outdoorParentId,
        icon: '🔸',
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      updated = true;
    }
    
    if (!hasColumn2) {
      updatedCategories.push({
        id: column2Id,
        name: 'Kamp Araç ve Aksesuarları',
        slug: 'kamp-arac-aksesuarlari',
        description: 'Sütun kategorisi: Kamp araç ve aksesuarları',
        parentId: outdoorParentId,
        icon: '🔸',
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      updated = true;
    }
    
    // Kategorileri doğru sütunlara taşı
    const column1Categories = ['cat-cadir', 'cat-uyku-tulumu', 'cat-kamp-mati', 'cat-hamak', 'cat-ruzgarlik', 'cat-outdoor'];
    const column2Categories = ['cat-kartus-tup', 'cat-purmuz', 'cat-bicak', 'cat-balta', 'cat-kazma-kurek', 'cat-somine', 'cat-ates-kutusu', 'cat-nargile-ocak', 'cat-aksesuar'];
    
    oldDirectChildren.forEach(cat => {
      const index = updatedCategories.findIndex(c => c.id === cat.id);
      if (index !== -1) {
        let newParentId: string;
        if (column1Categories.includes(cat.id)) {
          newParentId = column1Id;
        } else if (column2Categories.includes(cat.id)) {
          newParentId = column2Id;
        } else {
          // Eğer eşleşmiyorsa varsayılan olarak column2'ye koy
          newParentId = column2Id;
        }
        
        updatedCategories[index] = {
          ...updatedCategories[index],
          parentId: newParentId,
          updatedAt: new Date().toISOString(),
        };
        updated = true;
      }
    });
    
    if (updated) {
      console.log('✅ Outdoor kategorileri 2 sütuna migration yapıldı');
      return updatedCategories;
    }
  }
  
  return categories;
};

// Migration: Orgaz Ürünleri altındaki kategorileri sütun kategorisi altına taşı
const migrateOrgazCategories = (categories: Category[]): Category[] => {
  const migrated = migrateCategoriesToColumn(
    categories,
    'cat-orgaz-urunleri-column',
    'Orgaz Ürünleri',
    'cat-orgaz-urunleri',
    ['cat-dedantor', 'cat-kaynak', 'cat-lpg-hortum', 'cat-orgaz-ocak', 
     'cat-orgaz-soba', 'cat-tup-musluk']
  );
  
  if (migrated !== categories) {
    console.log('✅ Orgaz kategorileri migration yapıldı');
  }
  
  return migrated;
};

// Load from localStorage or use initial data
const loadCategoriesFromStorage = (): Category[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedCategories: Category[] = JSON.parse(stored);
        
        // Migration: Outdoor ve Orgaz kategorilerini güncelle
        let migratedCategories = migrateOutdoorCategories(storedCategories);
        migratedCategories = migrateOrgazCategories(migratedCategories);
        
        // Merge stored categories with initial mock categories to ensure all default categories are included
        const storedIds = new Set(migratedCategories.map(c => c.id));
        
        // Add any new categories from initialMockCategories that don't exist in stored
        const newCategories = initialMockCategories.filter(c => !storedIds.has(c.id));
        const mergedCategories = [...migratedCategories, ...newCategories];
        
        // If we added new categories or did migration, save to localStorage
        if (newCategories.length > 0 || migratedCategories !== storedCategories) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedCategories));
          if (newCategories.length > 0) {
            console.log(`Added ${newCategories.length} new categories to storage`);
          }
        }
        
        return mergedCategories;
      }
      // First time - save initial data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockCategories));
      return initialMockCategories;
    }
  } catch (error) {
    console.error('Failed to load categories from storage:', error);
  }
  return initialMockCategories;
};

// Save to localStorage
const saveCategoriesToStorage = (categories: Category[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
      // Dispatch custom event to notify other components about category updates
      window.dispatchEvent(new CustomEvent('categoriesUpdated'));
    }
  } catch (error) {
    console.error('Failed to save categories to storage:', error);
  }
};

// Load categories from storage on initialization
export let categories: Category[] = loadCategoriesFromStorage();

export const categoryManagementService = {
  getAllCategories(): Category[] {
    // Reload from localStorage to get latest data
    categories = loadCategoriesFromStorage();
    return categories;
  },

  getCategoryById(id: string): Category | undefined {
    // Reload from localStorage to get latest data
    categories = loadCategoriesFromStorage();
    return categories.find(cat => cat.id === id);
  },

  getCategoryBySlug(slug: string): Category | undefined {
    // Reload from localStorage to get latest data
    categories = loadCategoriesFromStorage();
    return categories.find(cat => cat.slug === slug);
  },

  getRootCategories(): Category[] {
    // Reload from localStorage to get latest data
    categories = loadCategoriesFromStorage();
    return categories.filter(cat => !cat.parentId).sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  getChildCategories(parentId: string): Category[] {
    // Reload from localStorage to get latest data
    categories = loadCategoriesFromStorage();
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async createCategory(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    // Reload latest data before validations
    categories = loadCategoriesFromStorage();

    const normalizedParentId = normalizeParentIdValue(categoryData.parentId);
    ensureUniqueSlug(categoryData.slug, categories);
    ensureHierarchyRules(normalizedParentId, categories);

    const baseCategory = {
      ...categoryData,
      parentId: normalizedParentId,
      order: categoryData.order ?? 0,
    };

    try {
      const response = await api.post<ApiResponse<Category>>(
        '/categories',
        mapCategoryToApiPayload(baseCategory)
      );
      const apiCategory = response.data?.data as any;

      if (apiCategory) {
        const mappedCategory = mapApiCategoryToLocal(apiCategory);
        categories.push(mappedCategory);
        saveCategoriesToStorage(categories);
        return mappedCategory;
      }
    } catch (error) {
      console.warn('Kategori oluşturma API isteği başarısız oldu, local depoya kaydediliyor:', error);
    }

    const timestamp = new Date().toISOString();
    const newCategory: Category = {
      ...baseCategory,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    categories.push(newCategory);
    saveCategoriesToStorage(categories);
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    categories = loadCategoriesFromStorage();
    const index = categories.findIndex(cat => cat.id === id);

    if (index === -1) {
      throw new Error('Kategori bulunamadı');
    }

    const existing = categories[index];
    const normalizedParentId =
      updates.parentId !== undefined
        ? normalizeParentIdValue(updates.parentId)
        : normalizeParentIdValue(existing.parentId);

    if (updates.slug) {
      ensureUniqueSlug(updates.slug, categories, id);
    }

    if (normalizedParentId === id) {
      throw new Error('Bir kategori kendisini üst kategori olarak seçemez.');
    }

    if (normalizedParentId && isDescendant(id, normalizedParentId, categories)) {
      throw new Error('Bir kategori kendi alt kategorisini üst kategori olarak belirleyemez.');
    }

    if (updates.parentId !== undefined) {
      const targetLevel = ensureHierarchyRules(normalizedParentId, categories);
      const hasChildren = categories.some(cat => cat.parentId === id);

      if (targetLevel === 'leaf' && hasChildren) {
        throw new Error('Alt kategorileri olan bir kategoriyi alt kategori seviyesine taşıyamazsınız.');
      }
    }

    const mergedCategory: Category = {
      ...existing,
      ...updates,
      parentId: normalizedParentId,
      updatedAt: new Date().toISOString(),
    };

    try {
      const payload = mapCategoryToApiPayload({
        ...updates,
        parentId: updates.parentId !== undefined ? normalizedParentId : undefined,
      });

      const response = await api.put<ApiResponse<Category>>(
        `/categories/${id}`,
        payload
      );

      const apiCategory = response.data?.data as any;
      if (apiCategory) {
        const mapped = mapApiCategoryToLocal(apiCategory);
        categories[index] = mapped;
        saveCategoriesToStorage(categories);
        return mapped;
      }
    } catch (error) {
      console.warn('Kategori güncelleme API isteği başarısız oldu, local depoya kaydediliyor:', error);
    }

    categories[index] = mergedCategory;
    saveCategoriesToStorage(categories);
    return mergedCategory;
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      // Continue with mock deletion
    }
    
    // Reload from localStorage to get latest data
    categories = loadCategoriesFromStorage();
    
    // Ana kategoriler (parentId === null) alt kategorileri olsa bile silinebilir
    // Diğer kategoriler için kontrol yapılmasına gerek yok çünkü AdminCategoriesPage'de kontrol ediliyor
    const categoryToDelete = categories.find(cat => cat.id === id);
    const isRootCategory = categoryToDelete && (!categoryToDelete.parentId || categoryToDelete.parentId === null || categoryToDelete.parentId === '');
    
    // Ana kategori değilse ve alt kategorileri varsa hata fırlat
    if (!isRootCategory) {
      const hasChildren = categories.some(cat => cat.parentId === id);
      if (hasChildren) {
        throw new Error('Alt kategorisi olan bir kategori silinemez. Önce alt kategorileri silin.');
      }
    }
    
    // Ana kategorileri ve alt kategorileri olmayan kategorileri sil
    const index = categories.findIndex(cat => cat.id === id);
    if (index !== -1) {
      categories.splice(index, 1);
      saveCategoriesToStorage(categories);
    }
  },
};

