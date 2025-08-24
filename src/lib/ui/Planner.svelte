<script lang="ts">
  import {
    meals,
    plan,
    seedMeals,
    needsSeeding,
    getCurrentDateRange,
    dateRange,
  } from "$lib/stores";
  import { get } from "svelte/store";
  import { onMount } from "svelte";

  // Use explicit subscription to meals store
  let allMeals = $state<any[]>([]);
  let isLoading = $state(false);
  let toastMessage = $state("");
  let toastType = $state<"success" | "error" | "info">("info");

  // Subscribe to dateRange store for reactive date updates
  let currentDateRange = $state<string[]>([]);
  dateRange.subscribe((range) => {
    if (range.start && range.end) {
      currentDateRange = getLocalDateRange(range.start, range.end);
    }
  });

  // Load data only on client side using onMount
  onMount(() => {
    // Load meals if not already loaded
    if (allMeals.length === 0) {
      loadMealsDirectly();
    }
  });

  async function loadMealsDirectly() {
    try {
      const response = await fetch("/api/seed");
      if (response.ok) {
        const directMeals = await response.json();
        allMeals = directMeals;
      } else {
        console.error("API call failed:", response.status);
      }
    } catch (error) {
      console.error("Error in loadMealsDirectly:", error);
    }
  }

  // Helper function to get meals by type
  function getMealsByType(type: string) {
    return allMeals.filter((meal) => meal.mealType === type);
  }

  // Deep copy function to handle Proxy objects from Svelte $state
  function deepCopy<T>(obj: T): T {
    try {
      // Handle primitive types
      if (obj === null || typeof obj !== "object") {
        return obj;
      }

      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map((item) => deepCopy(item)) as T;
      }

      // Handle objects (including Proxy objects)
      if (typeof obj === "object") {
        const copy = {} as Record<string, any>;
        // Use Object.keys to safely iterate over own properties
        const keys = Object.keys(obj as Record<string, any>);
        for (const key of keys) {
          try {
            copy[key] = deepCopy((obj as Record<string, any>)[key]);
          } catch (propError) {
            console.warn(
              `⚠️ Warning: Could not copy property ${key}:`,
              propError,
            );
            // Skip problematic properties
            continue;
          }
        }
        return copy as T;
      }

      return obj;
    } catch (error) {
      console.error("❌ Error in deepCopy:", error, "Object:", obj);
      // Fallback: return a safe copy of the object
      if (typeof obj === "object" && obj !== null) {
        return { ...obj } as T;
      }
      return obj;
    }
  }

  // Local function to generate date range based on provided dates
  function getLocalDateRange(start: string, end: string): string[] {
    if (!start || !end) return [];

    const startDate = new Date(start);
    const endDate = new Date(end);
    const dates: string[] = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(d.toISOString().slice(0, 10));
    }

    return dates;
  }

  function showToast(message: string, type: "success" | "error" | "info") {
    toastMessage = message;
    toastType = type;
    setTimeout(() => {
      toastMessage = "";
    }, 5000);
  }

  function add(date: string, mealId: string) {
    const p = deepCopy(currentPlan);
    p[date] = p[date] || [];
    p[date].push(mealId);
    currentPlan = p; // Update local state immediately
    plan.set(p);
  }

  function remove(date: string, idx: number) {
    const p = deepCopy(currentPlan);
    p[date].splice(idx, 1);
    currentPlan = p; // Update local state immediately
    plan.set(p);
  }

  // Convert reactive statements to simpler reactive variables
  let shopping = $state<Record<string, { amount: number; unit: string }>>({});
  let currentPlan = $state<Record<string, string[]>>({});
  let batchPrepCounts = $state<Record<string, number>>({});

  // Collapsible section states
  let weeklyPlannerCollapsed = $state(false);
  let batchPrepCollapsed = $state(false);
  let shoppingCollapsed = $state(false);

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
    // Update batch prep counts with meal names
    const newBatchCounts: Record<string, number> = {};
    Object.values(currentPlan).forEach((arr) => {
      arr.forEach((m) => {
        const mealName = getMealName(m);
        newBatchCounts[mealName] = (newBatchCounts[mealName] || 0) + 1;
      });
    });
    batchPrepCounts = newBatchCounts;

    // Update shopping with proper unit handling
    const newShopping: Record<string, { amount: number; unit: string }> = {};
    const mealsById = Object.fromEntries(allMeals.map((m) => [m.id, m]));

    for (const arr of Object.values(currentPlan)) {
      for (const id of arr) {
        const m = mealsById[id];
        if (!m) {
          continue;
        }
        if (!m.ingredients) {
          continue;
        }
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

  // Note: All meal plan data is now handled through currentPlan and batchPrepCounts

  // New function to add meal to a specific day and type
  function addMeal(date: string, mealId: string, mealType: string) {
    const p = deepCopy(currentPlan);
    p[date] = p[date] || [];
    p[date].push(mealId);

    // Update local state immediately
    currentPlan = p;

    // Update the global plan store
    plan.set(p);

    // Force update of derived data
    updateDerivedData();
  }

  // New function to remove meal from a specific day
  function removeMeal(date: string, mealId: string) {
    const p = deepCopy(currentPlan);
    p[date] = p[date]?.filter((id) => id !== mealId) || [];

    // Update local state immediately
    currentPlan = p;

    // Update the global plan store
    plan.set(p);

    // Force update of derived data
    updateDerivedData();
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

<!-- Main Layout: Weekly Planner (2/3) + Batch Prep & Shopping (1/3) -->
<div class="grid lg:grid-cols-3 gap-6">
  <!-- Left Side: Weekly Planner (2/3 width on desktop) -->
  <div class="lg:col-span-2">
    <div class="card">
      <button
        type="button"
        class="w-full flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={() => (weeklyPlannerCollapsed = !weeklyPlannerCollapsed)}
        aria-expanded={!weeklyPlannerCollapsed}
        aria-controls="weekly-planner-content"
      >
        <h2 class="text-lg font-medium">Weekly Planner</h2>
        <svg
          class="w-5 h-5 transform transition-transform duration-200 {weeklyPlannerCollapsed
            ? 'rotate-180'
            : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {#if !weeklyPlannerCollapsed}
        <div class="mt-4 transition-all duration-300 ease-in-out">
          {#if allMeals.length === 0}
            <div class="text-center py-4">
              <p class="text-gray-600 mb-3">No meals available for planning</p>
              <button
                class="btn"
                onclick={loadMealsDirectly}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "📥 Load Sample Meals"}
              </button>
            </div>
          {:else}
            <!-- Meal Planning Grid with 4 organized rows -->
            <div class="space-y-4">
              {#each currentDateRange as date}
                <div class="border rounded-lg p-4">
                  <!-- Row 1: Header with Date + Meals Count -->
                  <div class="flex justify-between items-center mb-3">
                    <div class="text-sm font-medium text-gray-700">{date}</div>
                    <div class="text-xs text-gray-500">
                      {currentPlan[date] ? currentPlan[date].length : 0} meals planned
                    </div>
                  </div>

                  <!-- Row 2: Meal Type Labels (side by side) -->
                  <div class="grid grid-cols-3 gap-3 mb-3">
                    <div class="text-xs text-gray-500 text-center">
                      🍳 Breakfast
                    </div>
                    <div class="text-xs text-gray-500 text-center">
                      🥪 Lunch
                    </div>
                    <div class="text-xs text-gray-500 text-center">
                      🍽️ Dinner
                    </div>
                  </div>

                  <!-- Row 3: Dropdowns (side by side) -->
                  <div class="grid grid-cols-3 gap-3 mb-3">
                    <!-- Breakfast Dropdown -->
                    <select
                      class="border p-2 rounded text-sm"
                      onchange={(e) => {
                        const target = e.target as HTMLSelectElement;
                        if (target && target.value) {
                          addMeal(date, target.value, "breakfast");
                          target.value = ""; // Reset dropdown
                        }
                      }}
                      onclick={(e) => e.stopPropagation()}
                    >
                      <option value="">+ Add</option>
                      {#each getMealsByType("breakfast") as meal}
                        <option value={meal.id}>{meal.name}</option>
                      {/each}
                    </select>

                    <!-- Lunch Dropdown -->
                    <select
                      class="border p-2 rounded text-sm"
                      onchange={(e) => {
                        const target = e.target as HTMLSelectElement;
                        if (target && target.value) {
                          addMeal(date, target.value, "lunch");
                          target.value = ""; // Reset dropdown
                        }
                      }}
                      onclick={(e) => e.stopPropagation()}
                    >
                      <option value="">+ Add</option>
                      {#each getMealsByType("lunch") as meal}
                        <option value={meal.id}>{meal.name}</option>
                      {/each}
                    </select>

                    <!-- Dinner Dropdown -->
                    <select
                      class="border p-2 rounded text-sm"
                      onchange={(e) => {
                        const target = e.target as HTMLSelectElement;
                        if (target && target.value) {
                          addMeal(date, target.value, "dinner");
                          target.value = ""; // Reset dropdown
                        }
                      }}
                      onclick={(e) => e.stopPropagation()}
                    >
                      <option value="">+ Add</option>
                      {#each getMealsByType("dinner") as meal}
                        <option value={meal.id}>{meal.name}</option>
                      {/each}
                    </select>
                  </div>

                  <!-- Row 4: Planned Meals Display -->
                  {#if currentPlan[date] && currentPlan[date].length > 0}
                    <div class="pt-3 border-t">
                      <div class="text-xs text-gray-500 mb-2">
                        Planned Meals:
                      </div>
                      <div class="flex flex-wrap gap-2">
                        {#each currentPlan[date] as mealId}
                          {@const meal = allMeals.find((m) => m.id === mealId)}
                          {#if meal}
                            <span class="tag">
                              {meal.name}
                              <button
                                class="ml-1 text-red-500 hover:text-red-700"
                                onclick={() => removeMeal(date, mealId)}
                              >
                                ×
                              </button>
                            </span>
                          {/if}
                        {/each}
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Right Side: Batch Prep & Shopping List (1/3 width on desktop) -->
  <div class="space-y-6">
    <!-- Batch Prep Counts -->
    <div class="card">
      <button
        type="button"
        class="w-full flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={() => (batchPrepCollapsed = !batchPrepCollapsed)}
        aria-expanded={!batchPrepCollapsed}
        aria-controls="batch-prep-content"
      >
        <h2 class="text-lg font-medium">Batch Prep Counts</h2>
        <svg
          class="w-5 h-5 transform transition-transform duration-200 {batchPrepCollapsed
            ? 'rotate-180'
            : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {#if !batchPrepCollapsed}
        <div class="mt-4 transition-all duration-300 ease-in-out">
          {#if Object.keys(batchPrepCounts).length > 0}
            <div class="space-y-3">
              {#each Object.entries(batchPrepCounts) as [mealName, count]}
                <div
                  class="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div class="font-medium">{mealName}</div>
                  <div class="text-2xl text-blue-600 font-bold">{count}</div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-gray-500 text-center py-4">No meals planned yet</p>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Shopping List -->
    <div class="card">
      <button
        type="button"
        class="w-full flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={() => (shoppingCollapsed = !shoppingCollapsed)}
        aria-expanded={!shoppingCollapsed}
        aria-controls="shopping-list-content"
      >
        <h2 class="text-lg font-medium">Shopping List (aggregated)</h2>
        <svg
          class="w-5 h-5 transform transition-transform duration-200 {shoppingCollapsed
            ? 'rotate-180'
            : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {#if !shoppingCollapsed}
        <div class="mt-4 transition-all duration-300 ease-in-out">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm text-gray-600"
              >Total items: {Object.keys(shopping).length}</span
            >
            <button class="btn-outline text-sm" onclick={exportShoppingList}>
              📋 Export List
            </button>
          </div>
          {#if Object.keys(shopping).length > 0}
            <div class="space-y-2">
              {#each Object.entries(shopping) as [ingredient, details]}
                <div
                  class="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span class="font-medium">{ingredient}</span>
                  <span class="text-sm text-gray-600">
                    {details.amount}
                    {details.unit}
                  </span>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-gray-500 text-center py-4">No ingredients to buy</p>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
