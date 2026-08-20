/**
 * MAPGO SLUG ENGINE - DEDUPLICATION & CONTEXT DISAMBIGUATION
 */

import { slugifyVietnamese } from './slugify';

export interface SlugContext {
  name: string;
  district?: string;
  existingSlugs: Set<string> | string[];
}

export function generateUniqueSlug(context: SlugContext): string {
  const baseSlug = slugifyVietnamese(context.name);
  const existingSet = Array.isArray(context.existingSlugs)
    ? new Set(context.existingSlugs)
    : context.existingSlugs;

  if (!existingSet.has(baseSlug)) {
    return baseSlug;
  }

  // 1. Thử thêm hậu tố Quận/Huyện nếu có
  if (context.district) {
    const districtSlug = slugifyVietnamese(context.district);
    const withDistrict = `${baseSlug}-${districtSlug}`;
    if (!existingSet.has(withDistrict)) {
      return withDistrict;
    }
  }

  // 2. Thêm số thứ tự tăng dần
  let counter = 2;
  while (existingSet.has(`${baseSlug}-${counter}`)) {
    counter++;
  }

  return `${baseSlug}-${counter}`;
}

export * from './slugify';
