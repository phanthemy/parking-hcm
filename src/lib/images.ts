/**
 * MapGo Branded Category Visuals & Image Provider
 * Follows HERE / TomTom GIS standards:
 * Never use arbitrary stock photos for real local businesses.
 * Displays high-contrast, clean vector banners when no verified real photos exist.
 */

export const CATEGORY_BRAND_COLORS: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  PARKING_LOT: { bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', text: '#ffffff', icon: '🅿️', label: 'Bãi đỗ xe' },
  PARKING: { bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', text: '#ffffff', icon: '🅿️', label: 'Bãi đỗ xe' },
  FUEL: { bg: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)', text: '#ffffff', icon: '⛽', label: 'Trạm xăng dầu' },
  EV_CHARGING: { bg: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)', text: '#ffffff', icon: '⚡', label: 'Trạm sạc xe điện EV' },
  EV_CHARGER: { bg: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)', text: '#ffffff', icon: '⚡', label: 'Trạm sạc xe điện EV' },
  CAR_REPAIR: { bg: 'linear-gradient(135deg, #312e81 0%, #6366f1 100%)', text: '#ffffff', icon: '🔧', label: 'Gara & Cứu hộ ô tô' },
  GARAGE: { bg: 'linear-gradient(135deg, #312e81 0%, #6366f1 100%)', text: '#ffffff', icon: '🔧', label: 'Gara & Cứu hộ ô tô' },
  CAR_WASH: { bg: 'linear-gradient(135deg, #164e63 0%, #06b6d4 100%)', text: '#ffffff', icon: '🚿', label: 'Rửa xe & Chăm sóc xe' },
  CARWASH: { bg: 'linear-gradient(135deg, #164e63 0%, #06b6d4 100%)', text: '#ffffff', icon: '🚿', label: 'Rửa xe & Chăm sóc xe' },
  INSPECTION: { bg: 'linear-gradient(135deg, #881337 0%, #e11d48 100%)', text: '#ffffff', icon: '📋', label: 'Trung tâm Đăng kiểm' },
  RESTROOM: { bg: 'linear-gradient(135deg, #134e4a 0%, #14b8a6 100%)', text: '#ffffff', icon: '🚻', label: 'Nhà vệ sinh công cộng' },
  RESTAURANT: { bg: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)', text: '#ffffff', icon: '🍜', label: 'Quán ăn có bãi đỗ xe' },
  CAFE: { bg: 'linear-gradient(135deg, #451a03 0%, #d97706 100%)', text: '#ffffff', icon: '☕', label: 'Cà phê có bãi đỗ xe' },
  SERVICE: { bg: 'linear-gradient(135deg, #1e293b 0%, #64748b 100%)', text: '#ffffff', icon: '🏢', label: 'Tiện ích dịch vụ' },
};

export function getCategoryBrand(type: string) {
  const t = (type || 'PARKING').toUpperCase();
  return CATEGORY_BRAND_COLORS[t] || CATEGORY_BRAND_COLORS.PARKING;
}

export function getDefaultImageForSpot(type: string, spotId?: string): string {
  // Return empty string to trigger clean vector hero card in UI
  return '';
}
