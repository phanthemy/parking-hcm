export type SpotType =
  | 'PARKING_LOT'
  | 'PARKING'
  | 'FUEL'
  | 'EV_CHARGING'
  | 'EV_CHARGER'
  | 'CAR_REPAIR'
  | 'GARAGE'
  | 'CAR_WASH'
  | 'CARWASH'
  | 'INSPECTION'
  | 'RESTAURANT'
  | 'CAFE'
  | 'RESTROOM'
  | 'SERVICE';

export interface Spot {
  id: string;
  slug?: string;
  name: string;
  type: SpotType | string;
  category?: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  phone?: string;
  website?: string;
  images: string[];
  carSlots: number;
  bikeSlots: number;
  basePricePerHour?: number;
  pricePerHourCar?: number;
  pricePerHourBike?: number;
  openTime?: string;
  closeTime?: string;
  rating: number;
  reviewCount: number;
  isPremium: boolean;
  isVerified?: boolean;
  status: 'active' | 'pending' | 'hidden' | 'ACTIVE';
  ownerId?: string;
  menu?: MenuItem[];
  services?: string[];
  promotions?: Promotion[];
  distance?: any;
  distanceKm?: number | null;
  confidenceScore?: number;
  confidenceReasons?: string[];
  metadata?: any;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export interface Promotion {
  title: string;
  description: string;
  validUntil?: string;
}

export interface Review {
  id: string;
  spotId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'driver' | 'business' | 'admin';
  phone?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SpotFilters {
  type?: string | 'all';
  sort?: 'nearest' | 'cheapest' | 'rating';
  search?: string;
  lat?: number;
  lng?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const SPOT_TYPE_LABELS: Record<string, string> = {
  PARKING_LOT: 'Bãi xe',
  PARKING: 'Bãi xe',
  FUEL: 'Cây xăng',
  EV_CHARGING: 'Trạm sạc EV',
  EV_CHARGER: 'Trạm sạc EV',
  CAR_REPAIR: 'Gara & Vá vỏ',
  GARAGE: 'Gara & Sửa xe',
  CAR_WASH: 'Rửa xe',
  CARWASH: 'Rửa xe',
  INSPECTION: 'Đăng kiểm',
  RESTAURANT: 'Quán ăn',
  CAFE: 'Café',
  RESTROOM: 'Vệ sinh',
  SERVICE: 'Dịch vụ',
};

export const SPOT_TYPE_ICONS: Record<string, string> = {
  PARKING_LOT: '🅿️',
  PARKING: '🅿️',
  FUEL: '⛽',
  EV_CHARGING: '⚡',
  EV_CHARGER: '⚡',
  CAR_REPAIR: '🔧',
  GARAGE: '🔧',
  CAR_WASH: '🚿',
  CARWASH: '🚿',
  INSPECTION: '📋',
  RESTAURANT: '🍜',
  CAFE: '☕',
  RESTROOM: '🚻',
  SERVICE: '🏢',
};

export const SPOT_TYPE_COLORS: Record<string, string> = {
  PARKING_LOT: '#3B82F6', // Blue
  PARKING: '#3B82F6',
  FUEL: '#F97316',        // Orange
  EV_CHARGING: '#10B981', // Emerald Green
  EV_CHARGER: '#10B981',
  CAR_REPAIR: '#8B5CF6',  // Purple
  GARAGE: '#8B5CF6',
  CAR_WASH: '#06B6D4',    // Cyan
  CARWASH: '#06B6D4',
  INSPECTION: '#EF4444',  // Red
  RESTROOM: '#14B8A6',    // Teal
  RESTAURANT: '#F59E0B',  // Amber
  CAFE: '#D97706',        // Warm amber
  SERVICE: '#64748B',     // Slate
};
