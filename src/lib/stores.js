import { writable } from 'svelte-local-storage-store';

export const meals = writable('meals-v1', []);
export const plan = writable('plan-v1', {}); // date -> meal IDs
export const punches = writable('punches-v1', {}); // date -> done
export const workouts = writable('workouts-v1', {}); // date -> categories
export const goal = writable('goal-v1', {start:175, target:150, current:175, startedAt: new Date().toISOString()});
export const pushover = writable('pushover-v1', {userKey:'', appToken:'', enabled:false});
