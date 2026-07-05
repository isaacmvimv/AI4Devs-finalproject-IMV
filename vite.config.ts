import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  // Raíz del proyecto Vite: SPA bajo frontend/
  root: path.resolve(__dirname, 'frontend'),

  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.ANALYZE
      ? [visualizer({ open: true, filename: 'dist/stats.html' })]
      : []),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@radix-ui/react-avatar', '@radix-ui/react-dialog'],
        },
      },
    },
  },
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './frontend/src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Reenvía /api al servidor Express (npm run dev:api) para que fetch('/api/...') funcione en :5173.
  server: {
    proxy: {
      // /health vive sin prefijo /api; /api/profile sí lo usa — regla específica antes del catch-all.
      '/api/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: () => '/health',
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
