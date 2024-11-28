import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { env } from 'process';

// Fonction pour vérifier si on est en environnement CI
const isCI = process.env.CI === 'true';

// Configuration HTTPS seulement si on n'est pas en CI
const getHttpsConfig = () => {
  if (isCI) return false;

  const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
      ? `${env.APPDATA}/ASP.NET/https`
      : `${env.HOME}/.aspnet/https`;

  const certificateName = 'lmsapp.client';
  const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
  const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

  if (fs.existsSync(certFilePath) && fs.existsSync(keyFilePath)) {
    return {
      key: fs.readFileSync(keyFilePath),
      cert: fs.readFileSync(certFilePath),
    };
  }

  return false;
};

// Configuration du serveur backend
const serverPort = env.ASPNETCORE_HTTPS_PORT || env.VITE_API_PORT || '7001';
const serverUrl = env.VITE_API_URL || `https://localhost:${serverPort}`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [plugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(
        new URL('./src/components', import.meta.url)
      ),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
    extensions: ['.js', '.jsx', '.json'],
    preserveSymlinks: true,
  },
  server: {
    proxy: {
      // Regrouper tous les endpoints API sous /api
      '^/api': {
        target: serverUrl,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        changeOrigin: true,
      },
    },
    port: 5173,
    https: getHttpsConfig(),
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
      },
    },
    outDir: 'dist',
  },
});
