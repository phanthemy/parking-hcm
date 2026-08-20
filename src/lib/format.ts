/**
 * Format a number as Vietnamese Dong currency
 * @example formatCurrency(20000) => "20.000đ"
 * @example formatCurrency(20000, '/giờ') => "20.000đ/giờ"
 */
export function formatCurrency(amount: number, suffix?: string): string {
  const formatted = new Intl.NumberFormat('vi-VN').format(amount);
  return `${formatted}đ${suffix || ''}`;
}

/**
 * Format a price range
 * @example formatPriceRange(5000, 20000) => "5.000đ - 20.000đ"
 */
export function formatPriceRange(min: number, max: number): string {
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

/**
 * Format a date in Vietnamese locale
 * @example formatDate('2024-01-15') => "15/01/2024"
 */
export function formatDate(date?: string | Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format a date with time in Vietnamese locale
 * @example formatDateTime('2024-01-15T10:30:00') => "15/01/2024, 10:30"
 */
export function formatDateTime(date?: string | Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format relative time (e.g., "2 giờ trước", "3 ngày trước")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  return formatDate(d);
}

/**
 * Format operating hours
 * @example formatHours('06:00', '22:00') => "06:00 - 22:00"
 * @example formatHours(null, null) => "24/7"
 */
export function formatHours(open?: string | null, close?: string | null): string {
  if (!open && !close) return '24/7';
  return `${open || '00:00'} - ${close || '24:00'}`;
}

/**
 * Format distance in meters/kilometers
 * @example formatDistance(500) => "500m"
 * @example formatDistance(1500) => "1.5km"
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)}km`;
}

/**
 * Format phone number for display
 * @example formatPhone('0901234567') => "090 123 4567"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}
