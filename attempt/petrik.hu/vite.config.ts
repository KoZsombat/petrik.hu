import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        /**
         * The scraped indexes - 253 post summaries, 64 archives, the document
         * tree - are most of the bundle, and they change on a different clock
         * from the code: regenerating them from the mirror should not force a
         * browser to fetch the components again, and editing a component
         * should not force it to fetch 400 KB of data it already has.
         */
        manualChunks: (id) => (id.includes('/src/data/') ? 'data' : undefined),
      },
    },
  },
})
