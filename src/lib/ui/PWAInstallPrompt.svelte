<!--
  src/lib/ui/PWAInstallPrompt.svelte
  PWA install prompt component for mobile users
  Related components: Navigation, main layout
  Tags: PWA, mobile, install, user-experience
-->

<script lang="ts">
  let deferredPrompt: any = $state(null);
  let showInstallPrompt = $state(false);

  // Listen for the beforeinstallprompt event
  if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallPrompt = true;
    });
  }

  async function installPWA() {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
      showInstallPrompt = false;
    } else {
      console.log("User dismissed the install prompt");
    }

    // Clear the deferredPrompt
    deferredPrompt = null;
  }

  function dismissPrompt() {
    showInstallPrompt = false;
  }
</script>

{#if showInstallPrompt}
  <div
    class="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <div
            class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
          >
            <span class="text-2xl">🍽️</span>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-900">Install Meal Scamp</h3>
          <p class="text-xs text-gray-500">
            Add to home screen for quick access
          </p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          class="text-sm text-gray-400 hover:text-gray-600"
          onclick={dismissPrompt}
        >
          <span class="sr-only">Dismiss</span>
          ×
        </button>
        <button
          type="button"
          class="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onclick={installPWA}
        >
          Install
        </button>
      </div>
    </div>
  </div>
{/if}
