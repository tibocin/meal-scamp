<script lang="ts">
  import Planner from "$lib/ui/Planner.svelte";
  import Tracker from "$lib/ui/Tracker.svelte";
  import LinkBar from "$lib/ui/LinkBar.svelte";
  import DateRangePicker from "$lib/ui/DateRangePicker.svelte";
  import { punches, goal, workouts, getCurrentDateRange } from "$lib/stores";

  // Service worker registration - only run in browser
  if (typeof window !== "undefined") {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }

  // Collapsible section states
  let punchCardCollapsed = $state(false);
  let goalCollapsed = $state(false);
  let workoutCollapsed = $state(false);

  // Toggle functions for punch card and workouts
  function togglePunch(date: string) {
    punches.update((p) => {
      p[date] = !p[date];
      return p;
    });
  }

  function toggleWorkout(date: string, category: string) {
    workouts.update((w) => {
      w[date] = w[date] || [];
      const index = w[date].indexOf(category);
      if (index > -1) {
        w[date].splice(index, 1);
      } else {
        w[date].push(category);
      }
      return w;
    });
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-center mb-8">Meal Scamp</h1>

  <!-- Date Range Picker -->
  <DateRangePicker />

  <!-- Single Column Layout -->
  <div class="space-y-6">
    <!-- Success & Workout Tracker -->
    <div class="card">
      <h2 class="text-xl font-semibold mb-4">Success & Workout Tracker</h2>

      <!-- 30-Day Success Punch Card -->
      <div class="card mb-6">
        <div class="flex items-center justify-between cursor-pointer" onclick={() => punchCardCollapsed = !punchCardCollapsed}>
          <h3 class="font-semibold">30-Day Success Punch Card</h3>
          <button class="text-gray-500 hover:text-gray-700 transition-transform duration-200" class:rotate-180={punchCardCollapsed}>
            ▼
          </button>
        </div>
        
        {#if !punchCardCollapsed}
          <div class="mt-4 transition-all duration-300 ease-in-out">
            <div class="grid grid-cols-10 gap-2">
              {#each getCurrentDateRange() as date}
                <button
                  class="p-3 rounded border bg-white hover:bg-gray-50"
                  title={date}
                  onclick={(e) => { e.stopPropagation(); togglePunch(date); }}
                >
                  {$punches[date] ? "✔" : ""}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Goal Tracker -->
      <div class="card mb-6">
        <div class="flex items-center justify-between cursor-pointer" onclick={() => goalCollapsed = !goalCollapsed}>
          <h3 class="font-semibold">Goal Tracker</h3>
          <button class="text-gray-500 hover:text-gray-700 transition-transform duration-200" class:rotate-180={goalCollapsed}>
            ▼
          </button>
        </div>
        
        {#if !goalCollapsed}
          <div class="mt-4 transition-all duration-300 ease-in-out">
            <div class="flex items-center gap-3 mb-3">
              <div>Start: {$goal.start} lbs</div>
              <div>Target: {$goal.target} lbs</div>
              <div>
                Current: <input
                  class="border p-1 w-20"
                  type="number"
                  bind:value={$goal.current}
                  onclick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div class="w-full bg-gray-200 h-3 rounded">
              <div
                class="bg-black h-3 rounded transition-all duration-300"
                style="width:{100 -
                  Math.max(
                    0,
                    Math.min(
                      100,
                      (($goal.start - $goal.current) /
                        ($goal.start - $goal.target)) *
                        100,
                    ),
                  )}%"
              ></div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Weekly Workout Categories -->
      <div class="card">
        <div class="flex items-center justify-between cursor-pointer" onclick={() => workoutCollapsed = !workoutCollapsed}>
          <h3 class="font-semibold">Weekly Workout Categories</h3>
          <button class="text-gray-500 hover:text-gray-700 transition-transform duration-200" class:rotate-180={workoutCollapsed}>
            ▼
          </button>
        </div>
        
        {#if !workoutCollapsed}
          <div class="mt-4 transition-all duration-300 ease-in-out">
            <div class="text-sm text-gray-600 mb-3">
              Hit each category at least once per week. Flexible days.
            </div>
            <div class="space-y-2">
              {#each getCurrentDateRange() as date}
                <div class="flex flex-wrap items-start gap-2">
                  <div class="w-24 text-xs text-gray-500 flex-shrink-0">{date}</div>
                  <div class="flex flex-wrap gap-2 flex-1">
                    {#each ["Strength", "Endurance", "Fast-twitch", "Core", "Flexibility"] as category}
                      <button
                        class="tag {$workouts[date]?.includes(category)
                          ? 'bg-blue-500 text-white'
                          : ''}"
                        onclick={(e) => { e.stopPropagation(); toggleWorkout(date, category); }}
                      >
                        {category}
                      </button>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Weekly Planner -->
    <Planner />
  </div>
</div>
