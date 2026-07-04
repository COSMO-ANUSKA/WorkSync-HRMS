import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/edge/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    environment: 'node',
    globals: false,
  },
});
