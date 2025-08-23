import { c as create_ssr_component, b as each, e as escape, d as add_attribute } from './ssr-D1ITVYiU.js';
import { b as punches, w as workouts, g as goal } from './stores-_jxIxHkE.js';

function genDates() {
  const s = /* @__PURE__ */ new Date();
  s.setDate(s.getDate() - 3);
  const out = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
const Tracker = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let dates = [];
  dates = genDates();
  let punchMap = {};
  punches.subscribe((v) => punchMap = v);
  let workoutMap = {};
  workouts.subscribe((v) => workoutMap = v);
  let g;
  goal.subscribe((v) => g = v);
  const cats = ["Strength", "Endurance", "Fast-twitch", "Core", "Flexibility"];
  return `<div class="space-y-4"><div class="card"><h3 class="font-semibold mb-2" data-svelte-h="svelte-19p4169">30-Day Success Punch Card</h3> <div class="grid grid-cols-10 gap-2">${each(dates, (d) => {
    return `<button${add_attribute("class", `p-3 rounded border ${punchMap[d] ? "bg-green-500 text-white" : "bg-white"}`, 0)}${add_attribute("title", d, 0)}>✔
        </button>`;
  })}</div></div> <div class="card"><h3 class="font-semibold mb-2" data-svelte-h="svelte-sq1kgy">Weekly Workout Categories</h3> <div class="text-sm text-gray-600 mb-2" data-svelte-h="svelte-10aoal5">Hit each category at least once per week. Flexible days.</div> <div class="space-y-2">${each(dates.slice(-7), (d) => {
    return `<div class="flex items-center gap-2"><div class="w-24 text-xs text-gray-500">${escape(d)}</div> ${each(cats, (c) => {
      return `<button${add_attribute(
        "class",
        `tag ${(workoutMap[d] || []).includes(c) ? "bg-black text-white" : ""}`,
        0
      )}>${escape(c)}</button>`;
    })} </div>`;
  })}</div></div> <div class="card"><h3 class="font-semibold mb-2" data-svelte-h="svelte-1ne6f99">Goal Tracker</h3> <div class="flex items-center gap-3"><div>Start: ${escape(g.start)} lbs</div> <div>Target: ${escape(g.target)} lbs</div> <div>Current: <input class="border p-1 w-20" type="number"${add_attribute("value", g.current, 0)}></div></div> <div class="mt-2 w-full bg-gray-200 h-3 rounded"><div class="bg-black h-3 rounded"${add_attribute("style", `width:${Math.min(100, (g.start - g.current) / (g.start - g.target) * 100)}%`, 0)}></div></div></div></div>`;
});

export { Tracker as T };
//# sourceMappingURL=Tracker-BfnDwbtS.js.map
