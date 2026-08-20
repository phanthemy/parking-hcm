export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('mapgo_favorites') || '[]');
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id.toString());
}

export function toggleFavorite(id: string): boolean {
  if (typeof window === 'undefined') return false;
  const favs = getFavorites();
  const idStr = id.toString();
  const index = favs.indexOf(idStr);
  let updated: string[];
  let state = false;
  if (index >= 0) {
    updated = favs.filter(item => item !== idStr);
    state = false;
  } else {
    updated = [...favs, idStr];
    state = true;
  }
  localStorage.setItem('mapgo_favorites', JSON.stringify(updated));
  window.dispatchEvent(new Event('mapgo_fav_change'));
  return state;
}
