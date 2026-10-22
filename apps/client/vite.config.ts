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
      '/api': process.env.PNW_API ?? 'http://localhost:4000',
      '/uploads': process.env.PNW_API ?? 'http://localhost:4000',
      // Media comes out of the server's database; public/media is only the seed it imports from.
      '/media': process.env.PNW_API ?? 'http://localhost:4000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * The scraped indexes - 253 post summaries, 64 archives, the document
         * tree - and the 53 default page documents (AGENT.md 6.20) are most of
         * the bundle, and they change on a different clock from the code:
         * regenerating them from the mirror should not force a browser to
         * fetch the components again, and editing a component should not force
         * it to fetch 700 KB of data it already has. The documents are kept
         * eager rather than split per route: a route-level lazy chunk would
         * flash a Suspense fallback on every navigation, and the Szerkesztő
         * needs them all anyway to start an edit from a page's default.
         */
        manualChunks: (id) => (id.includes('/src/data/') ? 'data' : undefined),
      },
    },
  },
})
