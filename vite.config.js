import { defineConfig } from "vite";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
      reporter: ["html"],
      thresholds: {
        lines: 98,
        functions: 97,
        branches: 99,
        statements: 98,
      },
    },
  },
});
