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

  // Collapsible section states
  let punchCardCollapsed = $state(false);
  let workoutCollapsed = $state(false);
  let goalCollapsed = $state(false);

  // Daily practice modal state
  let showModal = $state(false);
  let selectedDate = $state("");
  let gratitudeCompleted = $state(false);
  let meditationCompleted = $state(false);
  let prayerCompleted = $state(false);

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

  function showDailyPracticeModal(d: string) {
    selectedDate = d;
    gratitudeCompleted = false;
    meditationCompleted = false;
    prayerCompleted = false;
    showModal = true;
  }

  function confirmDailyPractice() {
    togglePunch(selectedDate);
    showModal = false;
    // Reset states
    selectedDate = "";
    gratitudeCompleted = false;
    meditationCompleted = false;
    prayerCompleted = false;
  }

  function cancelDailyPractice() {
    showModal = false;
    selectedDate = "";
    gratitudeCompleted = false;
    meditationCompleted = false;
    prayerCompleted = false;
  }
</script>

<div class="space-y-4">
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
            <input type="checkbox" bind:checked={gratitudeCompleted} class="mr-3">
            <span>Gratitude practice</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" bind:checked={meditationCompleted} class="mr-3">
            <span>Meditation</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" bind:checked={prayerCompleted} class="mr-3">
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
            disabled={!(gratitudeCompleted || meditationCompleted || prayerCompleted)}
            onclick={confirmDailyPractice}
          >
            Confirm & Check Off
          </button>
        </div>
      </div>
    </div>
  {/if}

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
          {#each dates as d}
            <button
              class="p-3 rounded border-2 border-black bg-white hover:bg-gray-50 transition-all duration-200 {punchMap[d] ? 'bg-green-100' : ''}"
              onclick={(e) => { e.stopPropagation(); showDailyPracticeModal(d); }}
              title={d}
            >
              {#if punchMap[d]}
                <span class="text-green-600 font-bold text-lg">✔</span>
              {/if}
            </button>
          {/each}
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
                    onclick={(e) => { e.stopPropagation(); toggleCat(d, c); }}>{c}</button
                  >
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Goal Tracker -->
  <div class="card">
    <div class="flex items-center justify-between cursor-pointer" onclick={() => goalCollapsed = !goalCollapsed}>
      <h3 class="font-semibold">Goal Tracker</h3>
      <button class="text-gray-500 hover:text-gray-700 transition-transform duration-200" class:rotate-180={goalCollapsed}>
        ▼
      </button>
    </div>
    
    {#if !goalCollapsed}
      <div class="mt-4 transition-all duration-300 ease-in-out">
        <div class="flex items-center gap-3">
          <div>Start: {g.start} lbs</div>
          <div>Target: {g.target} lbs</div>
          <div>
            Current: <input
              class="border p-1 w-20"
              type="number"
              bind:value={g.current}
              onchange={() => goal.set(g)}
              onclick={(e) => e.stopPropagation()}
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
    {/if}
  </div>
</div>
