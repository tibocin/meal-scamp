import data from '$lib/data/seed-meals.json';
export const GET = async () => {
  return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } });
};
