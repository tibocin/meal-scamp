import { persisted } from 'svelte-local-storage-store';
import { get } from 'svelte/store';
import seedMealsData from '$lib/data/seed-meals.json';

// Define types for our data structures
export type Meal = {
  id: string;
  name: string;
  mealType: string;
  portions: {
    protein_palms: number;
    veg_fists: number;
    starch_fists: number;
    fat_thumbs: number;
    fruit_fists: number;
  };
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
  }>;
  steps: string[];
  tags: string[];
};

export type Workout = {
  id: string;
  name: string;
  description: string;
  duration: number;
  calories: number;
};

// Use persisted() instead of writable() for Svelte 5 compatibility
export const meals = persisted<Meal[]>('meals-v1', []);
export const plan = persisted<Record<string, string[]>>('plan-v1', {});
export const punches = persisted<Record<string, boolean>>('punches-v1', {});
export const workouts = persisted<Record<string, string[]>>('workouts-v1', {});
export const goal = persisted<{ start: number; target: number; current: number; startedAt: string }>('goal-v1', { start: 175, target: 150, current: 175, startedAt: new Date().toISOString() });
export const pushover = persisted<{ userKey: string; appToken: string; enabled: boolean }>('pushover-v1', { userKey: '', appToken: '', enabled: false });

// Date range for meal and exercise planning
export const dateRange = persisted<{ start: string; end: string }>('date-range-v1', {
  start: new Date().toISOString().slice(0, 10),
  end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) // 7 days from now
});

// Helper function to generate date range
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  
  return dates;
}

// Helper function to get current date range
export function getCurrentDateRange(): string[] {
  const range = get(dateRange);
  return generateDateRange(range.start, range.end);
}

// Use the expanded seed data as fallback
const FALLBACK_MEALS: Meal[] = seedMealsData as Meal[];

// Robust seeding function
export async function seedMeals(): Promise<{ success: boolean; message: string; count: number }> {
	try {
		const response = await fetch('/api/seed');
		if (response.ok) {
			const data = await response.json();
			meals.set(data);
			return { success: true, message: `Loaded ${data.length} meals successfully`, count: data.length };
		} else {
			// Fallback to local data if API fails
			meals.set(FALLBACK_MEALS);
			return { success: true, message: `Loaded ${FALLBACK_MEALS.length} fallback meals`, count: FALLBACK_MEALS.length };
		}
	} catch (error) {
		// Fallback to local data on error
		meals.set(FALLBACK_MEALS);
		return { success: true, message: `Loaded ${FALLBACK_MEALS.length} fallback meals due to error`, count: FALLBACK_MEALS.length };
	}
}

// Check if meals need seeding
export function needsSeeding(): boolean {
  const currentMeals = get(meals);
  return !currentMeals || currentMeals.length === 0;
}

// Import meals from JSON
export function importMealsFromJSON(jsonData: string): { success: boolean; message: string; count: number } {
  try {
    const data = JSON.parse(jsonData);
    if (Array.isArray(data) && data.length > 0) {
      // Validate meal structure
      const validMeals = data.filter(meal =>
        meal.id && meal.name && meal.mealType && meal.portions && meal.ingredients
      );

      if (validMeals.length > 0) {
        meals.set(validMeals);
        return { success: true, message: `Imported ${validMeals.length} valid meals`, count: validMeals.length };
      } else {
        return { success: false, message: 'No valid meals found in JSON', count: 0 };
      }
    } else {
      return { success: false, message: 'Invalid JSON format', count: 0 };
    }
  } catch (error) {
    return { success: false, message: 'Invalid JSON data', count: 0 };
  }
}
