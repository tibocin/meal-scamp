<script lang="ts">
  import { pushover } from '$lib/stores';
  let cfg: any;
  pushover.subscribe(v=> cfg=v);
  function save(){ pushover.set(cfg); alert('Saved'); }
  async function test(){
    if (!cfg.enabled) { alert('Enable first'); return; }
    const r = await fetch('/api/pushover', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ title:'Meal Scamp', message:'Test from settings' })});
    alert('Status: '+r.status);
  }
</script>
<div class="max-w-3xl mx-auto p-4 card space-y-2">
  <h1 class="text-xl font-semibold">Settings</h1>
  <label class="block">User Key <input class="border p-1 w-full" bind:value={cfg.userKey}></label>
  <label class="block">App Token <input class="border p-1 w-full" bind:value={cfg.appToken}></label>
  <label class="block"><input type="checkbox" bind:checked={cfg.enabled}> Enable Pushover reminders</label>
  <div class="flex gap-2 mt-2">
    <button class="btn" on:click={save}>Save</button>
    <button class="btn-outline" on:click={test}>Send Test</button>
  </div>
</div>
