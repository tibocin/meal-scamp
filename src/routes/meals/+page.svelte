<script lang="ts">
  import {
    meals,
    seedMeals,
    needsSeeding,
    importMealsFromJSON,
  } from "$lib/stores";
  import { onMount } from "svelte";

  let all = $state<any[]>([]);
  let showAddForm = $state(false);
  let editingMeal = $state<any>(null);
  let showImportForm = $state(false);
  let importData = $state("");
  let toastMessage = $state("");
  let toastType = $state<"success" | "error" | "info">("info");
  let isLoading = $state(false);

  let breakfastCollapsed = $state(true);
  let lunchCollapsed = $state(true);
  let dinnerCollapsed = $state(true);
  let snackCollapsed = $state(true);

  meals.subscribe((v) => (all = v));

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

  function handleImport() {
    if (!importData.trim()) {
      showToast("Please enter JSON data", "error");
      return;
    }

    const result = importMealsFromJSON(importData);
    showToast(result.message, result.success ? "success" : "error");

    if (result.success) {
      showImportForm = false;
      importData = "";
    }
  }

  function addMeal() {
    showAddForm = true;
    editingMeal = null;
  }

  function editMeal(meal: any) {
    editingMeal = { ...meal };
    showAddForm = true;
  }

  function saveMeal(formData: FormData) {
    const mealData = {
      id: editingMeal?.id || `m${Date.now()}`,
      name: formData.get("name") as string,
      mealType: formData.get("mealType") as string,
      portions: {
        protein_palms: Number(formData.get("protein_palms")),
        veg_fists: Number(formData.get("veg_fists")),
        starch_fists: Number(formData.get("starch_fists")),
        fat_thumbs: Number(formData.get("fat_thumbs")),
        fruit_fists: Number(formData.get("fruit_fists")),
      },
      ingredients: [
        {
          name: formData.get("ingredient1") as string,
          amount: Number(formData.get("amount1")),
          unit: formData.get("unit1") as string,
        },
      ].filter((i) => i.name && i.amount),
      prep_time: Number(formData.get("prep_time")) || null,
      steps: (formData.get("steps") as string)
        .split("\n")
        .filter((s) => s.trim()),
      tags: (formData.get("tags") as string)
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
    };

    if (editingMeal) {
      // Update existing meal
      const updated = all.map((m) => (m.id === editingMeal.id ? mealData : m));
      meals.set(updated);
      showToast("Meal updated successfully", "success");
    } else {
      // Add new meal
      meals.set([...all, mealData]);
      showToast("Meal added successfully", "success");
    }

    showAddForm = false;
    editingMeal = null;
  }

  function deleteMeal(id: string) {
    if (confirm("Are you sure you want to delete this meal?")) {
      const filtered = all.filter((m) => m.id !== id);
      meals.set(filtered);
      showToast("Meal deleted successfully", "success");
    }
  }

  function getMealsByType(type: string) {
    return all.filter((meal) => meal.mealType === type);
  }
</script>

<div class="max-w-4xl mx-auto p-4 space-y-4">
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

  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Meal Library</h1>
    <div class="flex gap-2">
      {#if needsSeeding()}
        <button
          class="btn-outline"
          onclick={loadSampleMeals}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "📥 Load Sample Meals"}
        </button>
      {/if}
      <button class="btn-outline" onclick={() => (showImportForm = true)}>
        📁 Import JSON
      </button>
      <button class="btn" onclick={addMeal}>+ Add Meal</button>
    </div>
  </div>

  <!-- Import Form -->
  {#if showImportForm}
    <div class="card">
      <h2 class="text-xl font-semibold mb-4">Import Meals from JSON</h2>
      <div class="space-y-4">
        <div>
          <label for="json-data" class="block text-sm font-medium mb-2"
            >JSON Data</label
          >
          <textarea
            id="json-data"
            bind:value={importData}
            rows="8"
            class="border p-2 w-full rounded font-mono text-sm"
            placeholder="Paste your JSON meal data here..."
          ></textarea>
        </div>
        <div class="flex gap-2">
          <button class="btn" onclick={handleImport}>Import Meals</button>
          <button
            class="btn-outline"
            onclick={() => {
              showImportForm = false;
              importData = "";
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Add/Edit Form -->
  {#if showAddForm}
    <div class="card">
      <h2 class="text-xl font-semibold mb-4">
        {editingMeal ? "Edit Meal" : "Add New Meal"}
      </h2>

      <form
        onsubmit={(e) => {
          e.preventDefault();
          saveMeal(new FormData(e.target as HTMLFormElement));
        }}
      >
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label for="meal-name" class="block text-sm font-medium mb-1"
              >Meal Name</label
            >
            <input
              id="meal-name"
              type="text"
              name="name"
              value={editingMeal?.name || ""}
              class="border p-2 w-full rounded"
              required
            />
          </div>

          <div>
            <label for="meal-type" class="block text-sm font-medium mb-1"
              >Meal Type</label
            >
            <select
              id="meal-type"
              name="mealType"
              class="border p-2 w-full rounded"
              required
            >
              <option
                value="breakfast"
                selected={editingMeal?.mealType === "breakfast"}
                >Breakfast</option
              >
              <option value="lunch" selected={editingMeal?.mealType === "lunch"}
                >Lunch</option
              >
              <option
                value="dinner"
                selected={editingMeal?.mealType === "dinner"}>Dinner</option
              >
              <option value="snack" selected={editingMeal?.mealType === "snack"}
                >Snack</option
              >
            </select>
          </div>
        </div>

        <div class="mt-4">
          <h3 class="font-medium mb-2">Portion Sizes</h3>
          <div class="grid grid-cols-5 gap-2">
            <div>
              <label for="protein-palms" class="block text-xs mb-1"
                >Protein (palms)</label
              >
              <input
                id="protein-palms"
                type="number"
                name="protein_palms"
                value={editingMeal?.portions?.protein_palms || 0}
                step="0.5"
                class="border p-1 w-full rounded text-sm"
              />
            </div>
            <div>
              <label for="veg-fists" class="block text-xs mb-1"
                >Veggies (fists)</label
              >
              <input
                id="veg-fists"
                type="number"
                name="veg_fists"
                value={editingMeal?.portions?.veg_fists || 0}
                step="0.5"
                class="border p-1 w-full rounded text-sm"
              />
            </div>
            <div>
              <label for="starch-fists" class="block text-xs mb-1"
                >Starch (fists)</label
              >
              <input
                id="starch-fists"
                type="number"
                name="starch_fists"
                value={editingMeal?.portions?.starch_fists || 0}
                step="0.5"
                class="border p-1 w-full rounded text-sm"
              />
            </div>
            <div>
              <label for="fat-thumbs" class="block text-xs mb-1"
                >Fat (thumbs)</label
              >
              <input
                id="fat-thumbs"
                type="number"
                name="fat_thumbs"
                value={editingMeal?.portions?.fat_thumbs || 0}
                step="0.5"
                class="border p-1 w-full rounded text-sm"
              />
            </div>
            <div>
              <label for="fruit-fists" class="block text-xs mb-1"
                >Fruit (fists)</label
              >
              <input
                id="fruit-fists"
                type="number"
                name="fruit_fists"
                value={editingMeal?.portions?.fruit_fists || 0}
                step="0.5"
                class="border p-1 w-full rounded text-sm"
              />
            </div>
          </div>
        </div>

        <div class="mt-4">
          <label for="ingredients" class="block text-sm font-medium mb-1"
            >Ingredients (one per line: name, amount, unit)</label
          >
          <textarea
            id="ingredients"
            name="ingredients"
            rows="3"
            class="border p-2 w-full rounded"
            placeholder="e.g., chicken, 1.5, palm&#10;rice, 1, fist&#10;broccoli, 2, fist"
          ></textarea>
        </div>

        <div class="mt-4">
          <label for="prep-time" class="block text-sm font-medium mb-1"
            >Prep Time (minutes)</label
          >
          <input
            id="prep-time"
            type="number"
            name="prep_time"
            value={editingMeal?.prep_time || ""}
            min="1"
            max="480"
            step="1"
            class="border p-2 w-full rounded"
            placeholder="e.g., 30"
          />
        </div>

        <div class="mt-4">
          <label for="steps" class="block text-sm font-medium mb-1"
            >Steps (one per line)</label
          >
          <textarea
            id="steps"
            name="steps"
            rows="3"
            class="border p-2 w-full rounded"
            placeholder="1. Heat oil in pan&#10;2. Add chicken and cook until golden&#10;3. Add vegetables and stir-fry"
          ></textarea>
        </div>

        <div class="mt-4">
          <label for="tags" class="block text-sm font-medium mb-1"
            >Tags (comma-separated)</label
          >
          <input
            id="tags"
            type="text"
            name="tags"
            value={editingMeal?.tags?.join(", ") || ""}
            class="border p-2 w-full rounded"
            placeholder="quick, healthy, protein-rich"
          />
        </div>

        <div class="flex gap-2 mt-4">
          <button type="submit" class="btn">
            {editingMeal ? "Update Meal" : "Add Meal"}
          </button>
          <button
            type="button"
            class="btn-outline"
            onclick={() => {
              showAddForm = false;
              editingMeal = null;
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Meals Grid -->
  <div class="space-y-6">
    <!-- Breakfast Section -->
    <div class="card">
      <button
        type="button"
        class="w-full flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={() => (breakfastCollapsed = !breakfastCollapsed)}
        aria-expanded={!breakfastCollapsed}
        aria-controls="breakfast-content"
      >
        <h2 class="text-lg font-medium">
          Breakfast ({getMealsByType("breakfast").length} meals)
        </h2>
        <svg
          class="w-5 h-5 transform transition-transform duration-200 {breakfastCollapsed
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

      {#if !breakfastCollapsed}
        <div id="breakfast-content" class="p-4 pt-0">
          {#if getMealsByType("breakfast").length === 0}
            <p class="text-gray-500 text-center py-4">
              No breakfast meals yet. Add your first breakfast meal!
            </p>
          {:else}
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each getMealsByType("breakfast") as meal}
                <div
                  class="border rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div class="flex justify-between items-start mb-2">
                    <h3
                      class="font-semibold cursor-pointer hover:text-blue-600 hover:underline"
                      onclick={() => editMeal(meal)}
                      title="Click to edit meal"
                    >
                      {meal.name}
                    </h3>
                    <div class="flex gap-1">
                      <button
                        class="text-sm text-blue-600 hover:text-blue-800"
                        onclick={() => editMeal(meal)}>Edit</button
                      >
                      <button
                        class="text-sm text-red-600 hover:text-red-800"
                        onclick={() => deleteMeal(meal.id)}>Delete</button
                      >
                    </div>
                  </div>

                  <div class="text-sm text-gray-600 mb-2">
                    {#if meal.tags?.length}
                      <span
                        class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >{meal.tags.join(", ")}</span
                      >
                    {/if}
                  </div>

                  <div class="text-xs text-gray-500 mb-2">
                    <div>
                      Protein: {meal.portions?.protein_palms || 0} palms
                    </div>
                    <div>Veggies: {meal.portions?.veg_fists || 0} fists</div>
                    <div>Starch: {meal.portions?.starch_fists || 0} fists</div>
                    <div>Fat: {meal.portions?.fat_thumbs || 0} thumbs</div>
                    <div>Fruit: {meal.portions?.fruit_fists || 0} fists</div>
                  </div>

                  {#if meal.ingredients?.length}
                    <div class="text-xs text-gray-600 mb-2">
                      <strong>Ingredients:</strong>
                      {meal.ingredients
                        .map((i: any) => `${i.name} ${i.amount} ${i.unit}`)
                        .join(", ")}
                    </div>
                  {/if}

                  {#if meal.steps?.length}
                    <div class="text-xs text-gray-600">
                      <div class="flex items-center gap-2 mb-2">
                        <strong>Prep Steps:</strong>
                        {#if meal.prep_time}
                          <span
                            class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            ⏱️ {meal.prep_time} min
                          </span>
                        {/if}
                      </div>
                      <ol class="list-decimal list-inside mt-1 space-y-1">
                        {#each meal.steps as step, index}
                          <li>{step}</li>
                        {/each}
                      </ol>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Lunch Section -->
    <div class="card">
      <button
        type="button"
        class="w-full flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={() => (lunchCollapsed = !lunchCollapsed)}
        aria-expanded={!lunchCollapsed}
        aria-controls="lunch-content"
      >
        <h2 class="text-lg font-medium">
          Lunch ({getMealsByType("lunch").length} meals)
        </h2>
        <svg
          class="w-5 h-5 transform transition-transform duration-200 {lunchCollapsed
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

      {#if !lunchCollapsed}
        <div id="lunch-content" class="p-4 pt-0">
          {#if getMealsByType("lunch").length === 0}
            <p class="text-gray-500 text-center py-4">
              No lunch meals yet. Add your first lunch meal!
            </p>
          {:else}
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each getMealsByType("lunch") as meal}
                <div
                  class="border rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div class="flex justify-between items-start mb-2">
                    <h3
                      class="font-semibold cursor-pointer hover:text-blue-600 hover:underline"
                      onclick={() => editMeal(meal)}
                      title="Click to edit meal"
                    >
                      {meal.name}
                    </h3>
                    <div class="flex gap-1">
                      <button
                        class="text-sm text-blue-600 hover:text-blue-800"
                        onclick={() => editMeal(meal)}>Edit</button
                      >
                      <button
                        class="text-sm text-red-600 hover:text-red-800"
                        onclick={() => deleteMeal(meal.id)}>Delete</button
                      >
                    </div>
                  </div>

                  <div class="text-sm text-gray-600 mb-2">
                    {#if meal.tags?.length}
                      <span
                        class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                        >{meal.tags.join(", ")}</span
                      >
                    {/if}
                  </div>

                  <div class="text-xs text-gray-500 mb-2">
                    <div>
                      Protein: {meal.portions?.protein_palms || 0} palms
                    </div>
                    <div>Veggies: {meal.portions?.veg_fists || 0} fists</div>
                    <div>Starch: {meal.portions?.starch_fists || 0} fists</div>
                    <div>Fat: {meal.portions?.fat_thumbs || 0} thumbs</div>
                    <div>Fruit: {meal.portions?.fruit_fists || 0} fists</div>
                  </div>

                  {#if meal.ingredients?.length}
                    <div class="text-xs text-gray-600 mb-2">
                      <strong>Ingredients:</strong>
                      {meal.ingredients
                        .map((i: any) => `${i.name} ${i.amount} ${i.unit}`)
                        .join(", ")}
                    </div>
                  {/if}

                  {#if meal.steps?.length}
                    <div class="text-xs text-gray-600">
                      <div class="flex items-center gap-2 mb-2">
                        <strong>Prep Steps:</strong>
                        {#if meal.prep_time}
                          <span
                            class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                          >
                            ⏱️ {meal.prep_time} min
                          </span>
                        {/if}
                      </div>
                      <ol class="list-decimal list-inside mt-1 space-y-1">
                        {#each meal.steps as step, index}
                          <li>{step}</li>
                        {/each}
                      </ol>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Dinner Section -->
    <div class="card">
      <button
        type="button"
        class="w-full flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={() => (dinnerCollapsed = !dinnerCollapsed)}
        aria-expanded={!dinnerCollapsed}
        aria-controls="dinner-content"
      >
        <h2 class="text-lg font-medium">
          Dinner ({getMealsByType("dinner").length} meals)
        </h2>
        <svg
          class="w-5 h-5 transform transition-transform duration-200 {dinnerCollapsed
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

      {#if !dinnerCollapsed}
        <div id="dinner-content" class="p-4 pt-0">
          {#if getMealsByType("dinner").length === 0}
            <p class="text-gray-500 text-center py-4">
              No dinner meals yet. Add your first dinner meal!
            </p>
          {:else}
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each getMealsByType("dinner") as meal}
                <div
                  class="border rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div class="flex justify-between items-start mb-2">
                    <h3
                      class="font-semibold cursor-pointer hover:text-blue-600 hover:underline"
                      onclick={() => editMeal(meal)}
                      title="Click to edit meal"
                    >
                      {meal.name}
                    </h3>
                    <div class="flex gap-1">
                      <button
                        class="text-sm text-blue-600 hover:text-blue-800"
                        onclick={() => editMeal(meal)}>Edit</button
                      >
                      <button
                        class="text-sm text-red-600 hover:text-red-800"
                        onclick={() => deleteMeal(meal.id)}>Delete</button
                      >
                    </div>
                  </div>

                  <div class="text-sm text-gray-600 mb-2">
                    {#if meal.tags?.length}
                      <span
                        class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                        >{meal.tags.join(", ")}</span
                      >
                    {/if}
                  </div>

                  <div class="text-xs text-gray-500 mb-2">
                    <div>
                      Protein: {meal.portions?.protein_palms || 0} palms
                    </div>
                    <div>Veggies: {meal.portions?.veg_fists || 0} fists</div>
                    <div>Starch: {meal.portions?.starch_fists || 0} fists</div>
                    <div>Fat: {meal.portions?.fat_thumbs || 0} thumbs</div>
                    <div>Fruit: {meal.portions?.fruit_fists || 0} fists</div>
                  </div>

                  {#if meal.ingredients?.length}
                    <div class="text-xs text-gray-600 mb-2">
                      <strong>Ingredients:</strong>
                      {meal.ingredients
                        .map((i: any) => `${i.name} ${i.amount} ${i.unit}`)
                        .join(", ")}
                    </div>
                  {/if}

                  {#if meal.steps?.length}
                    <div class="text-xs text-gray-600">
                      <div class="flex items-center gap-2 mb-2">
                        <strong>Prep Steps:</strong>
                        {#if meal.prep_time}
                          <span
                            class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                          >
                            ⏱️ {meal.prep_time} min
                          </span>
                        {/if}
                      </div>
                      <ol class="list-decimal list-inside mt-1 space-y-1">
                        {#each meal.steps as step, index}
                          <li>{step}</li>
                        {/each}
                      </ol>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Snack Section -->
    <div class="card">
      <button
        type="button"
        class="w-full flex items-center justify-between cursor-pointer p-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onclick={() => (snackCollapsed = !snackCollapsed)}
        aria-expanded={!snackCollapsed}
        aria-controls="snack-content"
      >
        <h2 class="text-lg font-medium">
          Snacks ({getMealsByType("snack").length} meals)
        </h2>
        <svg
          class="w-5 h-5 transform transition-transform duration-200 {snackCollapsed
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

      {#if !snackCollapsed}
        <div id="snack-content" class="p-4 pt-0">
          {#if getMealsByType("snack").length === 0}
            <p class="text-gray-500 text-center py-4">
              No snack meals yet. Add your first snack meal!
            </p>
          {:else}
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each getMealsByType("snack") as meal}
                <div
                  class="border rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div class="flex justify-between items-start mb-2">
                    <h3
                      class="font-semibold cursor-pointer hover:text-blue-600 hover:underline"
                      onclick={() => editMeal(meal)}
                      title="Click to edit meal"
                    >
                      {meal.name}
                    </h3>
                    <div class="flex gap-1">
                      <button
                        class="text-sm text-blue-600 hover:text-blue-800"
                        onclick={() => editMeal(meal)}>Edit</button
                      >
                      <button
                        class="text-sm text-red-600 hover:text-red-800"
                        onclick={() => deleteMeal(meal.id)}>Delete</button
                      >
                    </div>
                  </div>

                  <div class="text-sm text-gray-600 mb-2">
                    {#if meal.tags?.length}
                      <span
                        class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded"
                        >{meal.tags.join(", ")}</span
                      >
                    {/if}
                  </div>

                  <div class="text-xs text-gray-500 mb-2">
                    <div>
                      Protein: {meal.portions?.protein_palms || 0} palms
                    </div>
                    <div>Veggies: {meal.portions?.veg_fists || 0} fists</div>
                    <div>Starch: {meal.portions?.starch_fists || 0} fists</div>
                    <div>Fat: {meal.portions?.fat_thumbs || 0} thumbs</div>
                    <div>Fruit: {meal.portions?.fruit_fists || 0} fists</div>
                  </div>

                  {#if meal.ingredients?.length}
                    <div class="text-xs text-gray-600 mb-2">
                      <strong>Ingredients:</strong>
                      {meal.ingredients
                        .map((i: any) => `${i.name} ${i.amount} ${i.unit}`)
                        .join(", ")}
                    </div>
                  {/if}

                  {#if meal.steps?.length}
                    <div class="text-xs text-gray-600">
                      <div class="flex items-center gap-2 mb-2">
                        <strong>Prep Steps:</strong>
                        {#if meal.prep_time}
                          <span
                            class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded"
                          >
                            ⏱️ {meal.prep_time} min
                          </span>
                        {/if}
                      </div>
                      <ol class="list-decimal list-inside mt-1 space-y-1">
                        {#each meal.steps as step, index}
                          <li>{step}</li>
                        {/each}
                      </ol>
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

  <!-- Empty State -->
  {#if all.length === 0}
    <div class="text-center py-12">
      <div class="text-6xl mb-4">🍽️</div>
      <h3 class="text-xl font-semibold mb-2">No meals yet</h3>
      <p class="text-gray-600 mb-4">
        Get started by loading sample meals or creating your own
      </p>
      <div class="flex gap-2 justify-center">
        <button class="btn" onclick={loadSampleMeals} disabled={isLoading}>
          {isLoading ? "Loading..." : "📥 Load Sample Meals"}
        </button>
        <button class="btn-outline" onclick={() => (showImportForm = true)}>
          📁 Import JSON
        </button>
      </div>
    </div>
  {/if}
</div>
