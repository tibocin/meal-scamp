<script lang="ts">
  import { meals } from "$lib/stores";
  import { onMount } from "svelte";
  
  let all = $state<any[]>([]);
  let showAddForm = $state(false);
  let editingMeal = $state<any>(null);
  
  meals.subscribe((v) => (all = v));
  
  // Load data only on client side using onMount
  onMount(() => {
    if (all.length === 0) {
      fetch("/api/seed")
        .then((r) => r.json())
        .then((data) => meals.set(data));
    }
  });

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
      name: formData.get('name') as string,
      mealType: formData.get('mealType') as string,
      portions: {
        protein_palms: Number(formData.get('protein_palms')),
        veg_fists: Number(formData.get('veg_fists')),
        starch_fists: Number(formData.get('starch_fists')),
        fat_thumbs: Number(formData.get('fat_thumbs')),
        fruit_fists: Number(formData.get('fruit_fists'))
      },
      ingredients: [
        {
          name: formData.get('ingredient1') as string,
          amount: Number(formData.get('amount1')),
          unit: formData.get('unit1') as string
        }
      ].filter(i => i.name && i.amount),
      steps: (formData.get('steps') as string).split('\n').filter(s => s.trim()),
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t)
    };

    if (editingMeal) {
      // Update existing meal
      const updated = all.map(m => m.id === editingMeal.id ? mealData : m);
      meals.set(updated);
    } else {
      // Add new meal
      meals.set([...all, mealData]);
    }
    
    showAddForm = false;
    editingMeal = null;
  }

  function deleteMeal(id: string) {
    if (confirm('Are you sure you want to delete this meal?')) {
      const filtered = all.filter(m => m.id !== id);
      meals.set(filtered);
    }
  }
</script>

<div class="max-w-4xl mx-auto p-4 space-y-4">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Meal Library</h1>
    <button class="btn" onclick={addMeal}>+ Add Meal</button>
  </div>

  {#if showAddForm}
    <div class="card">
      <h2 class="text-xl font-semibold mb-4">
        {editingMeal ? 'Edit Meal' : 'Add New Meal'}
      </h2>
      
      <form onsubmit={(e) => { e.preventDefault(); saveMeal(new FormData(e.target as HTMLFormElement)); }}>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Meal Name</label>
            <input 
              type="text" 
              name="name" 
              value={editingMeal?.name || ''} 
              class="border p-2 w-full rounded" 
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Meal Type</label>
            <select name="mealType" class="border p-2 w-full rounded" required>
              <option value="breakfast" selected={editingMeal?.mealType === 'breakfast'}>Breakfast</option>
              <option value="lunch" selected={editingMeal?.mealType === 'lunch'}>Lunch</option>
              <option value="dinner" selected={editingMeal?.mealType === 'dinner'}>Dinner</option>
              <option value="snack" selected={editingMeal?.mealType === 'snack'}>Snack</option>
            </select>
          </div>
        </div>

        <div class="mt-4">
          <h3 class="font-medium mb-2">Portion Sizes</h3>
          <div class="grid grid-cols-5 gap-2">
            <div>
              <label class="block text-xs mb-1">Protein (palms)</label>
              <input type="number" name="protein_palms" value={editingMeal?.portions?.protein_palms || 0} step="0.5" class="border p-1 w-full rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs mb-1">Veggies (fists)</label>
              <input type="number" name="veg_fists" value={editingMeal?.portions?.veg_fists || 0} step="0.5" class="border p-1 w-full rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs mb-1">Starch (fists)</label>
              <input type="number" name="starch_fists" value={editingMeal?.portions?.starch_fists || 0} step="0.5" class="border p-1 w-full rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs mb-1">Fat (thumbs)</label>
              <input type="number" name="fat_thumbs" value={editingMeal?.portions?.fat_thumbs || 0} step="0.5" class="border p-1 w-full rounded text-sm" />
            </div>
            <div>
              <label class="block text-xs mb-1">Fruit (fists)</label>
              <input type="number" name="fruit_fists" value={editingMeal?.portions?.fruit_fists || 0} step="0.5" class="border p-1 w-full rounded text-sm" />
            </div>
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium mb-1">Ingredients (one per line: name, amount, unit)</label>
          <textarea name="ingredients" rows="3" class="border p-2 w-full rounded" placeholder="e.g., chicken, 1.5, palm&#10;rice, 1, fist&#10;broccoli, 2, fist"></textarea>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium mb-1">Steps (one per line)</label>
          <textarea name="steps" rows="3" class="border p-2 w-full rounded" placeholder="e.g., Cook chicken 10-12 min&#10;Cook rice&#10;Steam broccoli">{editingMeal?.steps?.join('\n') || ''}</textarea>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium mb-1">Tags (comma-separated)</label>
          <input type="text" name="tags" value={editingMeal?.tags?.join(', ') || ''} class="border p-2 w-full rounded" placeholder="quick, gluten-free, batch" />
        </div>

        <div class="flex gap-2 mt-4">
          <button type="submit" class="btn">
            {editingMeal ? 'Update Meal' : 'Add Meal'}
          </button>
          <button type="button" class="btn-outline" onclick={() => { showAddForm = false; editingMeal = null; }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  {/if}

  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each all as meal}
      <div class="card">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-semibold">{meal.name}</h3>
          <div class="flex gap-1">
            <button class="text-sm text-blue-600 hover:text-blue-800" onclick={() => editMeal(meal)}>Edit</button>
            <button class="text-sm text-red-600 hover:text-red-800" onclick={() => deleteMeal(meal.id)}>Delete</button>
          </div>
        </div>
        
        <div class="text-sm text-gray-600 mb-2">
          <span class="capitalize">{meal.mealType}</span>
          {#if meal.tags?.length}
            • {meal.tags.join(', ')}
          {/if}
        </div>
        
        <div class="text-xs text-gray-500 mb-2">
          <div>Protein: {meal.portions?.protein_palms || 0} palms</div>
          <div>Veggies: {meal.portions?.veg_fists || 0} fists</div>
          <div>Starch: {meal.portions?.starch_fists || 0} fists</div>
          <div>Fat: {meal.portions?.fat_thumbs || 0} thumbs</div>
          <div>Fruit: {meal.portions?.fruit_fists || 0} fists</div>
        </div>
        
        {#if meal.ingredients?.length}
          <div class="text-xs text-gray-600">
            <strong>Ingredients:</strong> {meal.ingredients.map((i: any) => `${i.name} ${i.amount} ${i.unit}`).join(', ')}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
