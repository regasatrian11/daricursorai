
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: false,
    cors: true,
    hmr: {
      port: 5173,
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom'],
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    // Supabase configuration - direct setup
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://dsxiymksrubpryxggyow.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzeGl5bWtzcnVicHJ5eGdneW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjI1MDYsImV4cCI6MjA3MzUzODUwNn0.jMnHpcZICTflmj9Kp5PuiWBDReWuBcv88O5SbwjUvDM'),
  },
});