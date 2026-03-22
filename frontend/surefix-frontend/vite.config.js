import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcssVite from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcssVite()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    define: {
        global: 'globalThis',
        __BUNDLED_DEV__: true,
        __SERVER_FORWARD_CONSOLE__: false
    },
    build: {
        target: 'esnext',
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});