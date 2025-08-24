<!--
  src/lib/ui/AuthGuard.svelte
  Authentication guard that manages login/signup flow
  Related components: Login, Signup, Navigation
  Tags: authentication, routing, user-management
-->

<script lang="ts">
  import { auth } from "$lib/stores/auth";
  import { onMount } from "svelte";
  import Login from "./Login.svelte";
  import Signup from "./Signup.svelte";

  let showSignup = $state(false);

  onMount(() => {
    // Initialize auth state from stored token
    auth.init();
  });

  function switchToSignup() {
    showSignup = true;
  }

  function switchToLogin() {
    showSignup = false;
  }
</script>

{#if $auth.isLoading}
  <!-- Loading state -->
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
      ></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
{:else if $auth.isAuthenticated}
  <!-- User is authenticated, show main app -->
  <slot />
{:else}
  <!-- User is not authenticated, show auth forms -->
  {#if showSignup}
    <Signup on:switchToLogin={switchToLogin} />
  {:else}
    <Login on:switchToSignup={switchToSignup} />
  {/if}
{/if}
