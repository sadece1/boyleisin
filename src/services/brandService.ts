// Brand Management Service
// Manages brands using localStorage

export interface Brand {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'camp_brands_storage';

// Initial brands
const initialBrands: Brand[] = [
  { id: 'brand-1', name: 'Coleman', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'brand-2', name: 'MSR', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'brand-3', name: 'The North Face', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'brand-4', name: 'REI', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'brand-5', name: 'Big Agnes', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'brand-6', name: 'Sea to Summit', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'brand-7', name: 'Osprey', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'brand-8', name: 'Patagonia', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'brand-9', name: 'Black Diamond', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'brand-10', name: 'Marmot', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const loadBrandsFromStorage = (): Brand[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // First time - save initial data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBrands));
      return initialBrands;
    }
  } catch (error) {
    console.error('Failed to load brands from storage:', error);
  }
  return initialBrands;
};

const saveBrandsToStorage = (brands: Brand[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(brands));
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('brandsUpdated'));
    }
  } catch (error) {
    console.error('Failed to save brands to storage:', error);
    throw new Error('Markalar kaydedilemedi');
  }
};

export const brandService = {
  getAllBrands(): Brand[] {
    return loadBrandsFromStorage();
  },

  getBrandById(id: string): Brand | undefined {
    const brands = loadBrandsFromStorage();
    return brands.find(b => b.id === id);
  },

  getBrandByName(name: string): Brand | undefined {
    const brands = loadBrandsFromStorage();
    return brands.find(b => b.name.toLowerCase() === name.toLowerCase());
  },

  createBrand(name: string): Brand {
    const brands = loadBrandsFromStorage();
    
    // Check if brand already exists
    const existing = brands.find(b => b.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      throw new Error('Bu marka zaten mevcut');
    }

    const newBrand: Brand = {
      id: `brand-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    brands.push(newBrand);
    brands.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    saveBrandsToStorage(brands);
    return newBrand;
  },

  updateBrand(id: string, name: string): Brand {
    const brands = loadBrandsFromStorage();
    const index = brands.findIndex(b => b.id === id);
    
    if (index === -1) {
      throw new Error('Marka bulunamadı');
    }

    // Check if another brand with the same name exists
    const existing = brands.find(b => b.id !== id && b.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      throw new Error('Bu marka adı zaten kullanılıyor');
    }

    brands[index] = {
      ...brands[index],
      name: name.trim(),
      updatedAt: new Date().toISOString(),
    };

    brands.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    saveBrandsToStorage(brands);
    return brands[index];
  },

  deleteBrand(id: string): void {
    const brands = loadBrandsFromStorage();
    const index = brands.findIndex(b => b.id === id);
    
    if (index === -1) {
      throw new Error('Marka bulunamadı');
    }

    brands.splice(index, 1);
    saveBrandsToStorage(brands);
  },
};














