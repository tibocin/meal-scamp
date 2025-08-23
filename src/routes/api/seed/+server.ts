import type { RequestHandler } from '@sveltejs/kit';
import data from '$lib/data/seed-meals.json';
export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } });
};
