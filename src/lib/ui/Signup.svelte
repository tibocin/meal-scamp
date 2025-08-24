<!--
  src/lib/ui/Signup.svelte
  User signup component with email, username, and password
  Related components: Login, AuthGuard, Navigation
  Tags: authentication, signup, user-registration
-->

<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ switchToLogin: void }>();

  let email = $state('');
  let username = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);

  async function handleSignup() {
    if (!email || !username || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 8) {
      return;
    }

    const result = await auth.signup(email, username, password);
    if (result.success) {
      // Signup successful, component will be hidden by parent
      email = '';
      username = '';
      password = '';
      confirmPassword = '';
    }
  }

  function switchToLogin() {
    dispatch('switchToLogin');
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Join Meal Scamp
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Create your account to get started
      </p>
    </div>

    <form class="mt-8 space-y-6" onsubmit={(e) => { e.preventDefault(); handleSignup(); }}>
      <div class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autocomplete="username"
            required
            bind:value={username}
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Choose a username"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <div class="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autocomplete="new-password"
              required
              bind:value={password}
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
              placeholder="Create a password (min 8 characters)"
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

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
          <div class="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autocomplete="new-password"
              required
              bind:value={confirmPassword}
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              onclick={() => showConfirmPassword = !showConfirmPassword}
            >
              {#if showConfirmPassword}
                <span class="text-gray-400 hover:text-gray-600">🙈</span>
              {:else}
                <span class="text-gray-400 hover:text-gray-600">👁️</span>
              {/if}
            </button>
          </div>
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
          disabled={$auth.isLoading || !email || !username || !password || !confirmPassword || password !== confirmPassword || password.length < 8}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if $auth.isLoading}
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </span>
            Creating account...
          {:else}
            Create Account
          {/if}
        </button>
      </div>

      <div class="text-center">
        <button
          type="button"
          onclick={switchToLogin}
          class="text-blue-600 hover:text-blue-500 text-sm"
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  </div>
</div>
