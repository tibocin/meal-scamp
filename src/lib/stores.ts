import { persisted } from 'svelte-local-storage-store';
import { get } from 'svelte/store';

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

// Bundled fallback data
const FALLBACK_MEALS: Meal[] = [
  {
    id: "b01",
    name: "Egg + Spinach Scramble",
    mealType: "breakfast",
    portions: {
      protein_palms: 1.5,
      veg_fists: 2,
      starch_fists: 0,
      fat_thumbs: 1,
      fruit_fists: 0
    },
    ingredients: [
      { name: "eggs", amount: 3, unit: "count" },
      { name: "spinach", amount: 2, unit: "fist" },
      { name: "onion", amount: 0.5, unit: "fist" },
      { name: "olive oil", amount: 1, unit: "thumb" }
    ],
    steps: [
      "Sauté onion 2–3 min in oil",
      "Add spinach to wilt",
      "Scramble in eggs; season"
    ],
    tags: ["quick", "gluten-free"]
  },
  {
    id: "l01",
    name: "Chicken Thigh Bowl",
    mealType: "lunch",
    portions: {
      protein_palms: 1.5,
      veg_fists: 2,
      starch_fists: 1,
      fat_thumbs: 0.5,
      fruit_fists: 0
    },
    ingredients: [
      { name: "chicken thighs", amount: 1.5, unit: "palm" },
      { name: "broccoli", amount: 2, unit: "fist" },
      { name: "rice", amount: 1, unit: "fist" },
      { name: "olive oil", amount: 0.5, unit: "thumb" }
    ],
    steps: [
      "Season chicken thighs",
      "Bake at 400°F for 25-30 min",
      "Steam broccoli",
      "Cook rice",
      "Assemble bowl"
    ],
    tags: ["batch", "protein"]
  }
];

// Robust seeding function
export async function seedMeals(): Promise<{ success: boolean; message: string; count: number }> {
  try {
    // First try the API endpoint
    const response = await fetch('/api/seed');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        meals.set(data);
        return { success: true, message: `Loaded ${data.length} meals from API`, count: data.length };
      }
    }

    // Fallback to bundled data
    meals.set(FALLBACK_MEALS);
    return { success: true, message: `Loaded ${FALLBACK_MEALS.length} sample meals`, count: FALLBACK_MEALS.length };

  } catch (error) {
    console.error('Error seeding meals:', error);
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
