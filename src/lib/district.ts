// Helper chuẩn hóa & trích xuất chính xác 22 Quận / Huyện TP.HCM từ chuỗi địa chỉ
// Khắc phục triệt để lỗi gán nhầm: "Hiệp Bình Chánh" (Thủ Đức) -> "Bình Chánh", "Quận 1" -> "Quận 10, 11, 12", "Tân Bình" -> "Bình Tân"

export type DistrictSlug =
  | 'quan-1' | 'quan-3' | 'quan-4' | 'quan-5' | 'quan-6' | 'quan-7' | 'quan-8'
  | 'quan-10' | 'quan-11' | 'quan-12'
  | 'binh-thanh' | 'phu-nhuan' | 'tan-binh' | 'tan-phu' | 'go-vap'
  | 'thu-duc' | 'binh-tan'
  | 'binh-chanh' | 'hoc-mon' | 'cu-chi' | 'nha-be' | 'can-gio';

export function getDistrictFromAddress(address: string | null | undefined): string {
  if (!address) return 'Khu vực khác';
  const addr = address.trim();

  // 1. Kiểm tra các Huyện ngoại thành trước (loại trừ Hiệp Bình Chánh)
  if (/(?:Huyện\s+)?Bình Chánh\b/i.test(addr) && !/Hiệp Bình Chánh/i.test(addr)) return 'Bình Chánh';
  if (/(?:Huyện\s+)?Hóc Môn\b/i.test(addr)) return 'Hóc Môn';
  if (/(?:Huyện\s+)?Củ Chi\b/i.test(addr)) return 'Củ Chi';
  if (/(?:Huyện\s+)?Nhà Bè\b/i.test(addr)) return 'Nhà Bè';
  if (/(?:Huyện\s+)?Cần Giờ\b/i.test(addr)) return 'Cần Giờ';

  // 2. TP Thủ Đức (gồm Quận 2, Quận 9, Thủ Đức, Hiệp Bình Chánh, Hiệp Bình Phước, Thảo Điền, An Phú...)
  if (/(?:TP|Thành phố)\s*Thủ Đức/i.test(addr) || /\bThủ Đức\b/i.test(addr) || /\bQuận\s*2\b/i.test(addr) || /\bQuận\s*9\b/i.test(addr) || /Hiệp Bình/i.test(addr)) {
    return 'TP Thủ Đức';
  }

  // 3. Các quận có số (kiểm tra chính xác ranh giới từ để tránh nhầm số 1 vào 10, 11, 12)
  if (/\bQuận\s*12\b/i.test(addr) || /\bQ\.?\s*12\b/i.test(addr)) return 'Quận 12';
  if (/\bQuận\s*11\b/i.test(addr) || /\bQ\.?\s*11\b/i.test(addr)) return 'Quận 11';
  if (/\bQuận\s*10\b/i.test(addr) || /\bQ\.?\s*10\b/i.test(addr)) return 'Quận 10';
  if (/\bQuận\s*1\b/i.test(addr) || /\bQ\.?\s*1\b/i.test(addr)) return 'Quận 1';
  if (/\bQuận\s*3\b/i.test(addr) || /\bQ\.?\s*3\b/i.test(addr)) return 'Quận 3';
  if (/\bQuận\s*4\b/i.test(addr) || /\bQ\.?\s*4\b/i.test(addr)) return 'Quận 4';
  if (/\bQuận\s*5\b/i.test(addr) || /\bQ\.?\s*5\b/i.test(addr)) return 'Quận 5';
  if (/\bQuận\s*6\b/i.test(addr) || /\bQ\.?\s*6\b/i.test(addr)) return 'Quận 6';
  if (/\bQuận\s*7\b/i.test(addr) || /\bQ\.?\s*7\b/i.test(addr)) return 'Quận 7';
  if (/\bQuận\s*8\b/i.test(addr) || /\bQ\.?\s*8\b/i.test(addr)) return 'Quận 8';

  // 4. Các quận có tên chữ
  if (/\bBình Thạnh\b/i.test(addr)) return 'Bình Thạnh';
  if (/\bPhú Nhuận\b/i.test(addr)) return 'Phú Nhuận';
  if (/\bTân Bình\b/i.test(addr) && !/Bình Tân/i.test(addr)) return 'Tân Bình';
  if (/\bBình Tân\b/i.test(addr)) return 'Bình Tân';
  if (/\bTân Phú\b/i.test(addr)) return 'Tân Phú';
  if (/\bGò Vấp\b/i.test(addr)) return 'Gò Vấp';

  return 'Khu vực khác';
}

// Kiểm tra xem địa chỉ có thuộc một quận/huyện cụ thể theo slug không
export function isAddressInDistrict(address: string | null | undefined, slug: string): boolean {
  if (!address) return false;
  const detected = getDistrictFromAddress(address);

  const SLUG_TO_DISTRICT_NAME: Record<string, string> = {
    'quan-1': 'Quận 1',
    'quan-3': 'Quận 3',
    'quan-4': 'Quận 4',
    'quan-5': 'Quận 5',
    'quan-6': 'Quận 6',
    'quan-7': 'Quận 7',
    'quan-8': 'Quận 8',
    'quan-10': 'Quận 10',
    'quan-11': 'Quận 11',
    'quan-12': 'Quận 12',
    'binh-thanh': 'Bình Thạnh',
    'phu-nhuan': 'Phú Nhuận',
    'tan-binh': 'Tân Bình',
    'tan-phu': 'Tân Phú',
    'go-vap': 'Gò Vấp',
    'thu-duc': 'TP Thủ Đức',
    'binh-tan': 'Bình Tân',
    'binh-chanh': 'Bình Chánh',
    'hoc-mon': 'Hóc Môn',
    'cu-chi': 'Củ Chi',
    'nha-be': 'Nhà Bè',
    'can-gio': 'Cần Giờ',
  };

  const expected = SLUG_TO_DISTRICT_NAME[slug];
  if (!expected) return false;
  return detected === expected;
}
