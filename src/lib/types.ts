export type SpotType = 'PARKING_LOT' | 'RESTAURANT' | 'CAFE' | 'RESTROOM' | 'SERVICE' | 'GARAGE' | 'CARWASH';

export interface Spot {
  id: string;
  name: string;
  type: SpotType;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  phone?: string;
  website?: string;
  images: string[];
  carSlots: number;
  bikeSlots: number;
  pricePerHourCar?: number;
  pricePerHourBike?: number;
  openTime?: string;
  closeTime?: string;
  rating: number;
  reviewCount: number;
  isPremium: boolean;
  isVerified: boolean;
  status: 'active' | 'pending' | 'hidden';
  ownerId?: string;
  menu?: MenuItem[];
  services?: string[];
  promotions?: Promotion[];
  distance?: number;
  source?: string;
  googleRating?: number;
  googlePlaceId?: string;
  sourceId?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
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
  type?: SpotType | 'all';
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

export const SPOT_TYPE_LABELS: Record<SpotType, string> = {
  PARKING_LOT: 'Bãi xe',
  RESTAURANT: 'Quán ăn',
  CAFE: 'Café',
  RESTROOM: 'Vệ sinh',
  SERVICE: 'Dịch vụ',
  GARAGE: 'Cứu hộ/Sửa xe',
  CARWASH: 'Rửa xe',
};

export const SPOT_TYPE_ICONS: Record<SpotType, string> = {
  PARKING_LOT: '🅿️',
  RESTAURANT: '🍜',
  CAFE: '☕',
  RESTROOM: '🚻',
  SERVICE: '🏢',
  GARAGE: '🔧',
  CARWASH: '🛀',
};
