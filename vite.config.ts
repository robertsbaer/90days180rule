/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import Prerenderer from 'vite-plugin-prerender';

const routes = [
  '/',
  '/schengen-calculator',
  '/90-180-rule',
  '/schengen-visa-calculator',
  '/how-many-days-can-i-stay-in-europe',
  '/when-can-i-return-to-schengen',
  '/schengen-calculator-americans',
  '/schengen-calculator-uk',
  // These pages need content before they can be prerendered
  // '/how-to-count-schengen-days',
  // '/schengen-overstay-rules',
];

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    Prerenderer({
      // Required - The path to the vite-outputted app to prerender.
      staticDir: fileURLToPath(new URL('./dist', import.meta.url)),
      // Required - Routes to render.
      routes: routes,
      postProcess(renderedRoute) {
        // Replace the hydration script with an empty string, 
        // as the page is already fully rendered.
        renderedRoute.html = renderedRoute.html.replace(
          /<script type="module"[^>]*?src=".*?main\.tsx"><\/script>/,
          ''
        );
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
