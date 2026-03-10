import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: [
            path.resolve(__dirname, 'src/test/setup.ts'),
            path.resolve(__dirname, 'src/test/integration.setup.ts'),
        ],
    },
});
