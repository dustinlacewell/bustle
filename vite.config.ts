import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        /^node:.*/,  // Node.js built-ins
        'cmd-ts'     // External dependencies
      ]
    },
    sourcemap: true,
    target: 'node18'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'node',
      appPath: './src/index.ts',
      exportName: 'default',
      tsCompiler: 'typescript'
    })
  ]
})
