import { NextRequest, NextResponse } from 'next/server';

// Geocode address to lat/lng using Google Maps Geocoding API
export async function POST(request: NextRequest) {
  const { address } = await request.json();
  
  if (!address || address.length < 5) {
    return NextResponse.json({ error: 'Address too short' }, { status: 400 });
  }

  // Append "TP.HCM" for better results
  const fullAddress = address.includes('HCM') || address.includes('Hồ Chí Minh') 
    ? address 
    : `${address}, TP.HCM, Việt Nam`;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  
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
        placeId: result.place_id
      });
    }

    return NextResponse.json({ error: 'Address not found', status: data.status }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
