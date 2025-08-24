<script lang="ts">
  import { pushover, meals, plan, workouts, punches, seedMeals } from "$lib/stores";
  import { onMount } from "svelte";

  let cfg = $state<any>({});
  let isReseeding = $state(false);
  let toastMessage = $state("");
  let toastType = $state<"success" | "error" | "info">("info");
  
  pushover.subscribe((v) => (cfg = v));

  function save() {
    pushover.set(cfg);
    showToast("Settings saved successfully", "success");
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
