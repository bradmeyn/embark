import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type LocationGroup = {
	location: string;
	days: number;
	startDay: number;
};

/**
 * Groups consecutive days by location.
 * Example: [Paris, Paris, Lyon, Nice, Nice] => [{location: Paris, days: 2, startDay: 1}, {location: Lyon, days: 1, startDay: 3}, {location: Nice, days: 2, startDay: 4}]
 */
export function groupLocationsByConsecutive(
	days: { location: string; dayNumber?: number | null }[]
): LocationGroup[] {
	return days.reduce((groups: LocationGroup[], day, index) => {
		const lastGroup = groups[groups.length - 1];
		if (lastGroup && lastGroup.location === day.location) {
			lastGroup.days++;
		} else {
			groups.push({
				location: day.location,
				days: 1,
				startDay: day.dayNumber ?? index + 1
			});
		}
		return groups;
	}, []);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
