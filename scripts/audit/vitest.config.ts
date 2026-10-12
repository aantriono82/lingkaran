import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/audit/audit-soal.test.ts'],
    environment: 'node'
  }
});
