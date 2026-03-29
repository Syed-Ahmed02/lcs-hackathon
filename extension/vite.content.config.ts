import { defineConfig } from 'vite'
import { resolve } from 'path'

// Separate IIFE build for content scripts injected into pages
// These cannot be ES modules — they run in page context
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't wipe the main build output
    lib: {
      entry: {
        extractor: resolve(__dirname, 'src/lib/contentExtractor.ts'),
        overlay: resolve(__dirname, 'src/lib/blockOverlay.ts'),
      },
      formats: ['iife'],
      name: 'FocusGuardContent',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'content/[name].js',
      },
    },
  },
})
