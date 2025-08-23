import adapter from '@sveltejs/adapter-node';
const config = {
  kit: {
    adapter: adapter({
      out: 'www' // Change build output directory to www/
    }),
    alias: { $lib: 'src/lib' }
  },
  preprocess: {
    typescript: true
  }
};
export default config;
