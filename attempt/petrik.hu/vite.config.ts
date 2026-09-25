import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    /**
     * The only part of this static site with a backend: /hirkezelo/ talks to
     * the Express server in server/ (`npm run server`, :4000). Proxying here
     * keeps the browser on Vite's own origin, so no CORS setup is needed.
     */
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * The scraped indexes - 253 post summaries, 64 archives, the document
         * tree - are most of the bundle, and they change on a different clock
         * from the code: regenerating them from the mirror should not force a
         * browser to fetch the components again, and editing a component
         * should not force it to fetch 400 KB of data it already has.
         *
         * The one exception is the Szerkesztő's page inventory (AGENT.md
         * 6.19): only the editor needs it, and it imports it lazily, so it
         * gets a chunk of its own instead of riding in with every page.
         */
        manualChunks: (id) =>
          id.includes('/src/data/') && !id.includes('/src/data/page-inventory') ? 'data' : undefined,
      },
    },
  },
})
