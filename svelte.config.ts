import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  kit: {
    adapter: adapter({
      out: 'www' // Change build output directory to www/
    }),
    alias: { $lib: 'src/lib' }
  },
  preprocess: vitePreprocess()
};
export default config;
