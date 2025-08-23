import { c as create_ssr_component, v as validate_component } from './ssr-D1ITVYiU.js';
import { P as Planner } from './Planner-CBU7E3Cq.js';
import { T as Tracker } from './Tracker-BfnDwbtS.js';
import './stores-_jxIxHkE.js';
import './index-EszbxhfW.js';

const LinkBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<nav class="flex items-center justify-between card" data-svelte-h="svelte-nh7ywg"><div class="font-semibold">🥗 Meal Scamp</div> <div class="flex gap-2"><a class="btn-outline" href="/meals">Meals</a> <a class="btn-outline" href="/planner">Planner</a> <a class="btn-outline" href="/tracker">Tracker</a> <a class="btn-outline" href="/settings">Settings</a></div></nav>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {
    });
  }
  return `<div class="max-w-5xl mx-auto p-4 space-y-4">${validate_component(LinkBar, "LinkBar").$$render($$result, {}, {}, {})} <div class="grid md:grid-cols-2 gap-4"><div class="card"><h2 class="text-xl font-semibold mb-2" data-svelte-h="svelte-1llxldn">Weekly Planner</h2> ${validate_component(Planner, "Planner").$$render($$result, {}, {}, {})}</div> <div class="card"><h2 class="text-xl font-semibold mb-2" data-svelte-h="svelte-1dqybu8">Success &amp; Workout Tracker</h2> ${validate_component(Tracker, "Tracker").$$render($$result, {}, {}, {})}</div></div></div>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-COOcF8y1.js.map
