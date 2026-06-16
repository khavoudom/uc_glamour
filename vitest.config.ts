import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  test: {
    globals: true,
    setupFiles: ['./lib/__tests__/setup.ts'],
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['lib/**', 'components/**', 'app/actions/**', 'store/**'],
      exclude: [
        'node_modules',
        '.next',
        'drizzle',
        '**/*.d.ts',
        '**/*.config.*',
        '**/__tests__/**',
        '**/mocks/**',
        'lib/db/index.ts',
        'lib/db/schema.ts',
        'store/chat-store.ts',
      ],
    },
  },
});
