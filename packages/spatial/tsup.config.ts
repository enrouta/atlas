import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/models/index.ts',
    'src/propagation/index.ts',
    'src/aggregation/index.ts',
    'src/h3/index.ts',
    'src/proximity/index.ts',
    'src/partition/index.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
});
