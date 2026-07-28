import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'node:path';

export default defineConfig({
  cacheDir: './.vite',
  define: {
    'process.env': {},
    'process.version': JSON.stringify('v24.11.1'),
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@midnight-ntwrk/confidential-voting-api': path.resolve(__dirname, '../api/src'),
      '@midnight-ntwrk/confidential-voting-contract': path.resolve(__dirname, '../contract/src'),
      'three': path.resolve(__dirname, '../node_modules/three'),
      '@react-three/fiber': path.resolve(__dirname, '../node_modules/@react-three/fiber'),
      '@react-three/drei': path.resolve(__dirname, '../node_modules/@react-three/drei'),
      'framer-motion': path.resolve(__dirname, '../node_modules/framer-motion'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.wasm'],
    mainFields: ['browser', 'module', 'main'],
  },
  build: {
    target: 'esnext',
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('onchain-runtime-v3')) return 'wasm';
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      extensions: ['.js', '.cjs'],
      ignoreDynamicRequires: true,
    },
  },
  plugins: [
    react(),
    wasm(),
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: (i) => `__tla_${i}`,
    }),
    {
      name: 'wasm-module-resolver',
      resolveId(source, importer) {
        if (
          source === '@midnight-ntwrk/onchain-runtime-v3' &&
          importer &&
          importer.includes('@midnight-ntwrk/compact-runtime')
        ) {
          return {
            id: source,
            external: false,
            moduleSideEffects: true,
          };
        }
        return null;
      },
    },
  ],
  optimizeDeps: {
    rolldownOptions: {
      target: 'esnext',
      supported: { 'top-level-await': true },
      platform: 'browser',
      format: 'esm',
      loader: {
        '.wasm': 'binary',
      },
    },
    include: ['@midnight-ntwrk/compact-runtime'],
    exclude: [
      '@midnight-ntwrk/onchain-runtime-v3',
      '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm_bg.wasm',
      '@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm.js',
    ],
  },
  checks: {
    importIsUndefined: false,
    pluginTimings: false,
  },
});
