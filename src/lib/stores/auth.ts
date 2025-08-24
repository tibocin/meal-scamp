/**
 * src/lib/stores/auth.ts
 * Authentication store for user login/signup and session management
 * Related components: Login, Signup, AuthGuard
 * Tags: authentication, user-management, database-sync
 */

import { writable, derived } from 'svelte/store';
import { persisted } from 'svelte-local-storage-store';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Create the auth store
const createAuthStore = () => {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  // Persist token in localStorage
  const tokenStore = persisted<string | null>('auth-token', null);

  return {
    subscribe,

    // Initialize auth state from stored token
    async init() {
      update(state => ({ ...state, isLoading: true }));

      // Get the current token value from the store
      let token: string | null = null;
      tokenStore.subscribe(value => { token = value; })();

      if (token) {
        try {
          const user = await this.validateToken(token);
          if (user) {
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return;
          }
        } catch (error) {
          console.error('Token validation failed:', error);
        }
      }

      // Clear invalid token
      tokenStore.set(null);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    },

    // User signup
    async signup(email: string, username: string, password: string) {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Signup failed');
        }

        // Auto-login after successful signup
        await this.login(email, password);

        return { success: true, user: data.user };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Signup failed';
        update(state => ({ ...state, error: errorMessage, isLoading: false }));
        return { success: false, error: errorMessage };
      }
    },

    // User login
    async login(email: string, password: string) {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        // Store token and user data
        tokenStore.set(data.token);
        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        return { success: true, user: data.user };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        update(state => ({ ...state, error: errorMessage, isLoading: false }));
        return { success: false, error: errorMessage };
      }
    },

    // User logout
    logout() {
      tokenStore.set(null);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    },

    // Validate stored token
    async validateToken(token: string): Promise<User | null> {
      try {
        const response = await fetch('/api/auth/validate', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        return data.user;
      } catch (error) {
        console.error('Token validation error:', error);
        return null;
      }
    },

    // Clear error
    clearError() {
      update(state => ({ ...state, error: null }));
    }
  };
};

export const auth = createAuthStore();

// Derived stores for convenience
export const user = derived(auth, $auth => $auth.user);
export const isAuthenticated = derived(auth, $auth => $auth.isAuthenticated);
export const isLoading = derived(auth, $auth => $auth.isLoading);
export const error = derived(auth, $auth => $auth.error);
