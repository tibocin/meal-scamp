<script lang="ts">
  import "$lib/styles.css";
  import Navigation from "$lib/ui/Navigation.svelte";
  import AuthGuard from "$lib/ui/AuthGuard.svelte";
  import PWAInstallPrompt from "$lib/ui/PWAInstallPrompt.svelte";
</script>

<AuthGuard>
  <Navigation />
  <slot />
  <PWAInstallPrompt />
</AuthGuard>
