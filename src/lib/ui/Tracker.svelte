<script lang="ts">
  import {
    punches,
    workouts,
    goal,
    pushover,
    getCurrentDateRange,
  } from "$lib/stores";

  // Use $state for reactive variables in Svelte 5
  let dates = $state<string[]>([]);
  let today = $state(new Date());

  // Initialize dates using the date range from stores
  dates = getCurrentDateRange();

  let punchMap = $state<Record<string, boolean>>({});
  punches.subscribe((v) => (punchMap = v));

  let workoutMap = $state<Record<string, string[]>>({});
  workouts.subscribe((v) => (workoutMap = v));

  let g = $state<any>({});
  goal.subscribe((v) => (g = v));

  const cats = ["Strength", "Endurance", "Fast-twitch", "Core", "Flexibility"];

  function togglePunch(d: string) {
    const m = { ...punchMap, [d]: !punchMap[d] };
    punches.set(m);
  }
  function toggleCat(d: string, c: string) {
    const arr = new Set(workoutMap[d] || []);
    if (arr.has(c)) arr.delete(c);
    else arr.add(c);
    workouts.set({ ...workoutMap, [d]: Array.from(arr) });
  }
</script>

<div class="space-y-4">
  <div class="card">
    <h3 class="font-semibold mb-2">30-Day Success Punch Card</h3>
    <div class="grid grid-cols-10 gap-2">
      {#each dates as d}
        <button
          class={`p-3 rounded border ${punchMap[d] ? "bg-green-500 text-white" : "bg-white"}`}
          onclick={() => togglePunch(d)}
          title={d}
        >
          ✔
        </button>
      {/each}
    </div>
  </div>

  <div class="card">
    <h3 class="font-semibold mb-2">Weekly Workout Categories</h3>
    <div class="text-sm text-gray-600 mb-2">
      Hit each category at least once per week. Flexible days.
    </div>
    <div class="space-y-2">
      {#each dates.slice(-7) as d}
        <div class="flex flex-wrap items-start gap-2">
          <div class="w-24 text-xs text-gray-500 flex-shrink-0">{d}</div>
          <div class="flex flex-wrap gap-2 flex-1">
            {#each cats as c}
              <button
                class={`tag ${(workoutMap[d] || []).includes(c) ? "bg-black text-white" : ""}`}
                onclick={() => toggleCat(d, c)}>{c}</button
              >
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="card">
    <h3 class="font-semibold mb-2">Goal Tracker</h3>
    <div class="flex items-center gap-3">
      <div>Start: {g.start} lbs</div>
      <div>Target: {g.target} lbs</div>
      <div>
        Current: <input
          class="border p-1 w-20"
          type="number"
          bind:value={g.current}
          onchange={() => goal.set(g)}
        />
      </div>
    </div>
    <div class="mt-2 w-full bg-gray-200 h-3 rounded">
      <div
        class="bg-black h-3 rounded"
        style={`width:${Math.min(100, ((g.start - g.current) / (g.start - g.target)) * 100)}%`}
      ></div>
    </div>
  </div>
</div>
