import { defineConfig } from 'vite'
import { resolve } from 'path'

// Builds content/overlay.js (IIFE, injected into blocked pages)
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/lib/blockOverlay.ts'),
      formats: ['iife'],
      name: 'FocusGuardOverlay',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'content/overlay.js',
      },
    },
  },
})
