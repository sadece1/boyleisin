import { Request } from 'express';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  avatar?: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

// Request with authenticated user
export interface AuthRequest extends Request {
  user?: UserPayload;
}

// Campsite Types
export interface Campsite {
  id: string;
  name: string;
  description: string;
  location_address: string;
  location_city: string;
  location_region: string;
  location_lat?: number | null;
  location_lng?: number | null;
  images: string[];
  amenities: string[];
  rules: string[];
  capacity: number;
  price_per_night: number;
  rating: number;
  review_count: number;
  available: boolean;
  owner_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

// Gear Types
export interface Gear {
  id: string;
  name: string;
  description: string;
  category_id?: string | null;
  images: string[];
  price_per_day: number;
  deposit?: number | null;
  available: boolean;
  status: 'for-sale' | 'sold' | 'orderable';
  specifications: Record<string, any>;
  brand?: string | null;
  color?: string | null;
  rating: number;
  recommended_products: string[];
  owner_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  icon?: string | null;
  order: number;
  created_at: Date;
  updated_at: Date;
}

// Blog Post Types
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  author_avatar?: string | null;
  category: string;
  image: string;
  read_time: number;
  tags: string[];
  featured: boolean;
  views: number;
  recommended_posts: string[];
  created_at: Date;
  updated_at: Date;
}

// Reservation Types
export interface Reservation {
  id: string;
  user_id: string;
  campsite_id?: string | null;
  start_date: Date;
  end_date: Date;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface ReservationGear {
  reservation_id: string;
  gear_id: string;
  quantity: number;
}

// Review Types
export interface Review {
  id: string;
  user_id: string;
  campsite_id?: string | null;
  gear_id?: string | null;
  rating: number;
  comment: string;
  created_at: Date;
}

// Favorite Types
export interface Favorite {
  id: string;
  user_id: string;
  campsite_id?: string | null;
  gear_id?: string | null;
  created_at: Date;
}

// Contact Message Types
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: Date;
  updated_at: Date;
}

// Appointment Types
export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: Date;
  time: string;
  service_type?: string | null;
  message?: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: Date;
  updated_at: Date;
}

// Newsletter Subscription Types
export interface NewsletterSubscription {
  id: string;
  email: string;
  subscribed: boolean;
  subscribed_at: Date;
  unsubscribed_at?: Date | null;
  created_at: Date;
}

// Brand Types
export interface Brand {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

// Color Types
export interface Color {
  id: string;
  name: string;
  hex_code?: string | null;
  created_at: Date;
  updated_at: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}













