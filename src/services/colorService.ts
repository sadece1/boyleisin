// Color Management Service
// Manages colors using localStorage

export interface Color {
  id: string;
  name: string;
  hexCode?: string; // Optional hex color code for display
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'camp_colors_storage';

// Initial colors with hex codes
const initialColors: Color[] = [
  { id: 'color-1', name: 'Siyah', hexCode: '#000000', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-2', name: 'Beyaz', hexCode: '#FFFFFF', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-3', name: 'Gri', hexCode: '#808080', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-4', name: 'Mavi', hexCode: '#0000FF', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-5', name: 'Yeşil', hexCode: '#008000', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-6', name: 'Kırmızı', hexCode: '#FF0000', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-7', name: 'Sarı', hexCode: '#FFFF00', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-8', name: 'Turuncu', hexCode: '#FFA500', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-9', name: 'Mor', hexCode: '#800080', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-10', name: 'Pembe', hexCode: '#FFC0CB', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-11', name: 'Kahverengi', hexCode: '#A52A2A', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-12', name: 'Bej', hexCode: '#F5F5DC', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-13', name: 'Turkuaz', hexCode: '#40E0D0', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'color-14', name: 'Lacivert', hexCode: '#000080', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const loadColorsFromStorage = (): Color[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // First time - save initial data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialColors));
      return initialColors;
    }
  } catch (error) {
    console.error('Failed to load colors from storage:', error);
  }
  return initialColors;
};

const saveColorsToStorage = (colors: Color[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('colorsUpdated'));
    }
  } catch (error) {
    console.error('Failed to save colors to storage:', error);
    throw new Error('Renkler kaydedilemedi');
  }
};

export const colorService = {
  getAllColors(): Color[] {
    return loadColorsFromStorage();
  },

  getColorById(id: string): Color | undefined {
    const colors = loadColorsFromStorage();
    return colors.find(c => c.id === id);
  },

  getColorByName(name: string): Color | undefined {
    const colors = loadColorsFromStorage();
    return colors.find(c => c.name.toLowerCase() === name.toLowerCase());
  },

  createColor(name: string, hexCode?: string): Color {
    const colors = loadColorsFromStorage();
    
    // Check if color already exists
    const existing = colors.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      throw new Error('Bu renk zaten mevcut');
    }

    const newColor: Color = {
      id: `color-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      hexCode: hexCode?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    colors.push(newColor);
    colors.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    saveColorsToStorage(colors);
    return newColor;
  },

  updateColor(id: string, name: string, hexCode?: string): Color {
    const colors = loadColorsFromStorage();
    const index = colors.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Renk bulunamadı');
    }

    // Check if another color with the same name exists
    const existing = colors.find(c => c.id !== id && c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      throw new Error('Bu renk adı zaten kullanılıyor');
    }

    colors[index] = {
      ...colors[index],
      name: name.trim(),
      hexCode: hexCode?.trim(),
      updatedAt: new Date().toISOString(),
    };

    colors.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    saveColorsToStorage(colors);
    return colors[index];
  },

  deleteColor(id: string): void {
    const colors = loadColorsFromStorage();
    const index = colors.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Renk bulunamadı');
    }

    colors.splice(index, 1);
    saveColorsToStorage(colors);
  },
};














