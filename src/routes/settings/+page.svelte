<script lang="ts">
  import { pushover, meals, plan, workouts, punches, seedMeals, goal } from "$lib/stores";
  import { onMount } from "svelte";

  let cfg = $state<any>({});
  let isReseeding = $state(false);
  let toastMessage = $state("");
  let toastType = $state<"success" | "error" | "info">("info");
  
  // Goal weight settings
  let goalSettings = $state({
    start: $goal.start,
    target: $goal.target,
    current: $goal.current
  });
  
  pushover.subscribe((v) => (cfg = v));

  function save() {
    pushover.set(cfg);
    showToast("Settings saved successfully", "success");
  }

  function saveGoalSettings() {
    goal.set({
      ...$goal,
      start: goalSettings.start,
      target: goalSettings.target,
      current: goalSettings.current
    });
    showToast("Goal settings saved successfully", "success");
  }

  // Wrap fetch in onMount to prevent SSR issues
  async function test() {
    if (!cfg.enabled) {
      showToast("Please enable Pushover first", "error");
      return;
    }
    const r = await fetch("/api/pushover", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Meal Scamp",
        message: "Test from settings",
      }),
    });
    showToast(`Test notification sent. Status: ${r.status}`, r.ok ? "success" : "error");
  }

  async function reseedMeals() {
    if (!confirm("This will clear all your current meal plans, workouts, and tracking data. Are you sure?")) {
      return;
    }
    
    isReseeding = true;
    try {
      // Clear all data
      meals.set([]);
      plan.set({});
      workouts.set({});
      punches.set({});
      
      // Reload seed meals
      const result = await seedMeals();
      showToast(result.message, result.success ? "success" : "error");
    } catch (error) {
      console.error("Error reseeding meals:", error);
      showToast("Failed to reseed meals", "error");
    } finally {
      isReseeding = false;
    }
  }

  function showToast(message: string, type: "success" | "error" | "info") {
    toastMessage = message;
    toastType = type;
    setTimeout(() => {
      toastMessage = "";
    }, 5000);
  }
</script>

<!-- Toast Notification -->
{#if toastMessage}
  <div
    class={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      toastType === "success"
        ? "bg-green-500 text-white"
        : toastType === "error"
          ? "bg-red-500 text-white"
          : "bg-blue-500 text-white"
    }`}
  >
    {toastMessage}
  </div>
{/if}

<div class="max-w-3xl mx-auto p-4 space-y-6">
  <h1 class="text-xl font-semibold">Settings</h1>
  
  <!-- Weight Goal Settings -->
  <div class="card space-y-4">
    <h2 class="text-lg font-medium">Weight Goal Settings</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label class="block">
        <span class="text-sm font-medium text-gray-700">Starting Weight (lbs)</span>
        <input
          type="number"
          class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          bind:value={goalSettings.start}
          min="100"
          max="500"
          step="0.1"
        />
      </label>
      
      <label class="block">
        <span class="text-sm font-medium text-gray-700">Target Weight (lbs)</span>
        <input
          type="number"
          class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          bind:value={goalSettings.target}
          min="100"
          max="500"
          step="0.1"
        />
      </label>
      
      <label class="block">
        <span class="text-sm font-medium text-gray-700">Current Weight (lbs)</span>
        <input
          type="number"
          class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          bind:value={goalSettings.current}
          min="100"
          max="500"
          step="0.1"
        />
      </label>
    </div>
    
    <!-- Progress Preview -->
    <div class="mt-4 p-3 bg-gray-50 rounded-lg">
      <div class="text-sm text-gray-600 mb-2">🎯 Progress Preview:</div>
      <div class="w-full bg-gray-200 h-3 rounded">
        <div
          class="bg-blue-600 h-3 rounded transition-all duration-300"
          style="width:{Math.max(
            0,
            Math.min(
              100,
              Math.abs(goalSettings.current - goalSettings.start) /
                Math.abs(goalSettings.target - goalSettings.start) *
                100
            )
          )}%"
        ></div>
      </div>
      <div class="text-xs text-gray-500 mt-1">
        {#if goalSettings.target < goalSettings.start}
          {Math.max(0, goalSettings.start - goalSettings.current)} lbs lost of {goalSettings.start - goalSettings.target} lbs goal
        {:else}
          {Math.max(0, goalSettings.current - goalSettings.start)} lbs gained of {goalSettings.target - goalSettings.start} lbs goal
        {/if}
      </div>
    </div>
    
    <button class="btn bg-blue-600 hover:bg-blue-700 text-white" onclick={saveGoalSettings}>
      Save Goal Settings
    </button>
  </div>

  <!-- Pushover Settings -->
  <div class="card space-y-2">
    <h2 class="text-lg font-medium">Pushover Notifications</h2>
    <label class="block"
      >User Key <input
        class="border p-1 w-full"
        bind:value={cfg.userKey}
      /></label
    >
    <label class="block"
      >App Token <input
        class="border p-1 w-full"
        bind:value={cfg.appToken}
      /></label
    >
    <label class="block"
      ><input type="checkbox" bind:checked={cfg.enabled} /> Enable Pushover reminders</label
    >
    <div class="flex gap-2 mt-2">
      <button class="btn" onclick={save}>Save</button>
      <button class="btn-outline" onclick={test}>Send Test</button>
    </div>
  </div>

  <!-- Data Management -->
  <div class="card space-y-2">
    <h2 class="text-lg font-medium">Data Management</h2>
    <div class="text-sm text-gray-600 mb-3">
      Reset your meal plans and tracking data to start fresh with the default seed meals.
    </div>
    <button 
      class="btn-outline text-red-600 border-red-300 hover:bg-red-50" 
      onclick={reseedMeals}
      disabled={isReseeding}
    >
      {isReseeding ? "Reseeding..." : "🔄 Reseed Meals & Clear Data"}
    </button>
  </div>
</div>
