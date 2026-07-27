import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    rollupOptions: {
      output: {
        // Split the vendor half of the bundle so no single chunk trips Rollup's
        // 500 kB warning. Grouped by what actually gets imported (checked, not
        // guessed): react-i18next / lucide-react / react-router are the three
        // heaviest, and 26 distinct @radix-ui packages are in real use.
        // Everything here is import-time dependency of the first screen, so this
        // is a chunking change only — no lazy loading, no behaviour change.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          i18n: ['react-i18next', 'i18next'],
          icons: ['lucide-react'],
        },
      },
    },
  },

  // Dev server configuration optimized for Docker volume mount & HMR live reload
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Enables file change detection across macOS host <-> Docker container mounts
      interval: 100,
    },
    hmr: {
      clientPort: 5573, // Host exposed port for HMR WebSocket connection
    },
    // Proxy API calls to the Go backend during dev so the SPA talks same-origin
    // (`/api/v1/...`) and dodges CORS. Target overridable via VITE_API_PROXY_TARGET;
    // default hits the backend service inside the compose network. When running
    // the SPA on the host (vite outside Docker), set VITE_API_PROXY_TARGET=http://localhost:8480.
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://backend:8080',
        changeOrigin: true,
      },
    },
  },
})
