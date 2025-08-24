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

// Use the expanded seed data as fallback
const FALLBACK_MEALS: Meal[] = seedMealsData as Meal[];

// Robust seeding function
export async function seedMeals(): Promise<{ success: boolean; message: string; count: number }> {
	try {
		console.log('🌱 Starting meal seeding...');
		
		// First try the API endpoint
		const response = await fetch('/api/seed');
		if (response.ok) {
			const data = await response.json();
			console.log('📡 API response received:', data.length, 'meals');
			
			if (Array.isArray(data) && data.length > 0) {
				meals.set(data);
				console.log('✅ Meals loaded from API:', data.length);
				return { success: true, message: `Loaded ${data.length} meals from API`, count: data.length };
			}
		}

		console.log('⚠️ API failed, using fallback data:', FALLBACK_MEALS.length, 'meals');
		// Fallback to bundled data
		meals.set(FALLBACK_MEALS);
		return { success: true, message: `Loaded ${FALLBACK_MEALS.length} sample meals`, count: FALLBACK_MEALS.length };

	} catch (error) {
		console.error('❌ Error seeding meals:', error);
		// Final fallback to bundled data
		meals.set(FALLBACK_MEALS);
		return { success: true, message: `Loaded ${FALLBACK_MEALS.length} sample meals (fallback)`, count: FALLBACK_MEALS.length };
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
