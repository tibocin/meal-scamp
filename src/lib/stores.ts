import { writable } from 'svelte-local-storage-store';

export type Meal = {
  id: string;
  name: string;
  mealType: 'breakfast'|'lunch'|'dinner';
  portions: { protein_palms:number; veg_fists:number; starch_fists:number; fat_thumbs:number; fruit_fists:number };
  ingredients: { name:string; amount:number; unit:string }[];
  steps: string[];
  tags: string[];
};

export const meals = writable<Meal[]>('meals-v1', []);
export const plan = writable<Record<string, string[]>>('plan-v1', {}); // date -> meal IDs
export const punches = writable<Record<string, boolean>>('punches-v1', {}); // date -> done
export const workouts = writable<Record<string, string[]>>('workouts-v1', {}); // date -> categories
export const goal = writable<{start:number; target:number; current:number; startedAt:string}>('goal-v1', {start:175, target:150, current:175, startedAt: new Date().toISOString()});
export const pushover = writable<{userKey:string; appToken:string; enabled:boolean}>('pushover-v1', {userKey:'', appToken:'', enabled:false});
