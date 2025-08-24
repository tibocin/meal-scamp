<script lang="ts">
  import Planner from "$lib/ui/Planner.svelte";
  import Tracker from "$lib/ui/Tracker.svelte";
  import LinkBar from "$lib/ui/LinkBar.svelte";
  import DateRangePicker from "$lib/ui/DateRangePicker.svelte";

  // Service worker registration - only run in browser
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }
</script>

<div class="max-w-5xl mx-auto p-4 space-y-4">
  <LinkBar />
  
  <!-- Data Persistence Notice -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
    <div class="flex items-start gap-2">
      <div class="text-blue-600 text-lg">💾</div>
      <div class="text-sm text-blue-800">
        <strong>Data Storage:</strong> Your meal plans, tracking data, and custom meals are stored locally in your browser. 
        This means your data stays private but will be lost if you clear your browser data or switch devices.
      </div>
    </div>
  </div>
  
  <!-- Date Range Picker -->
  <DateRangePicker />
  
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
