/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Test discovery
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],

  // Path aliases — must match tsconfig.json paths
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Set required environment variables BEFORE any module is imported.
  // This file runs in each worker process before test code is loaded.
  setupFiles: ["<rootDir>/tests/env.ts"],

  // Coverage
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",
    "!src/tests/**",
    "!src/**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches:   70,
      functions:  70,
      lines:      70,
      statements: 70,
    },
  },

  // Output
  verbose: true,
  forceExit: true,
  testTimeout: 30_000,
};

module.exports = config;
