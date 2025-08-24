import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  kit: {
    adapter: adapter({
      out: 'build' // Build output directory to match service configuration
    }),
    alias: { $lib: 'src/lib' }
  },
  preprocess: vitePreprocess()
};
export default config;
