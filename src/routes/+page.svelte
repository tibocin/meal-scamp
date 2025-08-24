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
  let gratitudeCompleted = $state(false);
  let meditationCompleted = $state(false);
  let prayerCompleted = $state(false);

  // Punch card navigation state
  let currentPunchCardPeriod = $state(0); // 0 = current, -1 = previous, 1 = next
  let punchCardStartDate = $state<Date | null>(null);

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
    // Default to current day's practices if they exist
    const today = new Date().toISOString().slice(0, 10);
    if (date === today && $punches[date]) {
      // If checking in for today and already completed, pre-fill the practices
      gratitudeCompleted = true;
      meditationCompleted = true;
      prayerCompleted = true;
    } else {
      // Reset for new check-in
      gratitudeCompleted = false;
      meditationCompleted = false;
      prayerCompleted = false;
    }
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

  // Punch card navigation functions
  function getPunchCardDates() {
    const today = new Date();
    const startDate = new Date(today);
    // Position current day 5th from the end for better streak visibility
    startDate.setDate(today.getDate() - 25 + currentPunchCardPeriod * 30);

    const dates: string[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().slice(0, 10));
    }
    return dates;
  }

  function getPunchCardDateRange() {
    const dates = getPunchCardDates();
    if (dates.length === 0) return { start: "", end: "" };

    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);

    return {
      start: startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      end: endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  }

  function navigatePunchCard(direction: number) {
    currentPunchCardPeriod += direction;
    // Ensure we don't go too far into the future (max 1 period ahead)
    if (currentPunchCardPeriod > 1) currentPunchCardPeriod = 1;
  }

  function getCurrentStreak() {
    const today = new Date().toISOString().slice(0, 10);
    let streak = 0;

    // Count backwards from today to find current streak
    // Start from today and go backwards until we find a gap
    let currentDate = new Date(today);

    while (true) {
      const dateString = currentDate.toISOString().slice(0, 10);
      if ($punches[dateString]) {
        streak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break; // Found a gap, stop counting
      }
    }

    return streak;
  }
</script>

<div class="container mx-auto px-4 py-8">
  <!-- Daily Practice Modal -->
  {#if showModal}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">
          {#if selectedDate === new Date().toISOString().slice(0, 10)}
            Today's Practice Check-in
          {:else}
            Daily Practice Check-in for {selectedDate}
          {/if}
        </h3>
        <p class="text-gray-600 mb-6">
          Select which daily practices you completed:
        </p>

        <div class="space-y-3 mb-6">
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={gratitudeCompleted}
              class="mr-3"
            />
            <span>Gratitude practice</span>
          </label>
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={meditationCompleted}
              class="mr-3"
            />
            <span>Meditation</span>
          </label>
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={prayerCompleted}
              class="mr-3"
            />
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
            disabled={!(
              gratitudeCompleted ||
              meditationCompleted ||
              prayerCompleted
            )}
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
      <button
        type="button"
        class="w-full flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={() => (punchCardCollapsed = !punchCardCollapsed)}
        aria-expanded={!punchCardCollapsed}
        aria-controls="punch-card-content"
      >
        <h2 class="text-lg font-medium">30-Day Success Punch Card</h2>
        <svg
          class="w-5 h-5 transform transition-transform duration-200 {punchCardCollapsed ? 'rotate-180' : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {#if !punchCardCollapsed}
        <div class="mt-4 transition-all duration-300 ease-in-out">
          <div class="text-sm text-gray-600 mb-4">
            Complete your daily gratitude, meditation, or prayer practice before
            checking off each day.
          </div>

          <!-- Current Streak Display -->
          <div
            class="text-center mb-4 p-3 bg-green-50 rounded-lg border border-green-200"
          >
            <div class="text-2xl font-bold text-green-600">
              {getCurrentStreak()}
            </div>
            <div class="text-sm text-green-700">Day Streak</div>
          </div>

          <!-- Punch Card Navigation -->
          <div class="flex items-center justify-between mb-4">
            <button
              class="btn-outline text-sm px-3 py-1"
              onclick={(e) => {
                e.stopPropagation();
                navigatePunchCard(-1);
              }}
              disabled={currentPunchCardPeriod <= -2}
            >
              ← Previous 30 Days
            </button>

            <button
              class="btn-outline text-sm px-3 py-1"
              onclick={(e) => {
                e.stopPropagation();
                navigatePunchCard(1);
              }}
              disabled={currentPunchCardPeriod >= 1}
            >
              Next 30 Days →
            </button>
          </div>

          <!-- 30-Day Punch Card Grid -->
          <div class="grid grid-cols-10 gap-2 lg:gap-0.5">
            {#each getPunchCardDates() as date}
              <button
                class="aspect-square rounded border-2 lg:border-2 border-black {$punches[
                  date
                ]
                  ? 'bg-green-100 border-green-600'
                  : 'bg-white hover:bg-gray-50'} transition-all duration-200 flex items-center justify-center relative"
                title="Check in for {date}"
                onclick={(e) => {
                  e.stopPropagation();
                  showDailyPracticeModal(date);
                }}
              >
                <!-- Current day indicator -->
                {#if date === new Date().toISOString().slice(0, 10)}
                  <div
                    class="absolute -top-1 -right-1 w-3 h-3 lg:w-1.5 lg:h-1.5 bg-blue-500 rounded-full border-2 border-white"
                  ></div>
                {/if}

                <!-- Checkmark overlay (doesn't affect box size) -->
                {#if $punches[date]}
                  <div
                    class="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <span class="text-lg lg:text-sm">✅</span>
                  </div>
                {/if}
              </button>
            {/each}
          </div>

          <!-- Date Range and Period Indicator -->
          <div
            class="flex items-center justify-between mt-3 text-xs text-gray-500"
          >
            <span>{getPunchCardDateRange().start}</span>
            <span class="font-medium">30 Day View</span>
            <span>{getPunchCardDateRange().end}</span>
          </div>
        </div>
      {/if}
    </div>

    <!-- Goal Tracker -->
    <div class="card">
      <button
        type="button"
        class="w-full flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={() => (goalCollapsed = !goalCollapsed)}
        aria-expanded={!goalCollapsed}
        aria-controls="goal-content"
      >
        <h2 class="text-lg font-medium">Goal Tracker</h2>
        <svg
          class="w-5 h-5 transform transition-transform duration-200 {goalCollapsed ? 'rotate-180' : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {#if !goalCollapsed}
        <div class="mt-4 transition-all duration-300 ease-in-out">
          <div class="flex items-center gap-3 mb-3">
            <div>Start: {$goal.start} lbs</div>
            <div>Target: {$goal.target} lbs</div>
            <div>
              Current: <input
                class="border p-1 w-20 text-center"
                type="number"
                bind:value={$goal.current}
                onclick={(e) => e.stopPropagation()}
                min="100"
                max="500"
                step="0.1"
              /> lbs
            </div>
          </div>
          <div class="text-xs text-gray-500 mb-3">
            💡 Update your weight goals in <a
              href="/settings"
              class="text-blue-600 hover:underline">Settings</a
            >
          </div>

          <!-- Progress Bar with Label -->
          <div class="mb-3">
            <div class="text-sm text-gray-600 mb-2">🎯 Progress:</div>
            <div class="w-full bg-gray-200 h-3 rounded">
              <div
                class="bg-black h-3 rounded transition-all duration-300"
                style="width:{Math.max(
                  0,
                  Math.min(
                    100,
                    (Math.abs($goal.current - $goal.start) /
                      Math.abs($goal.target - $goal.start)) *
                      100,
                  ),
                )}%"
              ></div>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {#if $goal.target < $goal.start}
                {Math.max(0, $goal.start - $goal.current).toFixed(2)} lbs lost of
                {($goal.start - $goal.target).toFixed(2)} lbs goal
              {:else}
                {Math.max(0, $goal.current - $goal.start).toFixed(2)} lbs gained
                of {($goal.target - $goal.start).toFixed(2)} lbs goal
              {/if}
            </div>
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
      <button
        type="button"
        class="w-full flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={() => (workoutCollapsed = !workoutCollapsed)}
        aria-expanded={!workoutCollapsed}
        aria-controls="workout-content"
      >
        <h2 class="text-lg font-medium">Weekly Workout Categories</h2>
        <svg
          class="w-5 h-5 transform transition-transform duration-200 {workoutCollapsed ? 'rotate-180' : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {#if !workoutCollapsed}
        <div class="mt-4 transition-all duration-300 ease-in-out">
          <div class="text-sm text-gray-600 mb-3">
            Hit each category at least once per week. Flexible days.
          </div>
          <div class="space-y-2">
            {#each getCurrentDateRange() as date}
              <div class="flex flex-wrap items-start gap-2">
                <div class="w-24 text-xs text-gray-500 flex-shrink-0">
                  {date}
                </div>
                <div class="flex flex-wrap gap-2 flex-1">
                  {#each ["Strength", "Endurance", "Fast-twitch", "Core", "Flexibility"] as category}
                    <button
                      class="tag {$workouts[date]?.includes(category)
                        ? 'bg-blue-500 text-white'
                        : ''}"
                      onclick={(e) => {
                        e.stopPropagation();
                        toggleWorkout(date, category);
                      }}
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
