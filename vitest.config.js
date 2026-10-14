// Schnelle Logik-Tests ohne Browser (node). Browser-Tests: tests/e2e.
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/unit/**/*.test.js'], environment: 'node' } });
