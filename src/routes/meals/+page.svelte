<script lang="ts">
  import { meals } from '$lib/stores';
  let all: any[] = [];
  meals.subscribe(v=> all=v);
  if (all.length===0) {
    fetch('/api/seed').then(r=>r.json()).then(data=>meals.set(data));
  }
</script>

<div class="max-w-5xl mx-auto p-4 space-y-4">
  <h1 class="text-2xl font-semibold">Meals</h1>
  <div class="grid md:grid-cols-2 gap-4">
    {#each all as m}
      <div class="card">
        <div class="font-semibold">{m.name}</div>
        <div class="text-sm text-gray-500">{m.mealType}</div>
        <div class="mt-2 text-sm">Portions: 🍗 {m.portions.protein_palms} palms, 🥦 {m.portions.veg_fists} fists, 🍚 {m.portions.starch_fists} fists, 🥑 {m.portions.fat_thumbs} thumbs</div>
        <div class="mt-2 text-sm">
          <div class="font-semibold">Ingredients</div>
          <ul class="list-disc ml-5">
            {#each m.ingredients as ing}<li>{ing.name} — {ing.amount} {ing.unit}</li>{/each}
          </ul>
        </div>
        <div class="mt-2 text-sm">
          <div class="font-semibold">Steps</div>
          <ol class="list-decimal ml-5">
            {#each m.steps as s}<li>{s}</li>{/each}
          </ol>
        </div>
        <div class="mt-2 flex gap-2">{#each m.tags as t}<span class="tag">{t}</span>{/each}</div>
      </div>
    {/each}
  </div>
</div>
