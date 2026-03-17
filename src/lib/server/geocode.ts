export async function geocodeLocation(
	location: string
): Promise<{ lat: number; lng: number } | null> {
	try {
		const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
		const response = await fetch(url, {
			headers: { 'User-Agent': 'Embark/1.0' }
		});
		if (!response.ok) return null;
		const results = await response.json();
		if (!results || results.length === 0) return null;
		return {
			lat: parseFloat(results[0].lat),
			lng: parseFloat(results[0].lon)
		};
	} catch {
		return null;
	}
}
