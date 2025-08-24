<!--
  src/lib/ui/Login.svelte
  User login component with email/password authentication
  Related components: Signup, AuthGuard, Navigation
  Tags: authentication, login, user-interface
-->

<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ switchToSignup: void }>();

  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);

  async function handleLogin() {
    if (!email || !password) {
      return;
    }

    const result = await auth.login(email, password);
    if (result.success) {
      // Login successful, component will be hidden by parent
      email = '';
      password = '';
    }
  }

  function switchToSignup() {
    dispatch('switchToSignup');
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Welcome back to Meal Scamp
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Sign in to your account to continue
      </p>
    </div>

    <form class="mt-8 space-y-6" onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
      <div class="rounded-md shadow-sm -space-y-px">
        <div>
          <label for="email" class="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
          />
        </div>
        <div class="relative">
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autocomplete="current-password"
            required
            bind:value={password}
            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
            placeholder="Password"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-3 flex items-center"
            onclick={() => showPassword = !showPassword}
          >
            {#if showPassword}
              <span class="text-gray-400 hover:text-gray-600">🙈</span>
            {:else}
              <span class="text-gray-400 hover:text-gray-600">👁️</span>
            {/if}
          </button>
        </div>
      </div>

      {#if $auth.error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {$auth.error}
        </div>
      {/if}

      <div>
        <button
          type="submit"
          disabled={$auth.isLoading || !email || !password}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if $auth.isLoading}
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </span>
            Signing in...
          {:else}
            Sign in
          {/if}
        </button>
      </div>

      <div class="text-center">
        <button
          type="button"
          onclick={switchToSignup}
          class="text-blue-600 hover:text-blue-500 text-sm"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </form>
  </div>
</div>
