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

  // Daily practice modal state
  let showModal = $state(false);
  let selectedDate = $state("");
  let dailyPracticeCompleted = $state(false);

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

  function showDailyPracticeModal(date: string) {
    selectedDate = date;
    dailyPracticeCompleted = false;
    showModal = true;
  }

  function confirmDailyPractice() {
    dailyPracticeCompleted = true;
    togglePunch(selectedDate);
    showModal = false;
  }

  function cancelDailyPractice() {
    showModal = false;
    selectedDate = "";
    dailyPracticeCompleted = false;
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-center mb-8">Meal Scamp</h1>

  <!-- Daily Practice Modal -->
  {#if showModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Daily Spiritual Practice</h3>
        <p class="text-gray-600 mb-6">
          Before checking off <strong>{selectedDate}</strong>, please confirm that you have completed at least one of these daily practices:
        </p>
        
        <div class="space-y-3 mb-6">
          <label class="flex items-center">
            <input type="checkbox" bind:checked={dailyPracticeCompleted} class="mr-3">
            <span>Gratitude practice</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" bind:checked={dailyPracticeCompleted} class="mr-3">
            <span>Meditation</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" bind:checked={dailyPracticeCompleted} class="mr-3">
            <span>Prayer</span>
          </label>
        </div>

        <div class="flex gap-3">
          <button
            class="btn bg-gray-500 hover:bg-gray-600 text-white"
            onclick={cancelDailyPractice}
          >
            Cancel
          </button>
          <button
            class="btn bg-green-600 hover:bg-green-700 text-white"
            disabled={!dailyPracticeCompleted}
            onclick={confirmDailyPractice}
          >
            Confirm & Check Off
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Daily Practice & Goal Tracking (Top Priority) -->
  <div class="space-y-6 mb-8">
    <!-- 30-Day Success Punch Card -->
    <div class="card">
      <div class="flex items-center justify-between cursor-pointer" onclick={() => punchCardCollapsed = !punchCardCollapsed}>
        <h3 class="font-semibold text-lg">Daily Spiritual Practice Tracker</h3>
        <button class="text-gray-500 hover:text-gray-700 transition-transform duration-200" class:rotate-180={punchCardCollapsed}>
          ▼
        </button>
      </div>
      
      {#if !punchCardCollapsed}
        <div class="mt-4 transition-all duration-300 ease-in-out">
          <div class="text-sm text-gray-600 mb-4">
            Complete your daily gratitude, meditation, or prayer practice before checking off each day.
          </div>
          <div class="grid grid-cols-10 gap-2">
            {#each getCurrentDateRange() as date}
              <button
                class="p-3 rounded border-2 border-black bg-white hover:bg-gray-50 transition-all duration-200 {$punches[date] ? 'bg-green-100' : ''}"
                title={date}
                onclick={(e) => { e.stopPropagation(); showDailyPracticeModal(date); }}
              >
                {#if $punches[date]}
                  <span class="text-green-600 font-bold text-lg">✔</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Goal Tracker -->
    <div class="card">
      <div class="flex items-center justify-between cursor-pointer" onclick={() => goalCollapsed = !goalCollapsed}>
        <h3 class="font-semibold text-lg">Goal Tracker</h3>
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
  </div>

  <!-- Date Range Picker -->
  <DateRangePicker />

  <!-- Workout & Meal Planning -->
  <div class="space-y-6">
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

    <!-- Weekly Planner -->
    <Planner />
  </div>
</div>
