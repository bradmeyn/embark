<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { DayWithActivities } from '$db/schemas/itinerary';
	import { groupLocationsByConsecutive } from '$lib/utils';

	let { days, class: className = 'h-[600px] ' }: { days: DayWithActivities[]; class?: string } =
		$props();

	let mapContainer: HTMLDivElement;
	let map: import('maplibre-gl').Map | undefined;

	// Build location groups with coordinates (use first day's coords per group)
	function getGeocodedGroups() {
		const groups = groupLocationsByConsecutive(days);
		return groups
			.map((group) => {
				const matchingDay = days.find(
					(d) => d.location === group.location && d.latitude != null && d.longitude != null
				);
				return {
					...group,
					lat: matchingDay?.latitude ?? null,
					lng: matchingDay?.longitude ?? null
				};
			})
			.filter((g) => g.lat != null && g.lng != null) as ((typeof groups)[number] & {
			lat: number;
			lng: number;
		})[];
	}

	onMount(async () => {
		if (!browser) return;

		const maplibre = await import('maplibre-gl');
		await import('maplibre-gl/dist/maplibre-gl.css');

		const geocodedGroups = getGeocodedGroups();
		if (geocodedGroups.length === 0) return;

		map = new maplibre.Map({
			container: mapContainer,
			style: 'https://tiles.openfreemap.org/styles/liberty',
			zoom: 10
		});

		map.on('load', () => {
			if (!map) return;

			// Add markers
			geocodedGroups.forEach((group, i) => {
				const el = document.createElement('div');
				el.style.cssText = `
					width: 28px;
					height: 28px;
					border-radius: 50%;
					background-color: #c2410c;
					border: 2px solid white;
					box-shadow: 0 2px 6px rgba(0,0,0,0.3);
					display: flex;
					align-items: center;
					justify-content: center;
					color: white;
					font-size: 11px;
					font-weight: 700;
					cursor: pointer;
				`;
				el.textContent = String(i + 1);

				const nightLabel = group.days === 1 ? 'night' : 'nights';
				new maplibre.Marker({ element: el })
					.setLngLat([group.lng, group.lat])
					.setPopup(
						new maplibre.Popup({ offset: 20 }).setHTML(
							`<strong>${group.location}</strong> — ${group.days} ${nightLabel}`
						)
					)
					.addTo(map!);
			});

			// Add route line if 2+ locations
			if (geocodedGroups.length >= 2) {
				map.addSource('route', {
					type: 'geojson',
					data: {
						type: 'Feature',
						geometry: {
							type: 'LineString',
							coordinates: geocodedGroups.map((g) => [g.lng, g.lat])
						},
						properties: {}
					}
				});

				map.addLayer({
					id: 'route',
					type: 'line',
					source: 'route',
					paint: {
						'line-color': '#c2410c',
						'line-width': 2,
						'line-dasharray': [2, 3]
					}
				});
			}

			// Fit bounds
			if (geocodedGroups.length >= 2) {
				const lngs = geocodedGroups.map((g) => g.lng);
				const lats = geocodedGroups.map((g) => g.lat);
				map.fitBounds(
					[
						[Math.min(...lngs), Math.min(...lats)],
						[Math.max(...lngs), Math.max(...lats)]
					],
					{ padding: 60, maxZoom: 12 }
				);
			} else {
				map.setCenter([geocodedGroups[0].lng, geocodedGroups[0].lat]);
				map.setZoom(10);
			}
		});
	});

	onDestroy(() => {
		map?.remove();
	});
</script>

<div bind:this={mapContainer} class="{className} w-full overflow-hidden rounded-xl"></div>
