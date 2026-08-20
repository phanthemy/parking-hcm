// Helper chuẩn hóa & trích xuất chính xác 22 Quận / Huyện TP.HCM từ chuỗi địa chỉ
// Sử dụng Unicode-safe word boundaries (?![a-zA-ZÀ-ỹ]) thay vì \b để xử lý chuẩn xác tiếng Việt có dấu

export type DistrictSlug =
  | 'quan-1' | 'quan-3' | 'quan-4' | 'quan-5' | 'quan-6' | 'quan-7' | 'quan-8'
  | 'quan-10' | 'quan-11' | 'quan-12'
  | 'binh-thanh' | 'phu-nhuan' | 'tan-binh' | 'tan-phu' | 'go-vap'
  | 'thu-duc' | 'binh-tan'
  | 'binh-chanh' | 'hoc-mon' | 'cu-chi' | 'nha-be' | 'can-gio';

export function getDistrictFromAddress(address: string | null | undefined): string {
  if (!address) return 'Khu vực khác';
  const addr = address.trim();

  // 1. Kiểm tra 5 Huyện ngoại thành (loại trừ Hiệp Bình Chánh)
  if (/(?:Huyện\s+)?Bình Chánh(?![a-zA-ZÀ-ỹ])/i.test(addr) && !/Hiệp Bình Chánh/i.test(addr)) return 'Bình Chánh';
  if (/(?:Huyện\s+)?Hóc Môn(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Hóc Môn';
  if (/(?:Huyện\s+)?Củ Chi(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Củ Chi';
  if (/(?:Huyện\s+)?Nhà Bè(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Nhà Bè';
  if (/(?:Huyện\s+)?Cần Giờ(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Cần Giờ';

  // 2. TP Thủ Đức (gồm Quận 2, Quận 9, Thủ Đức, Hiệp Bình Chánh, Hiệp Bình Phước, Thảo Điền, An Phú...)
  if (/(?:TP|Thành phố)\s*Thủ Đức/i.test(addr) || /Thủ Đức(?![a-zA-ZÀ-ỹ])/i.test(addr) || /Quận\s*2(?![0-9])/i.test(addr) || /Quận\s*9(?![0-9])/i.test(addr) || /Hiệp Bình/i.test(addr)) {
    return 'TP Thủ Đức';
  }

  // 3. Các quận có số (kiểm tra chính xác số để tránh nhầm số 1 vào 10, 11, 12)
  if (/Quận\s*12(?![0-9])/i.test(addr) || /Q\.?\s*12(?![0-9])/i.test(addr)) return 'Quận 12';
  if (/Quận\s*11(?![0-9])/i.test(addr) || /Q\.?\s*11(?![0-9])/i.test(addr)) return 'Quận 11';
  if (/Quận\s*10(?![0-9])/i.test(addr) || /Q\.?\s*10(?![0-9])/i.test(addr)) return 'Quận 10';
  if (/Quận\s*1(?![0-9])/i.test(addr) || /Q\.?\s*1(?![0-9])/i.test(addr)) return 'Quận 1';
  if (/Quận\s*3(?![0-9])/i.test(addr) || /Q\.?\s*3(?![0-9])/i.test(addr)) return 'Quận 3';
  if (/Quận\s*4(?![0-9])/i.test(addr) || /Q\.?\s*4(?![0-9])/i.test(addr)) return 'Quận 4';
  if (/Quận\s*5(?![0-9])/i.test(addr) || /Q\.?\s*5(?![0-9])/i.test(addr)) return 'Quận 5';
  if (/Quận\s*6(?![0-9])/i.test(addr) || /Q\.?\s*6(?![0-9])/i.test(addr)) return 'Quận 6';
  if (/Quận\s*7(?![0-9])/i.test(addr) || /Q\.?\s*7(?![0-9])/i.test(addr)) return 'Quận 7';
  if (/Quận\s*8(?![0-9])/i.test(addr) || /Q\.?\s*8(?![0-9])/i.test(addr)) return 'Quận 8';

  // 4. Các quận có tên chữ
  if (/Bình Thạnh(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Bình Thạnh';
  if (/Phú Nhuận(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Phú Nhuận';
  if (/Tân Bình(?![a-zA-ZÀ-ỹ])/i.test(addr) && !/Bình Tân/i.test(addr)) return 'Tân Bình';
  if (/Bình Tân(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Bình Tân';
  if (/Tân Phú(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Tân Phú';
  if (/Gò Vấp(?![a-zA-ZÀ-ỹ])/i.test(addr)) return 'Gò Vấp';

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
