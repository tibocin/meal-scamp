import { c as create_ssr_component, d as add_attribute } from './ssr-D1ITVYiU.js';
import { a as pushover } from './stores-_jxIxHkE.js';
import './index-EszbxhfW.js';

const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let cfg;
  pushover.subscribe((v) => cfg = v);
  return `<div class="max-w-3xl mx-auto p-4 card space-y-2"><h1 class="text-xl font-semibold" data-svelte-h="svelte-kpd131">Settings</h1> <label class="block">User Key <input class="border p-1 w-full"${add_attribute("value", cfg.userKey, 0)}></label> <label class="block">App Token <input class="border p-1 w-full"${add_attribute("value", cfg.appToken, 0)}></label> <label class="block"><input type="checkbox"${add_attribute("checked", cfg.enabled, 1)}> Enable Pushover reminders</label> <div class="flex gap-2 mt-2"><button class="btn" data-svelte-h="svelte-1ux5npz">Save</button> <button class="btn-outline" data-svelte-h="svelte-1rn6ai2">Send Test</button></div></div>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-BDgeX5DE.js.map
