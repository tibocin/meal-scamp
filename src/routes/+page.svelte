<script lang="ts">
  import Planner from "$lib/ui/Planner.svelte";
  import Tracker from "$lib/ui/Tracker.svelte";
  import LinkBar from "$lib/ui/LinkBar.svelte";

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }
</script>

<div class="max-w-5xl mx-auto p-4 space-y-4">
  <LinkBar />
  <div class="grid md:grid-cols-2 gap-4">
    <div class="card">
      <h2 class="text-xl font-semibold mb-2">Weekly Planner</h2>
      <Planner />
    </div>
    <div class="card">
      <h2 class="text-xl font-semibold mb-2">Success & Workout Tracker</h2>
      <Tracker />
    </div>
  </div>
</div>
