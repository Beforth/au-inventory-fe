import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env (all vars, no prefix filter) from the project root.
  const env = loadEnv(mode, '.', '');
  const proxyTarget = env.VITE_TALLY_PROXY_TARGET;

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: proxyTarget
        ? {
            '/api': { target: proxyTarget, changeOrigin: true },
            '/health': { target: proxyTarget, changeOrigin: true },
          }
        : undefined,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
