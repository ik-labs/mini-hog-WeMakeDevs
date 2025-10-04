import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  splitting: false,
  treeshake: true,
  globalName: 'Minihog',
  target: 'es2020',
  platform: 'browser',
  banner: {
    js: '/* Minihog Analytics SDK v0.1.0 | MIT License */',
  },
});
