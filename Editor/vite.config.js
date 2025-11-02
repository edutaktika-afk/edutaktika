import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import { sentryVitePlugin } from '@sentry/vite-plugin';
import analyzer from 'vite-bundle-analyzer';

export default defineConfig({
  // Relative paths so assets work from a subfolder (important for /editor)
  base: './',

  plugins: [
    react(),
    // Enable Sentry only if you decide to use it
    // sentryVitePlugin({
    //   org: 'polotno',
    //   project: 'polotno-studio',
    // }),

    // Analyzer: dev-only (run with ANALYZE=true npm run build)
    process.env.ANALYZE === 'true' && analyzer(),
  ].filter(Boolean),

  build: {
    // Sourcemaps: disable on Netlify unless you explicitly want them
    sourcemap: process.env.SOURCEMAP === 'true',

    // Output to dist directory (build script will copy to deploy/editor)
    outDir: 'dist',
    emptyOutDir: true,
  },
});
