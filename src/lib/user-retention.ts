/**
 * User Retention Engine — MapGo Sprint 7.1
 * Quản lý Favorites, Recent Places, Home, Work, Recently Viewed
 */

import { Spot } from './types';

export interface SavedLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export interface RetentionSpotSummary {
  id: string;
  slug?: string;
  name: string;
  address: string;
  type: string;
  latitude: number;
  longitude: number;
  pricePerHourCar?: number;
  rating?: number;
  carSlots?: number;
  timestamp: string;
}

const KEYS = {
  FAVORITES: 'mapgo_favorites',
  RECENT_PLACES: 'mapgo_recent_places',
  RECENTLY_VIEWED: 'mapgo_recently_viewed',
  HOME: 'mapgo_home_location',
  WORK: 'mapgo_work_location',
  VISIT_COUNT: 'mapgo_visit_count',
  LAST_VISIT: 'mapgo_last_visit_at',
  PWA_DISMISSED: 'mapgo_pwa_banner_dismissed_at',
};

function safeGetJSON<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function safeSetJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[UserRetention] LocalStorage write error:', e);
  }
}

// 1. Favorites
export function getFavoriteSpots(): RetentionSpotSummary[] {
  return safeGetJSON<RetentionSpotSummary[]>(KEYS.FAVORITES, []);
}

export function isSpotFavorite(spotId: string): boolean {
  const favorites = getFavoriteSpots();
  return favorites.some(f => f.id === spotId);
}

export function toggleFavoriteSpot(spot: Spot): boolean {
  const favorites = getFavoriteSpots();
  const exists = favorites.some(f => f.id === spot.id);
  let updated: RetentionSpotSummary[];

  if (exists) {
    updated = favorites.filter(f => f.id !== spot.id);
  } else {
    const summary: RetentionSpotSummary = {
      id: spot.id,
      slug: spot.slug,
      name: spot.name,
      address: spot.address,
      type: spot.type,
      latitude: spot.latitude,
      longitude: spot.longitude,
      pricePerHourCar: spot.pricePerHourCar || spot.basePricePerHour,
      rating: spot.rating,
      carSlots: spot.carSlots,
      timestamp: new Date().toISOString(),
    };
    updated = [summary, ...favorites].slice(0, 50); // Lưu tối đa 50 điểm
  }

  safeSetJSON(KEYS.FAVORITES, updated);
  return !exists;
}

// 2. Recent Places (Dẫn đường hoặc chọn điểm)
export function getRecentPlaces(): RetentionSpotSummary[] {
  return safeGetJSON<RetentionSpotSummary[]>(KEYS.RECENT_PLACES, []);
}

export function addRecentPlace(spot: Spot): void {
  const list = getRecentPlaces().filter(p => p.id !== spot.id);
  const summary: RetentionSpotSummary = {
    id: spot.id,
    slug: spot.slug,
    name: spot.name,
    address: spot.address,
    type: spot.type,
    latitude: spot.latitude,
    longitude: spot.longitude,
    pricePerHourCar: spot.pricePerHourCar || spot.basePricePerHour,
    rating: spot.rating,
    carSlots: spot.carSlots,
    timestamp: new Date().toISOString(),
  };
  safeSetJSON(KEYS.RECENT_PLACES, [summary, ...list].slice(0, 20));
}

// 3. Recently Viewed
export function getRecentlyViewed(): RetentionSpotSummary[] {
  return safeGetJSON<RetentionSpotSummary[]>(KEYS.RECENTLY_VIEWED, []);
}

export function addRecentlyViewed(spot: Spot): void {
  const list = getRecentlyViewed().filter(p => p.id !== spot.id);
  const summary: RetentionSpotSummary = {
    id: spot.id,
    slug: spot.slug,
    name: spot.name,
    address: spot.address,
    type: spot.type,
    latitude: spot.latitude,
    longitude: spot.longitude,
    pricePerHourCar: spot.pricePerHourCar || spot.basePricePerHour,
    rating: spot.rating,
    carSlots: spot.carSlots,
    timestamp: new Date().toISOString(),
  };
  safeSetJSON(KEYS.RECENTLY_VIEWED, [summary, ...list].slice(0, 15));
}

// 4. Home & Work Locations
export function getHomeLocation(): SavedLocation | null {
  return safeGetJSON<SavedLocation | null>(KEYS.HOME, null);
}

export function setHomeLocation(loc: SavedLocation): void {
  safeSetJSON(KEYS.HOME, loc);
}

export function clearHomeLocation(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(KEYS.HOME);
}

export function getWorkLocation(): SavedLocation | null {
  return safeGetJSON<SavedLocation | null>(KEYS.WORK, null);
}

export function setWorkLocation(loc: SavedLocation): void {
  safeSetJSON(KEYS.WORK, loc);
}

export function clearWorkLocation(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(KEYS.WORK);
}

// 5. Visit Tracking for PWA Banner Condition (Visit >= 2, Session >= 30s, <= 1 time/week)
export function recordVisit(): number {
  if (typeof window === 'undefined') return 1;
  const currentCount = parseInt(localStorage.getItem(KEYS.VISIT_COUNT) || '0', 10);
  const newCount = currentCount + 1;
  localStorage.setItem(KEYS.VISIT_COUNT, newCount.toString());
  localStorage.setItem(KEYS.LAST_VISIT, new Date().toISOString());
  return newCount;
}

export function getVisitCount(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(KEYS.VISIT_COUNT) || '0', 10);
}

export function isPwaBannerAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  // Check standalone mode (already installed)
  if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
    return false;
  }

  // Visit count condition: >= 2
  const count = getVisitCount();
  if (count < 2) return false;

  // Dismiss interval: not more than once every 7 days (604800000 ms)
  const dismissedAt = localStorage.getItem(KEYS.PWA_DISMISSED);
  if (dismissedAt) {
    const timeDiff = Date.now() - new Date(dismissedAt).getTime();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (timeDiff < SEVEN_DAYS_MS) {
      return false;
    }
  }

  return true;
}

export function dismissPwaBanner(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.PWA_DISMISSED, new Date().toISOString());
}
