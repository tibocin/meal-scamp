import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Enable Svelte 5 runes mode
	compilerOptions: {
		runes: true
	},
	
	// Use vitePreprocess for TypeScript and other preprocessing
	preprocess: vitePreprocess(),
	
	kit: {
		// Use Node.js adapter for production deployment
		adapter: adapter({
			// For SvelteKit 2.x, use the correct output directory configuration
			out: 'www'
		})
	}
};

export default config;
