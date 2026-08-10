import { NextRequest, NextResponse } from 'next/server';

// Geocode address to lat/lng using Google Maps Geocoding API
// Falls back to Nominatim (OpenStreetMap) if Google fails
export async function POST(request: NextRequest) {
  const { address } = await request.json();
  
  if (!address || address.length < 3) {
    return NextResponse.json({ error: 'Address too short' }, { status: 400 });
  }

  // Clean up address for better geocoding
  let cleanAddress = address
    .replace(/đ\/c\s*:?\s*/gi, '')
    .replace(/📍/g, '')
    .replace(/[^\w\sÀ-ỹ,./\-]/g, '')
    .trim();

  // Append "TP.HCM" for better results
  const fullAddress = cleanAddress.includes('HCM') || cleanAddress.includes('Hồ Chí Minh') 
    ? cleanAddress 
    : `${cleanAddress}, TP.HCM, Việt Nam`;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  
  // Strategy 1: Google Maps Geocoding
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}&language=vi&region=vn`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return NextResponse.json({
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        source: 'google'
      });
    }
  } catch {}

  // Strategy 2: Try with simplified address (remove special chars)
  try {
    const simplified = cleanAddress
      .replace(/xã|huyện|quận|phường|đường|tp\.|thành phố/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    const url2 = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(simplified + ', Ho Chi Minh City, Vietnam')}&key=${apiKey}&language=vi&region=vn`;
    const res2 = await fetch(url2);
    const data2 = await res2.json();

    if (data2.status === 'OK' && data2.results.length > 0) {
      const result = data2.results[0];
      return NextResponse.json({
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        source: 'google_simplified'
      });
    }
  } catch {}

  // Strategy 3: Nominatim (OpenStreetMap) fallback
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1&countrycodes=vn`;
    const nomRes = await fetch(nomUrl, { headers: { 'User-Agent': 'MapGo/1.0' } });
    const nomData = await nomRes.json();

    if (nomData.length > 0) {
      return NextResponse.json({
        lat: parseFloat(nomData[0].lat),
        lng: parseFloat(nomData[0].lon),
        formattedAddress: nomData[0].display_name,
        source: 'nominatim'
      });
    }
  } catch {}

  return NextResponse.json({ error: 'Address not found' }, { status: 404 });
}
