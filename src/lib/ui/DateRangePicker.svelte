<!--
  src/lib/ui/DateRangePicker.svelte
  Date range picker component for meal and exercise planning
  Related components: Planner, Tracker
  Tags: date-picker, calendar, planning
-->
<script lang="ts">
  import { dateRange } from "$lib/stores";

  let startDate = $state("");
  let endDate = $state("");

  // Subscribe to store changes
  dateRange.subscribe((range) => {
    startDate = range.start;
    endDate = range.end;
  });

  function updateDateRange() {
    if (startDate && endDate && startDate <= endDate) {
      dateRange.set({ start: startDate, end: endDate });
    }
  }

  function setDefaultRange() {
    const today = new Date();
    const defaultEndDate = new Date(today);
    defaultEndDate.setDate(today.getDate() + 6); // 7 days from now

    const newRange = {
      start: today.toISOString().slice(0, 10),
      end: defaultEndDate.toISOString().slice(0, 10),
    };

    dateRange.set(newRange);
  }

  function setWeekRange() {
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

  function setMonthRange() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const newRange = {
      start: startOfMonth.toISOString().slice(0, 10),
      end: endOfMonth.toISOString().slice(0, 10),
    };

    dateRange.set(newRange);
  }
</script>

<div class="card">
  <h3 class="font-semibold mb-3">Date Range Selection</h3>

  <div class="grid grid-cols-2 gap-4 mb-4">
    <div>
      <label class="block text-sm font-medium mb-1">Start Date</label>
      <input
        type="date"
        bind:value={startDate}
        onchange={updateDateRange}
        class="border p-2 w-full rounded"
      />
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">End Date</label>
      <input
        type="date"
        bind:value={endDate}
        onchange={updateDateRange}
        class="border p-2 w-full rounded"
      />
    </div>
  </div>

  <div class="flex gap-2 flex-wrap">
    <button class="btn-outline text-sm" onclick={setDefaultRange}>
      📅 7 Days
    </button>
    <button class="btn-outline text-sm" onclick={setWeekRange}>
      📅 This Week
    </button>
    <button class="btn-outline text-sm" onclick={setMonthRange}>
      📅 This Month
    </button>
  </div>

  {#if startDate && endDate}
    <div class="mt-3 text-sm text-gray-600">
      Planning period: <span class="font-medium">{startDate}</span> to
      <span class="font-medium">{endDate}</span>
      {#if startDate > endDate}
        <div class="text-red-600 mt-1">
          ⚠️ Start date must be before end date
        </div>
      {/if}
    </div>
  {/if}
</div>
