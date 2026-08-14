import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Look for test files across all workspace packages
    include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    environment: 'node',
    globals: true,
  },
});