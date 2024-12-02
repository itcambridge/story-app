/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    environmentOptions: {
      env: {
        NODE_ENV: 'test'
      }
    },
    environmentMatchGlobs: [
      ['**', 'node']
    ],
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'build/'
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    silent: true,
    onConsoleLog: (log) => {
      if (log.includes('DeprecationWarning')) {
        return false;
      }
      return undefined;
    },
    pool: 'forks',
    poolOptions: {
      forks: {
        execArgv: ['--no-warnings']
      }
    }
  },
}); 