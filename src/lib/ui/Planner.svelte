<script>
  import { meals, plan } from '$lib/stores';
  import { get } from 'svelte/store';

  const days = 7;
  let start = new Date();
  let mealMap = {};
  plan.subscribe(v => mealMap = v);

  function dates() {
    const out = [];
    const s = new Date(start);
    for (let i=0;i<days;i++){ const d=new Date(s); d.setDate(s.getDate()+i); out.push(d.toISOString().slice(0,10)); }
    return out;
  }

  let allMeals = [];
  meals.subscribe(v => allMeals = v);
  if (allMeals.length === 0) {
    fetch('/api/seed').then(r=>r.json()).then(data=>meals.set(data));
  }

  function add(date, mealId){
    const p = structuredClone(mealMap);
    p[date] = p[date] || [];
    p[date].push(mealId);
    plan.set(p);
  }
  function remove(date, idx){
    const p = structuredClone(mealMap);
    p[date].splice(idx,1);
    plan.set(p);
  }

  $: counts = (()=>{
    const c = {};
    Object.values(mealMap).forEach(arr=>arr.forEach(m=>{ c[m]=(c[m]||0)+1 }));
    return c;
  })();

  $: shopping = (()=>{
    const out = {};
    const mealsById = Object.fromEntries(allMeals.map(m=>[m.id,m]));
    for (const arr of Object.values(mealMap)) {
      for (const id of arr) {
        const m = mealsById[id]; if (!m) continue;
        for (const ing of m.ingredients) {
          out[ing.name] = (out[ing.name]||0) + (ing.amount||0);
        }
      }
    }
    return out;
  })();

  function getMealsForDate(date) {
    return mealMap[date] || [];
  }

  function getMealName(id) {
    const meal = allMeals.find(x => x.id === id);
    return meal ? meal.name : id;
  }
</script>

<div class="space-y-4">
  <div class="card">
    <h3 class="font-semibold mb-2">Add Meals to Days</h3>
    <div class="flex gap-2 flex-wrap">
      {#each allMeals as m}
        <button class="btn-outline" on:click={()=>add(dates()[0], m.id)}>{m.name}</button>
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
                <button class="tag" on:click={()=>remove(d,i)}>{getMealName(id)} ✕</button>
              {/each}
            {/if}
          </div>
          <div class="mt-2">
            <select class="border p-1" on:change={(e)=>add(d, e.target.value)}>
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
      {#each Object.entries(shopping) as [name, amt]}
        <div class="flex justify-between border-b py-1 text-sm">
          <span>{name}</span><span class="font-mono">{amt}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
