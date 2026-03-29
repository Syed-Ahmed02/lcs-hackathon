import { defineConfig } from 'vite'
import { resolve } from 'path'

// Builds content/extractor.js (IIFE, injected into pages)
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/lib/contentExtractor.ts'),
      formats: ['iife'],
      name: 'FocusGuardExtractor',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'content/extractor.js',
      },
    },
  },
})
