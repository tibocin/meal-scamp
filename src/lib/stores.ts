import { persisted } from 'svelte-local-storage-store';

// Define types for our data structures
export type Meal = {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
  image?: string;
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
