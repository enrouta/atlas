// vitest.workspace.ts
import { defineConfig } from 'vitest/config';

export default [
  'packages/*',
  'apps/*',
  // Or inline config objects:
  defineConfig({
    test: {
      name: 'unit',
      include: ['**/*.test.ts'],
      environment: 'node',
    },
  }),
];