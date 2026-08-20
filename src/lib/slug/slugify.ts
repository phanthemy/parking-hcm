/**
 * MAPGO SLUG ENGINE - VIETNAMESE SLUGIFIER
 * Handles all Vietnamese tone marks, uppercase Đ/đ, special symbols, and URL safety
 */

export function slugifyVietnamese(text: string): string {
  if (!text) return '';

  let slug = text.toLowerCase();

  // Chuyển ký tự Đ/đ
  slug = slug.replace(/đ/g, 'd').replace(/Đ/g, 'd');

  // Bỏ dấu tiếng Việt
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Thay thế ký tự đặc biệt bằng dấu gạch ngang
  slug = slug.replace(/[^a-z0-9\s-]/g, '');

  // Chuyển khoảng trắng và gạch ngang liền kề thành 1 gạch ngang duy nhất
  slug = slug.replace(/[\s-]+/g, '-');

  // Xóa gạch ngang ở đầu và cuối
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}
