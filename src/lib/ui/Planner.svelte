<script lang="ts">
  import { meals, plan, seedMeals, needsSeeding } from "$lib/stores";
  import { get } from "svelte/store";
  import { onMount } from 'svelte';
  
  let allMeals = $state<any[]>([]);
  let isLoading = $state(false);
  let toastMessage = $state("");
  let toastType = $state<"success" | "error" | "info">("info");
  
  meals.subscribe((v) => (allMeals = v));
  
  // Load data only on client side using onMount
  onMount(async () => {
    if (needsSeeding()) {
      await loadSampleMeals();
    }
  });

  async function loadSampleMeals() {
    isLoading = true;
    try {
      const result = await seedMeals();
      showToast(result.message, result.success ? "success" : "error");
    } catch (error) {
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
    const currentPlan = get(plan);
    const p = structuredClone(currentPlan);
    p[date] = p[date] || [];
    p[date].push(mealId);
    plan.set(p);
  }
  
  function remove(date: string, idx: number) {
    const currentPlan = get(plan);
    const p = structuredClone(currentPlan);
    p[date].splice(idx, 1);
    plan.set(p);
  }

  // Convert reactive statements to Svelte 5 $derived
  const counts = $derived(() => {
    const currentPlan = get(plan);
    const c: Record<string, number> = {};
    Object.values(currentPlan).forEach((arr) =>
      arr.forEach((m) => {
        c[m] = (c[m] || 0) + 1;
      }),
    );
    return c;
  });

  const shopping = $derived(() => {
    const currentPlan = get(plan);
    const out: Record<string, number> = {};
    const mealsById = Object.fromEntries(allMeals.map((m) => [m.id, m]));
    for (const arr of Object.values(currentPlan)) {
      for (const id of arr) {
        const m = mealsById[id];
        if (!m) continue;
        for (const ing of m.ingredients) {
          out[ing.name] = (out[ing.name] || 0) + (ing.amount || 0);
        }
      }
    }
    return out;
  });

  function getMealsForDate(date: string): string[] {
    const currentPlan = get(plan);
    return currentPlan[date] || [];
  }

  function getMealName(id: string): string {
    const meal = allMeals.find((x) => x.id === id);
    return meal ? meal.name : id;
  }

  function exportShoppingList() {
    const data = Object.entries(shopping).map(([name, amt]) => `${name}: ${amt}`).join("\n");
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
  const days = $derived(() => Object.keys(get(plan)).length);
  
  function dates() {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
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
    <div class="flex gap-2 flex-wrap">
      {#each allMeals as m}
        <button class="btn-outline" onclick={() => add(dates()[0], m.id)}
          >{m.name}</button
        >
      {/each}
    </div>
  </div>

  <div class="grid md:grid-cols-2 gap-4">
    <div class="card">
      <h3 class="font-semibold mb-2">Plan ({days} days)</h3>
      {#each dates() as d}
        <div class="mb-3">
          <div class="text-sm text-gray-500">{d}</div>
          <div class="flex flex-wrap gap-2 mt-1">
            {#if getMealsForDate(d).length === 0}
              <span class="tag">No meals yet</span>
            {:else}
              {#each getMealsForDate(d) as id, i}
                <button class="tag" onclick={() => remove(d, i)}
                  >{getMealName(id)} ✕</button
                >
              {/each}
            {/if}
          </div>
          <div class="mt-2">
            <select
              class="border p-1"
              onchange={(e) => add(d, (e.target as HTMLSelectElement).value)}
            >
              <option value="">+ Add meal</option>
              {#each allMeals as m}
                <option value={m.id}>{m.name}</option>
              {/each}
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
          <span>{name}</span><span class="font-mono">{amt}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
