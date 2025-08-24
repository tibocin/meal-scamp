<!--
  src/lib/ui/Navigation.svelte
  Navigation bar component for moving between main app pages
  Related components: Layout, Pages
  Tags: navigation, routing, mobile-responsive
-->

<script lang="ts">
  import { page } from '$app/stores';
  import { auth, user } from '$lib/stores/auth';
  
  // Navigation items with their routes and icons
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/meals', label: 'Meals', icon: '🍽️' },
    { path: '/planner', label: 'Planner', icon: '📅' },
    { path: '/tracker', label: 'Tracker', icon: '📊' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];
  
  // Check if current path matches nav item
  function isActive(path: string): boolean {
    if (path === '/') {
      return $page.url.pathname === '/';
    }
    return $page.url.pathname.startsWith(path);
  }

  function handleLogout() {
    auth.logout();
  }
</script>

<!-- Navigation Bar -->
<nav class="bg-white border-b border-gray-200 sticky top-0 z-40">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <!-- App Logo/Title -->
      <div class="flex items-center">
        <h1 class="text-xl font-bold text-gray-900">Meal Scamp</h1>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-8">
        {#each navItems as item}
          <a
            href={item.path}
            class="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 {isActive(item.path) 
              ? 'text-blue-600 bg-blue-50 border border-blue-200' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
          >
            <span class="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        {/each}
        
        <!-- User Info & Logout -->
        <div class="flex items-center space-x-4 ml-8 pl-8 border-l border-gray-200">
          <div class="text-sm text-gray-600">
            Welcome, <span class="font-medium text-gray-900">{$user?.username || 'User'}</span>
          </div>
          <button
            onclick={handleLogout}
            class="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-md transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
      
      <!-- Mobile Menu Button -->
      <div class="md:hidden">
        <button
          class="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
          onclick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Mobile Navigation Menu -->
    <div id="mobile-menu" class="hidden md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
        {#each navItems as item}
          <a
            href={item.path}
            class="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 {isActive(item.path) 
              ? 'text-blue-600 bg-blue-50 border border-blue-200' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}"
          >
            <span class="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        {/each}
      </div>
    </div>
  </div>
</nav>
