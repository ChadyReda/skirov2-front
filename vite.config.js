import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
export default defineConfig({
    base: '/',
    plugins: [react()],
    resolve: {
        alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': { target: 'https://website-backend-skiro.vercel.app', changeOrigin: true },
            '/uploads': { target: 'https://website-backend-skiro.vercel.app', changeOrigin: true },
        },
    },
});