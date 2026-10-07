export type GeocodeResult = {
  displayName: string;
  lat: number;
  lng: number;
};

// OpenStreetMap Nominatim: ücretsiz, anahtar gerekmez. Kullanım kuralları gereği
// aramayı sadece kullanıcı butona bastığında, kendi isteğiyle yapıyoruz (her tuş
// vuruşunda değil) ve kimliklendirici bir User-Agent gönderiyoruz.
export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=tr&q=${encodeURIComponent(trimmed)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'GelgelApp/1.0 (gelgel pilot uygulamasi)',
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Adres araması başarısız oldu.');
  }
  const data: Array<{ display_name: string; lat: string; lon: string }> = await response.json();
  return data.map((item) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}
