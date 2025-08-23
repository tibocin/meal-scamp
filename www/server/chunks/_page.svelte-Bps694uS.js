import { c as create_ssr_component, b as each, e as escape } from './ssr-D1ITVYiU.js';
import { m as meals } from './stores-_jxIxHkE.js';
import './index-EszbxhfW.js';

const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let all = [];
  meals.subscribe((v) => all = v);
  if (all.length === 0) {
    fetch("/api/seed").then((r) => r.json()).then((data) => meals.set(data));
  }
  return `<div class="max-w-5xl mx-auto p-4 space-y-4"><h1 class="text-2xl font-semibold" data-svelte-h="svelte-oxbe84">Meals</h1> <div class="grid md:grid-cols-2 gap-4">${each(all, (m) => {
    return `<div class="card"><div class="font-semibold">${escape(m.name)}</div> <div class="text-sm text-gray-500">${escape(m.mealType)}</div> <div class="mt-2 text-sm">Portions: 🍗 ${escape(m.portions.protein_palms)} palms, 🥦 ${escape(m.portions.veg_fists)} fists, 🍚 ${escape(m.portions.starch_fists)} fists, 🥑 ${escape(m.portions.fat_thumbs)} thumbs</div> <div class="mt-2 text-sm"><div class="font-semibold" data-svelte-h="svelte-1opr384">Ingredients</div> <ul class="list-disc ml-5">${each(m.ingredients, (ing) => {
      return `<li>${escape(ing.name)} — ${escape(ing.amount)} ${escape(ing.unit)}</li>`;
    })} </ul></div> <div class="mt-2 text-sm"><div class="font-semibold" data-svelte-h="svelte-1ku207b">Steps</div> <ol class="list-decimal ml-5">${each(m.steps, (s) => {
      return `<li>${escape(s)}</li>`;
    })} </ol></div> <div class="mt-2 flex gap-2">${each(m.tags, (t) => {
      return `<span class="tag">${escape(t)}</span>`;
    })}</div> </div>`;
  })}</div></div>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-Bps694uS.js.map
