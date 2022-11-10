// jest.config.js
const nextJest = require("next/jest");

// import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias" to work
  moduleDirectories: ["node_modules", "<rootDir>/"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testEnvironment: "jest-environment-jsdom",
  testTimeout: 20000
};

// hack to remove node_modules from the transformIgnorePatterns
// that next/jest puts in there
// we ned this to get the firebase modules to compile
const jestConfig = async () => {
  const nextConfig = await createJestConfig(customJestConfig)();
  return {
    ...nextConfig,
    transformIgnorePatterns: ["^.+\\.module\\.(css|sass|scss)$"],
  };
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = jestConfig;
