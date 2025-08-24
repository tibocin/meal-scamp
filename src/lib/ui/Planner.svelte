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
      console.log(
        "📅 Date range updated:",
        range.start,
        "to",
        range.end,
        "->",
        currentDateRange.length,
        "days",
      );
    }
  });

  // Load data only on client side using onMount
  onMount(async () => {
    console.log("🔍 Planner component mounted");
    console.log("📊 Current meals count:", allMeals.length);

    // Initialize date range from current store value
    const currentRange = get(dateRange);
    if (currentRange.start && currentRange.end) {
      currentDateRange = getLocalDateRange(
        currentRange.start,
        currentRange.end,
      );
      console.log(
        "📅 Initialized date range:",
        currentRange.start,
        "to",
        currentRange.end,
        "->",
        currentDateRange.length,
        "days",
      );
    }

    // Always load meals directly from API to bypass store issues
    console.log("🌱 Loading meals directly from API...");
    await loadMealsDirectly();

    console.log("📊 After loading - allMeals count:", allMeals.length);
  });

  async function loadMealsDirectly() {
    isLoading = true;
    try {
      console.log("🔄 Making direct API call to /api/seed...");
      const response = await fetch("/api/seed");
      if (response.ok) {
        const directMeals = await response.json();
        console.log(
          "🍽️ Direct API call successful:",
          directMeals.length,
          "meals",
        );
        console.log("🍽️ First meal sample:", directMeals[0]);
        console.log(
          "🍽️ Meal structure check - has ingredients?",
          directMeals[0]?.ingredients,
        );

        allMeals = directMeals;
        console.log("🍽️ allMeals after direct API:", allMeals.length);

        // Force a re-render by updating derived data
        updateDerivedData();
      } else {
        console.error("❌ API call failed:", response.status);
      }
    } catch (error) {
      console.error("❌ Error in loadMealsDirectly:", error);
    } finally {
      isLoading = false;
    }
  }

  // Helper function to get meals by type
  function getMealsByType(type: string) {
    return allMeals.filter((meal) => meal.mealType === type);
  }

  // Deep copy function to handle Proxy objects from Svelte $state
  function deepCopy<T>(obj: T): T {
    try {
      console.log(
        "🔍 deepCopy called with:",
        typeof obj,
        "constructor:",
        obj?.constructor?.name,
      );

      // Handle primitive types
      if (obj === null || typeof obj !== "object") {
        console.log("🔍 Returning primitive:", obj);
        return obj;
      }

      // Handle arrays
      if (Array.isArray(obj)) {
        console.log("🔍 Processing array with", obj.length, "items");
        return obj.map((item) => deepCopy(item)) as T;
      }

      // Handle objects (including Proxy objects)
      if (typeof obj === "object") {
        console.log(
          "🔍 Processing object with keys:",
          Object.keys(obj as Record<string, any>),
        );
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
        console.log("🔍 Object copy completed:", copy);
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
    console.log("🔄 allMeals available:", allMeals.length, "meals");

    // Update batch prep counts with meal names
    const newBatchCounts: Record<string, number> = {};
    Object.values(currentPlan).forEach((arr) => {
      console.log("🔄 Processing date array:", arr);
      arr.forEach((m) => {
        const mealName = getMealName(m);
        console.log("🔄 Processing meal ID:", m, "-> name:", mealName);
        newBatchCounts[mealName] = (newBatchCounts[mealName] || 0) + 1;
      });
    });
    batchPrepCounts = newBatchCounts;
    console.log("📊 Updated batch prep counts:", batchPrepCounts);

    // Update shopping with proper unit handling
    const newShopping: Record<string, { amount: number; unit: string }> = {};
    const mealsById = Object.fromEntries(allMeals.map((m) => [m.id, m]));
    console.log("🔄 Meals by ID mapping:", Object.keys(mealsById));

    for (const arr of Object.values(currentPlan)) {
      for (const id of arr) {
        const m = mealsById[id];
        console.log("🔄 Processing meal for shopping:", id, "-> meal:", m);
        if (!m) {
          console.log("⚠️ Meal not found for ID:", id);
          continue;
        }
        if (!m.ingredients) {
          console.log("⚠️ Meal has no ingredients:", m);
          continue;
        }
        for (const ing of m.ingredients) {
          const key = ing.name;
          if (!newShopping[key]) {
            newShopping[key] = { amount: 0, unit: ing.unit };
          }
          newShopping[key].amount += ing.amount || 0;
          console.log(
            "🔄 Added ingredient:",
            key,
            "amount:",
            ing.amount,
            "unit:",
            ing.unit,
          );
        }
      }
    }
    shopping = newShopping;
    console.log("🛒 Updated shopping:", shopping);
  }

  function getMealName(id: string): string {
    const meal = allMeals.find((x) => x.id === id);
    console.log("🔍 getMealName called with ID:", id, "-> found meal:", meal);
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
    console.log("🍽️ Adding meal:", mealId, "to date:", date, "type:", mealType);
    console.log("🍽️ Current allMeals:", allMeals);
    console.log("🍽️ Current currentPlan:", currentPlan);
    console.log(
      "🍽️ currentPlan type:",
      typeof currentPlan,
      "constructor:",
      currentPlan?.constructor?.name,
    );

    const p = deepCopy(currentPlan);
    console.log("🍽️ Deep copy result:", p);
    console.log(
      "🍽️ Deep copy type:",
      typeof p,
      "constructor:",
      p?.constructor?.name,
    );

    p[date] = p[date] || [];
    p[date].push(mealId);

    // Update local state immediately
    currentPlan = p;

    // Update the global plan store
    plan.set(p);

    console.log("🍽️ Updated currentPlan:", currentPlan);

    // Force update of derived data
    updateDerivedData();

    console.log("✅ Meal added successfully. Current plan:", currentPlan);
  }

  // New function to remove meal from a specific day
  function removeMeal(date: string, mealId: string) {
    console.log("🗑️ Removing meal:", mealId, "from date:", date);

    const p = deepCopy(currentPlan);
    p[date] = p[date]?.filter((id) => id !== mealId) || [];

    // Update local state immediately
    currentPlan = p;

    // Update the global plan store
    plan.set(p);

    // Force update of derived data
    updateDerivedData();

    console.log("✅ Meal removed successfully. Current plan:", currentPlan);
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

<div class="space-y-6">
  <!-- Weekly Planner -->
  <div class="card">
    <h2 class="text-xl font-semibold mb-4">Weekly Planner</h2>

    {#if allMeals.length === 0}
      <div class="text-center py-4">
        <p class="text-gray-600 mb-3">No meals available for planning</p>
        <button class="btn" onclick={loadMealsDirectly} disabled={isLoading}>
          {isLoading ? "Loading..." : "📥 Load Sample Meals"}
        </button>
      </div>
    {:else}
      <!-- Meal Planning Grid -->
      <div class="space-y-4">
        {#each currentDateRange as date}
          <div class="border rounded-lg p-4">
            <div class="text-sm font-medium text-gray-700 mb-3">{date}</div>

            <!-- Breakfast -->
            <div class="mb-3">
              <label class="block text-xs text-gray-500 mb-1"
                >🍳 Breakfast</label
              >
              <select
                class="border p-2 w-full rounded text-sm"
                onchange={(e) => {
                  const target = e.target as HTMLSelectElement;
                  if (target && target.value) {
                    addMeal(date, target.value, "breakfast");
                    target.value = ""; // Reset dropdown
                  }
                }}
              >
                <option value="">+ Add breakfast</option>
                {#each getMealsByType("breakfast") as meal}
                  <option value={meal.id}>{meal.name}</option>
                {/each}
              </select>
            </div>

            <!-- Lunch -->
            <div class="mb-3">
              <label class="block text-xs text-gray-500 mb-1">🥪 Lunch</label>
              <select
                class="border p-2 w-full rounded text-sm"
                onchange={(e) => {
                  const target = e.target as HTMLSelectElement;
                  if (target && target.value) {
                    addMeal(date, target.value, "lunch");
                    target.value = ""; // Reset dropdown
                  }
                }}
              >
                <option value="">+ Add lunch</option>
                {#each getMealsByType("lunch") as meal}
                  <option value={meal.id}>{meal.name}</option>
                {/each}
              </select>
            </div>

            <!-- Dinner -->
            <div class="mb-3">
              <label class="block text-xs text-gray-500 mb-1">🍽️ Dinner</label>
              <select
                class="border p-2 w-full rounded text-sm"
                onchange={(e) => {
                  const target = e.target as HTMLSelectElement;
                  if (target && target.value) {
                    addMeal(date, target.value, "dinner");
                    target.value = ""; // Reset dropdown
                  }
                }}
              >
                <option value="">+ Add dinner</option>
                {#each getMealsByType("dinner") as meal}
                  <option value={meal.id}>{meal.name}</option>
                {/each}
              </select>
            </div>

            <!-- Current Meals for this day -->
            {#if currentPlan[date] && currentPlan[date].length > 0}
              <div class="mt-3 pt-3 border-t">
                <div class="text-xs text-gray-500 mb-2">Planned Meals:</div>
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

  <!-- Side-by-side layout for batch prep and shopping -->
  <div class="grid md:grid-cols-2 gap-6">
    <!-- Batch Prep Counts -->
    <div class="card">
      <h3 class="font-semibold mb-3">Batch Prep Counts</h3>
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

    <!-- Shopping List -->
    <div class="card">
      <h3 class="font-semibold mb-3">Shopping List (aggregated)</h3>
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
  </div>
</div>
