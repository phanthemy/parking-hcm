export const CATEGORY_DEFAULT_IMAGES: Record<string, string[]> = {
  PARKING_LOT: ['/images/categories/parking_1.jpg', '/images/categories/parking_2.jpg'],
  CAFE: ['/images/categories/cafe_1.jpg'],
  RESTAURANT: ['/images/categories/restaurant_1.jpg'],
  RESTROOM: ['/images/categories/restroom_1.jpg'],
  GARAGE: ['/images/categories/garage_1.jpg'],
  CARWASH: ['/images/categories/carwash_1.jpg'],
  SERVICE: ['/images/categories/service_1.jpg'],
};

export function getDefaultImageForSpot(type?: string, spotId?: string): string {
  const categoryKey = type ? type.toUpperCase() : 'PARKING_LOT';
  const images = CATEGORY_DEFAULT_IMAGES[categoryKey] || CATEGORY_DEFAULT_IMAGES.PARKING_LOT;

  if (!spotId) return images[0];

  let hash = 0;
  for (let i = 0; i < spotId.length; i++) {
    hash = (hash << 5) - hash + spotId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % images.length;
  return images[index];
}
