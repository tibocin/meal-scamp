import { c as create_ssr_component, b as each, e as escape, d as add_attribute } from './ssr-D1ITVYiU.js';
import { p as plan, m as meals } from './stores-_jxIxHkE.js';

const days = 7;
const Planner = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let counts;
  let shopping;
  let start = /* @__PURE__ */ new Date();
  let mealMap = {};
  plan.subscribe((v) => mealMap = v);
  function dates() {
    const out = [];
    const s = new Date(start);
    for (let i = 0; i < days; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }
  let allMeals = [];
  meals.subscribe((v) => allMeals = v);
  if (allMeals.length === 0) {
    fetch("/api/seed").then((r) => r.json()).then((data) => meals.set(data));
  }
  function getMealsForDate(date) {
    return mealMap[date] || [];
  }
  function getMealName(id) {
    const meal = allMeals.find((x) => x.id === id);
    return meal ? meal.name : id;
  }
  counts = (() => {
    const c = {};
    Object.values(mealMap).forEach((arr) => arr.forEach((m) => {
      c[m] = (c[m] || 0) + 1;
    }));
    return c;
  })();
  shopping = (() => {
    const out = {};
    const mealsById = Object.fromEntries(allMeals.map((m) => [m.id, m]));
    for (const arr of Object.values(mealMap)) {
      for (const id of arr) {
        const m = mealsById[id];
        if (!m) continue;
        for (const ing of m.ingredients) {
          out[ing.name] = (out[ing.name] || 0) + (ing.amount || 0);
        }
      }
    }
    return out;
  })();
  return `<div class="space-y-4"><div class="card"><h3 class="font-semibold mb-2" data-svelte-h="svelte-shm20h">Add Meals to Days</h3> <div class="flex gap-2 flex-wrap">${each(allMeals, (m) => {
    return `<button class="btn-outline">${escape(m.name)}</button>`;
  })}</div></div> <div class="grid md:grid-cols-2 gap-4"><div class="card"><h3 class="font-semibold mb-2">Plan (${escape(days)} days)</h3> ${each(dates(), (d) => {
    return `<div class="mb-3"><div class="text-sm text-gray-500">${escape(d)}</div> <div class="flex flex-wrap gap-2 mt-1">${getMealsForDate(d).length === 0 ? `<span class="tag" data-svelte-h="svelte-e35gwc">No meals yet</span>` : `${each(getMealsForDate(d), (id, i) => {
      return `<button class="tag">${escape(getMealName(id))} ✕</button>`;
    })}`}</div> <div class="mt-2"><select class="border p-1"><option value="" data-svelte-h="svelte-1uktmxh">+ Add meal</option>${each(allMeals, (m) => {
      return `<option${add_attribute("value", m.id, 0)}>${escape(m.name)}</option>`;
    })}</select></div> </div>`;
  })}</div> <div class="card"><h3 class="font-semibold mb-2" data-svelte-h="svelte-1hur4qz">Batch Prep Counts</h3> ${each(Object.entries(counts), ([id, n]) => {
    return `<div class="flex justify-between border-b py-1 text-sm"><span>${escape(getMealName(id))}</span> <span class="font-mono">${escape(n)}×</span> </div>`;
  })} <h3 class="font-semibold mt-4 mb-2" data-svelte-h="svelte-1s63wpa">Shopping List (aggregated)</h3> ${each(Object.entries(shopping), ([name, amt]) => {
    return `<div class="flex justify-between border-b py-1 text-sm"><span>${escape(name)}</span><span class="font-mono">${escape(amt)}</span> </div>`;
  })}</div></div></div>`;
});

export { Planner as P };
//# sourceMappingURL=Planner-CBU7E3Cq.js.map
