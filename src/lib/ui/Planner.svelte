<script lang="ts">
  import {
    meals,
    plan,
    seedMeals,
    needsSeeding,
    getCurrentDateRange,
  } from "$lib/stores";
  import { get } from "svelte/store";
  import { onMount } from "svelte";

  // Use explicit subscription to meals store
  let allMeals = $state<any[]>([]);
  let isLoading = $state(false);
  let toastMessage = $state("");
  let toastType = $state<"success" | "error" | "info">("info");

  // Subscribe to meals store changes
  meals.subscribe((v) => {
    console.log("🍽️ Meals store subscription triggered:", v.length, "meals");
    allMeals = v;
    console.log("🍽️ allMeals updated to:", allMeals.length, "meals");
  });

  // Load data only on client side using onMount
  onMount(async () => {
    console.log("🔍 Planner component mounted");
    console.log("📊 Current meals count:", allMeals.length);
    console.log("🌱 Needs seeding?", needsSeeding());
    console.log("🍽️ Meals store value:", get(meals).length);

    // Always try to load meals to ensure they're available
    console.log("🌱 Loading sample meals...");
    await loadSampleMeals();
    
    // Force a refresh of the meals data
    const currentMeals = get(meals);
    console.log("📊 After loading - meals store:", currentMeals.length);
    allMeals = currentMeals;
    console.log("📊 After loading - allMeals count:", allMeals.length);
  });

  async function loadSampleMeals() {
    isLoading = true;
    try {
      console.log("🔄 Calling seedMeals()...");
      const result = await seedMeals();
      console.log("📊 Seed result:", result);
      showToast(result.message, result.success ? "success" : "error");
    } catch (error) {
      console.error("❌ Error in loadSampleMeals:", error);
      showToast("Failed to load sample meals", "error");
    } finally {
      isLoading = false;
    }
  }

  function showToast(message: string, type: "success" | "error" | "info") {
    toastMessage = message;
    toastType = type;
    setTimeout(() => {
      toastMessage = "";
    }, 5000);
  }

  function add(date: string, mealId: string) {
    const p = structuredClone(currentPlan);
    p[date] = p[date] || [];
    p[date].push(mealId);
    currentPlan = p; // Update local state immediately
    plan.set(p);
  }

  function remove(date: string, idx: number) {
    const p = structuredClone(currentPlan);
    p[date].splice(idx, 1);
    currentPlan = p; // Update local state immediately
    plan.set(p);
  }

  // Convert reactive statements to simpler reactive variables
  let counts = $state<Record<string, number>>({});
  let shopping = $state<Record<string, { amount: number; unit: string }>>({});
  let currentPlan = $state<Record<string, string[]>>({});

  // Subscribe to plan changes to update derived data and local state
  plan.subscribe((planData) => {
    currentPlan = planData;
    updateDerivedData();
  });

  // Subscribe to meals changes to update derived data
  meals.subscribe(() => {
    updateDerivedData();
  });

  // Update counts and shopping when plan or meals change
  function updateDerivedData() {
    console.log("🔄 updateDerivedData called, currentPlan:", currentPlan);

    // Update counts
    const newCounts: Record<string, number> = {};
    Object.values(currentPlan).forEach((arr) =>
      arr.forEach((m) => {
        newCounts[m] = (newCounts[m] || 0) + 1;
      }),
    );
    counts = newCounts;
    console.log("📊 Updated counts:", counts);

    // Update shopping with proper unit handling
    const newShopping: Record<string, { amount: number; unit: string }> = {};
    const mealsById = Object.fromEntries(allMeals.map((m) => [m.id, m]));
    for (const arr of Object.values(currentPlan)) {
      for (const id of arr) {
        const m = mealsById[id];
        if (!m) continue;
        for (const ing of m.ingredients) {
          const key = ing.name;
          if (!newShopping[key]) {
            newShopping[key] = { amount: 0, unit: ing.unit };
          }
          newShopping[key].amount += ing.amount || 0;
        }
      }
    }
    shopping = newShopping;
    console.log("🛒 Updated shopping:", shopping);
  }

  function getMealsForDate(date: string): string[] {
    return currentPlan[date] || [];
  }

  function getMealName(id: string): string {
    const meal = allMeals.find((x) => x.id === id);
    return meal ? meal.name : id;
  }

  function exportShoppingList() {
    const data = Object.entries(shopping)
      .map(([name, amt]) => `${name}: ${amt.amount} ${amt.unit}`)
      .join("\n");
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopping_list.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Shopping list exported successfully", "success");
  }

  // Get meal plan data
  let days = $state(0);

  // Update days when plan changes
  plan.subscribe((planData) => {
    days = Object.keys(planData).length;
  });

  function dates() {
    return getCurrentDateRange();
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

<div class="space-y-4">
  <!-- Load Sample Meals Button -->
  {#if needsSeeding()}
    <div class="card">
      <div class="text-center py-4">
        <p class="text-gray-600 mb-3">No meals available for planning</p>
        <button class="btn" onclick={loadSampleMeals} disabled={isLoading}>
          {isLoading ? "Loading..." : "📥 Load Sample Meals"}
        </button>
      </div>
    </div>
  {/if}

  <div class="card">
    <h3 class="font-semibold mb-2">Add Meals to Days</h3>

    <!-- Breakfast Meals -->
    {#if allMeals.filter((m) => m.mealType === "breakfast").length > 0}
      <div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-2">🍳 Breakfast</h4>
        <div class="flex gap-2 flex-wrap">
          {#each allMeals.filter((m) => m.mealType === "breakfast") as m}
            <button
              class="btn-outline text-sm"
              onclick={() => add(dates()[0], m.id)}>{m.name}</button
            >
          {/each}
        </div>
      </div>
    {/if}

    <!-- Lunch Meals -->
    {#if allMeals.filter((m) => m.mealType === "lunch").length > 0}
      <div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-2">🥪 Lunch</h4>
        <div class="flex gap-2 flex-wrap">
          {#each allMeals.filter((m) => m.mealType === "lunch") as m}
            <button
              class="btn-outline text-sm"
              onclick={() => add(dates()[0], m.id)}>{m.name}</button
            >
          {/each}
        </div>
      </div>
    {/if}

    <!-- Dinner Meals -->
    {#if allMeals.filter((m) => m.mealType === "dinner").length > 0}
      <div class="mb-3">
        <h4 class="text-sm font-medium text-gray-700 mb-2">🍽️ Dinner</h4>
        <div class="flex gap-2 flex-wrap">
          {#each allMeals.filter((m) => m.mealType === "dinner") as m}
            <button
              class="btn-outline text-sm"
              onclick={() => add(dates()[0], m.id)}>{m.name}</button
            >
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <div class="grid md:grid-cols-2 gap-4">
    <div class="card">
      <h3 class="font-semibold mb-2">Plan ({days} days)</h3>
      {#each dates() as d}
        <div class="mb-3">
          <div class="text-sm text-gray-500">{d}</div>
          <div class="flex flex-wrap gap-2 mt-1">
            {#if (currentPlan[d] || []).length === 0}
              <span class="tag">No meals yet</span>
            {:else}
              {#each currentPlan[d] || [] as id, i}
                <button class="tag" onclick={() => remove(d, i)}
                  >{getMealName(id)} ✕</button
                >
              {/each}
            {/if}
          </div>
          <div class="mt-2">
            <select
              class="border p-1"
              onchange={(e) => {
                const value = (e.target as HTMLSelectElement).value;
                if (value) {
                  console.log("🍽️ Adding meal:", value, "to date:", d);
                  add(d, value);
                  (e.target as HTMLSelectElement).value = "";
                }
              }}
            >
              <option value="">+ Add meal</option>
              <!-- Debug: allMeals count -->
              <option disabled>DEBUG: {allMeals.length} total meals</option>

              <!-- Breakfast Meals -->
              <optgroup label="🍳 Breakfast">
                {#each allMeals.filter((m) => m.mealType === "breakfast") as m}
                  <option value={m.id}>{m.name}</option>
                {/each}
                {#if allMeals.filter((m) => m.mealType === "breakfast").length === 0}
                  <option disabled>No breakfast meals available</option>
                {/if}
              </optgroup>

              <!-- Lunch Meals -->
              <optgroup label="🥪 Lunch">
                {#each allMeals.filter((m) => m.mealType === "lunch") as m}
                  <option value={m.id}>{m.name}</option>
                {/each}
                {#if allMeals.filter((m) => m.mealType === "lunch").length === 0}
                  <option disabled>No lunch meals available</option>
                {/if}
              </optgroup>

              <!-- Dinner Meals -->
              <optgroup label="🍽️ Dinner">
                {#each allMeals.filter((m) => m.mealType === "dinner") as m}
                  <option value={m.id}>{m.name}</option>
                {/each}
                {#if allMeals.filter((m) => m.mealType === "dinner").length === 0}
                  <option disabled>No dinner meals available</option>
                {/if}
              </optgroup>
            </select>
          </div>
        </div>
      {/each}
    </div>

    <div class="card">
      <h3 class="font-semibold mb-2">Batch Prep Counts</h3>
      {#each Object.entries(counts) as [id, n]}
        <div class="flex justify-between border-b py-1 text-sm">
          <span>{getMealName(id)}</span>
          <span class="font-mono">{n}×</span>
        </div>
      {/each}

      <h3 class="font-semibold mt-4 mb-2">Shopping List (aggregated)</h3>
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm text-gray-600"
          >Total items: {Object.keys(shopping).length}</span
        >
        <button
          class="btn-outline text-sm"
          onclick={() => exportShoppingList()}
        >
          📋 Export List
        </button>
      </div>
      {#each Object.entries(shopping) as [name, amt]}
        <div class="flex justify-between border-b py-1 text-sm">
          <span>{name}</span><span class="font-mono"
            >{amt.amount} {amt.unit}</span
          >
        </div>
      {/each}
    </div>
  </div>
</div>
