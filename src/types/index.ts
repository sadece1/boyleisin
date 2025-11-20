// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Campsite Types
export interface Campsite {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    region: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  amenities: string[];
  rules: string[];
  capacity: number;
  pricePerNight: number;
  rating?: number;
  reviewCount?: number;
  available: boolean;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampsiteFilters {
  search?: string;
  city?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  capacity?: number;
  available?: boolean;
  minRating?: number;
}

// Gear Types
export type GearStatus = 'for-sale' | 'sold' | 'waiting' | 'arrived' | 'shipped'; // Satılık | Satıldı | Bekleniyor | Ürün Geldi | Yola Çıktı

export interface Gear {
  id: string;
  name: string;
  description: string;
  category: GearCategory | string; // Can be slug or categoryId (flexible)
  categoryId?: string; // Direct category ID (new hierarchical system)
  images: string[];
  pricePerDay: number;
  deposit?: number;
  available: boolean; // Deprecated: use status instead, but keep for backward compatibility
  status?: GearStatus; // Satılık, Satıldı, Sipariş Edilebilir
  specifications?: Record<string, string>;
  brand?: string; // Marka bilgisi
  color?: string; // Renk bilgisi
  rating?: number; // Değerlendirme (1-5 yıldız)
  recommendedProducts?: string[]; // Önerilen ürün ID'leri (3-4 adet)
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export type GearCategory = 
  | 'tent'
  | 'sleeping-bag'
  | 'cooking'
  | 'lighting'
  | 'backpack'
  | 'furniture'
  | 'other';

export interface GearFilters {
  search?: string;
  category?: GearCategory;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  status?: GearStatus | 'for-sale-or-sold'; // 'for-sale-or-sold' means both for-sale and sold
  brand?: string;
  color?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest' | 'oldest';
  minRating?: number;
}

// Reservation Types
export interface Reservation {
  id: string;
  userId: string;
  campsiteId?: string;
  gearIds?: string[];
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  campsiteId?: string;
  gearId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface AppointmentForm {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  serviceType?: string;
  message?: string;
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  category: string;
  image: string;
  readTime: number;
  tags?: string[];
  featured?: boolean;
  views?: number;
  recommendedPosts?: string[]; // Önerilen blog yazısı ID'leri (en fazla 4 adet)
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogFilters {
  search?: string;
  category?: string;
  featured?: boolean;
}

// Message Types
export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Newsletter Types
export interface NewsletterSubscription {
  id: string;
  email: string;
  subscribed: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
  createdAt: string;
}

// Appointment Types (Detailed)
export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  serviceType?: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  icon?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter Sidebar Types
export interface FilterState {
  search: string;
  filters: CampsiteFilters | GearFilters;
  isOpen: boolean;
}

// User Order Types (Sipariş Takip Sistemi)
export type UserOrderStatus = 'waiting' | 'arrived' | 'shipped'; // Bekleniyor | Ürün Geldi | Yola Çıktı

export interface UserOrder {
  id: string;
  userId: string;
  gearId: string;
  status: UserOrderStatus;
  price: number;
  publicNote?: string; // Kullanıcıya gösterilecek not
  privateNote?: string; // Sadece admin görecek özel not
  shippedDate?: string; // Yola çıktı tarihi (ISO format)
  shippedTime?: string; // Yola çıktı saati (HH:mm format)
  createdAt: string;
  updatedAt: string;
}

export interface UserOrderForm {
  userId: string;
  gearId: string;
  status: UserOrderStatus;
  price: number;
  publicNote?: string;
  privateNote?: string;
  shippedDate?: string;
  shippedTime?: string;
}

