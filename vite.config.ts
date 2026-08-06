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
    // Proxy API calls during dev so the SPA talks same-origin (`/api/v1/...`)
    // and dodges CORS. Two targets because prod has ONE host but dev has TWO:
    // Kong routes by longest-prefix in prod (`/auth`, `/library`, `/tracking`
    // -> Django core; everything else -> Go backend), while in compose the two
    // services are separate containers.
    //
    // ORDER AND TRAILING SLASH BOTH MATTER. Vite matches prefixes in insertion
    // order, so the specific core prefixes must precede the `/api` catch-all.
    // And they must end in `/`: bare `/api/v1/auth` also prefix-matches
    // `/api/v1/authors`, which belongs to the Go backend — dropping the slash
    // silently routes the authors endpoint to Django and gets a 404.
    //
    // changeOrigin STAYS FALSE for the core routes. Rewriting Host to
    // `core:8000` trips Django's ALLOWED_HOSTS and every call comes back as a
    // DisallowedHost HTML page instead of JSON. Keeping the original Host
    // (`localhost:5573`) matches the `localhost` entry already in
    // DJANGO_ALLOWED_HOSTS, and mirrors how prod behaves — Kong forwards with
    // preserve_host: true, so Django always sees the public hostname. The Go
    // backend doesn't validate Host, which is why its route can leave the
    // default alone.
    proxy: {
      '/api/v1/auth/': {
        target: process.env.VITE_CORE_PROXY_TARGET || 'http://core:8000',
        changeOrigin: false,
      },
      '/api/v1/library/': {
        target: process.env.VITE_CORE_PROXY_TARGET || 'http://core:8000',
        changeOrigin: false,
      },
      '/api/v1/tracking/': {
        target: process.env.VITE_CORE_PROXY_TARGET || 'http://core:8000',
        changeOrigin: false,
      },
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://backend:8080',
        changeOrigin: true,
      },
    },
  },
})
