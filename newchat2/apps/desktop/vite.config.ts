import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

const isTest = process.env.IS_TEST === 'true';

export default defineConfig({
  plugins: [
    react(),
    ...(!isTest ? [electron([
      { entry: 'electron/main.ts' },
      { entry: 'electron/preload.ts', onstart: (options) => options.reload() },
    ])] : []),
  ],
});
