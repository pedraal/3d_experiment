import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  root: 'src/',
  publicDir: '../static/',
  base: './',
  server: {
    port: 3000,
  },
  plugins: [wasm(), topLevelAwait()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        showcase: resolve(__dirname, 'src/showcase/index.html'),
        sandbox: resolve(__dirname, 'src/sandbox/index.html'),
      },
    },
  },
})
