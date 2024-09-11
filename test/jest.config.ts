import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  resetModules: true,
  clearMocks: true,
  rootDir: '../',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
  },
  testEnvironment: 'jest-environment-jsdom',
  coveragePathIgnorePatterns: ['jest.config.js', '/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^d3-((?!(interpolate-path)).*)': '<rootDir>/node_modules/d3-$1/dist/d3-$1',
    '^nanoid': '<rootDir>/node_modules/nanoid/index.cjs',
    '^@graphique/(.*)$': '<rootDir>/packages/$1/dist/index.cjs',
  },
  setupFilesAfterEnv: [
    '<rootDir>/test/jest.setup.ts',
    '@testing-library/jest-dom',
  ],
  roots: ['<rootDir>/packages/'],
  testPathIgnorePatterns: ['/__tests__/__data__', '/__tests__/shared'],
}

export default config
