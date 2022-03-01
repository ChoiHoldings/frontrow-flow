module.exports = {
  displayName: 'blockchain-emulator',
  preset: '../../jest.preset.ts',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest',
    '^.+\\.(cdc)$': '<rootDir>/jest-file-transformer.js',
  },
  moduleFileExtensions: ['ts', 'js'],
  verbose: true,
  bail: true,
  testTimeout: 10000,
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageDirectory: '../../coverage/apps/flow',
  setupFilesAfterEnv: ['./jest-console.ts', './jest-setup.ts'],
}
