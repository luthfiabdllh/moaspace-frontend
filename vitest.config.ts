import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/app/**',
        'src/components/ui/**',
        'src/components/layouts/**',
        'src/proxy.ts',
        'src/env.ts',
        'src/features/**/server-fetch.ts',
        'src/features/**/components/**',
        'src/features/**/use-mutations.ts',
        'src/features/**/use-queries.ts',
        'src/lib/verify-session.ts',
        'src/lib/api-client.ts',
        'src/lib/get-query-client.ts',
        'src/providers/**',
        'src/store/**',
        'src/test/**',
        '**/*.config.{ts,js}',
        '**/node_modules/**',
      ],
      thresholds: {
        // Applies to: types/, utils, query-keys, dictionaries, i18n
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
