import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        compression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 10240,
            deleteOriginFile: false,
        }),
    ],
    build: {
        assetsInlineLimit: 0,
    },
});
