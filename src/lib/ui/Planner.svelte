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
  let selectedStartDate = $state("");
  let selectedEndDate = $state("");

  dateRange.subscribe((range) => {
    if (range.start && range.end) {
      selectedStartDate = range.start;
      selectedEndDate = range.end;
      currentDateRange = getLocalDateRange(range.start, range.end);
    }
  });

  // Load data only on client side using onMount
  onMount(() => {
    // Load meals if not already loaded
    if (allMeals.length === 0) {
      loadMealsDirectly();
    }

    // Set default date range if none is selected
    if (currentDateRange.length === 0) {
      setDefaultWeekRange();
    }
  });

  function setDefaultWeekRange() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    const newRange = {
      start: startOfWeek.toISOString().slice(0, 10),
      end: endOfWeek.toISOString().slice(0, 10),
    };

    dateRange.set(newRange);
  }

  function navigateWeek(direction: number) {
    if (!selectedStartDate || !selectedEndDate) return;

    const startDate = new Date(selectedStartDate);
    const endDate = new Date(selectedEndDate);
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    startDate.setDate(startDate.getDate() + direction * daysDiff);
    endDate.setDate(endDate.getDate() + direction * daysDiff);

    const newRange = {
      start: startDate.toISOString().slice(0, 10),
      end: endDate.toISOString().slice(0, 10),
    };

    dateRange.set(newRange);
  }

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
  let batchPrepCounts = $state<
    Record<string, { count: number; mealId: string }>
  >({});

  // Collapsible section states
  let weeklyPlannerCollapsed = $state(false);
  let batchPrepCollapsed = $state(false);
  let shoppingCollapsed = $state(false);

  // Meal details modal state
  let showMealModal = $state(false);
  let selectedMealForModal = $state<any>(null);

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
    // Update batch prep counts with meal names and IDs for linking
    const newBatchCounts: Record<string, { count: number; mealId: string }> =
      {};
    Object.values(currentPlan).forEach((arr) => {
      arr.forEach((m) => {
        const mealName = getMealName(m);
        if (!newBatchCounts[mealName]) {
          newBatchCounts[mealName] = { count: 0, mealId: m };
        }
        newBatchCounts[mealName].count += 1;
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

  function showMealDetails(mealId: string) {
    const meal = allMeals.find((m) => m.id === mealId);
    if (meal) {
      selectedMealForModal = meal;
      showMealModal = true;
    }
  }

  function closeMealModal() {
    showMealModal = false;
    selectedMealForModal = null;
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
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-medium">Weekly Planner</h2>
          {#if selectedStartDate && selectedEndDate}
            <span class="text-sm text-gray-600 font-normal">
              {selectedStartDate} to {selectedEndDate}
            </span>
          {/if}
        </div>
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
            <!-- Week Navigation Controls -->
            <div
              class="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg"
            >
              <button
                class="btn-outline text-sm px-3 py-1"
                onclick={() => navigateWeek(-1)}
                disabled={!selectedStartDate || !selectedEndDate}
              >
                ← Previous Week
              </button>

              <div class="text-sm text-gray-600">
                {#if selectedStartDate && selectedEndDate}
                  Week of {new Date(selectedStartDate).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )} - {new Date(selectedEndDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                {/if}
              </div>

              <button
                class="btn-outline text-sm px-3 py-1"
                onclick={() => navigateWeek(1)}
                disabled={!selectedStartDate || !selectedEndDate}
              >
                Next Week →
              </button>
            </div>

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
                              <button
                                class="hover:text-blue-600 hover:underline cursor-pointer text-left"
                                onclick={() => showMealDetails(mealId)}
                                title="Click to view meal details and instructions"
                              >
                                {meal.name}
                              </button>
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
              {#each Object.entries(batchPrepCounts) as [mealName, mealData]}
                <div
                  class="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <button
                    class="font-medium hover:text-blue-600 hover:underline cursor-pointer text-left"
                    onclick={() => showMealDetails(mealData.mealId)}
                    title="Click to view meal details and instructions"
                  >
                    {mealName}
                  </button>
                  <div class="text-2xl text-blue-600 font-bold">
                    {mealData.count}
                  </div>
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

<!-- Meal Details Modal -->
{#if showMealModal && selectedMealForModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
    >
      <!-- Modal Header -->
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-xl font-semibold">{selectedMealForModal.name}</h2>
        <button
          class="text-gray-400 hover:text-gray-600 text-2xl"
          onclick={closeMealModal}
        >
          ×
        </button>
      </div>

      <!-- Modal Content -->
      <div class="p-6 space-y-6">
        <!-- Meal Type and Tags -->
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600 capitalize">
            {selectedMealForModal.mealType}
          </span>
          {#if selectedMealForModal.tags?.length}
            <div class="flex gap-2">
              {#each selectedMealForModal.tags as tag}
                <span
                  class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Portions -->
        <div>
          <h3 class="font-medium mb-3">Portion Sizes</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span>Protein:</span>
              <span class="font-medium"
                >{selectedMealForModal.portions?.protein_palms || 0} palms</span
              >
            </div>
            <div class="flex justify-between">
              <span>Veggies:</span>
              <span class="font-medium"
                >{selectedMealForModal.portions?.veg_fists || 0} fists</span
              >
            </div>
            <div class="flex justify-between">
              <span>Starch:</span>
              <span class="font-medium"
                >{selectedMealForModal.portions?.starch_fists || 0} fists</span
              >
            </div>
            <div class="flex justify-between">
              <span>Fat:</span>
              <span class="font-medium"
                >{selectedMealForModal.portions?.fat_thumbs || 0} thumbs</span
              >
            </div>
            <div class="flex justify-between">
              <span>Fruit:</span>
              <span class="font-medium"
                >{selectedMealForModal.portions?.fruit_fists || 0} fists</span
              >
            </div>
          </div>
        </div>

        <!-- Ingredients -->
        {#if selectedMealForModal.ingredients?.length}
          <div>
            <h3 class="font-medium mb-3">Ingredients</h3>
            <div class="space-y-2">
              {#each selectedMealForModal.ingredients as ingredient}
                <div
                  class="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span class="font-medium">{ingredient.name}</span>
                  <span class="text-sm text-gray-600">
                    {ingredient.amount}
                    {ingredient.unit}
                  </span>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Prep Steps -->
        {#if selectedMealForModal.steps?.length}
          <div>
            <div class="flex items-center gap-3 mb-3">
              <h3 class="font-medium">Prep Steps</h3>
              {#if selectedMealForModal.prep_time}
                <span
                  class="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded"
                >
                  ⏱️ {selectedMealForModal.prep_time} minutes
                </span>
              {/if}
            </div>
            <ol class="list-decimal list-inside space-y-2 text-sm">
              {#each selectedMealForModal.steps as step, index}
                <li class="p-2 bg-gray-50 rounded">{step}</li>
              {/each}
            </ol>
          </div>
        {/if}
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end gap-3 p-6 border-t">
        <button class="btn-outline" onclick={closeMealModal}> Close </button>
        <a href="/meals" class="btn"> View in Meals Library </a>
      </div>
    </div>
  </div>
{/if}
